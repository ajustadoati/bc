// Run with: node scripts/check-vehicle-validation.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');

(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'bc-vehicle-check-'));
  let checks = 0;
  const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
  try {
    for (const name of ['vehicle.models', 'vehicle.validators']) {
      const source = await fs.readFile(path.join(root, 'src/app/vehiculos', `${name}.ts`), 'utf8');
      await fs.writeFile(path.join(temp, `${name}.mjs`), ts.transpileModule(source, { compilerOptions: {
        target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022
      } }).outputText);
    }
    await import(pathToFileURL(path.join(root, 'node_modules/@angular/compiler/fesm2022/compiler.mjs')));
    const { FormControl, Validators } = await import(pathToFileURL(path.join(root, 'node_modules/@angular/forms/fesm2022/forms.mjs')));
    const { normalizePlate, repeatedPlate, repeatedUnit, vehicleTypeLabel, vehiclePayload } = await import(pathToFileURL(path.join(temp, 'vehicle.models.mjs')));
    const { meaningfulText, unitNumber } = await import(pathToFileURL(path.join(temp, 'vehicle.validators.mjs')));
    for (const value of [1, '001', ' 12 ', 2147483647]) equal(new FormControl(value, [Validators.required, unitNumber]).valid, true);
    for (const value of [null, '', ' ', 0, -1, 1.5, '1e3', 'BUS-1', 2147483648, Infinity]) equal(new FormControl(value, [Validators.required, unitNumber]).valid, false);
    equal(new FormControl('   ', [Validators.required, meaningfulText]).valid, false);
    equal(new FormControl(' Transportes Norte ', [Validators.required, meaningfulText]).valid, true);
    equal(normalizePlate(' abc-123 '), 'ABC-123');
    equal(normalizePlate(null), '');
    const vehicles = [{ id: 1, numberId: '001', serial: ' ABC-123 ' }, { id: 2, numberId: 12, serial: 'DEF-456' }];
    equal(repeatedUnit(1, vehicles), true);
    equal(repeatedUnit('0001', vehicles), true);
    equal(repeatedUnit('001', vehicles, 1), false);
    equal(repeatedUnit(12, vehicles, 1), true);
    equal(repeatedUnit(3, vehicles), false);
    equal(repeatedPlate('abc-123', vehicles), true);
    equal(repeatedPlate('abc-123', vehicles, 1), false);
    equal(repeatedPlate('def-456', vehicles, 1), true);
    equal(repeatedPlate('', vehicles), false);
    equal(vehicleTypeLabel(1, [{id:1,type:'Bus urbano'}]), 'Bus urbano');
    equal(vehicleTypeLabel(7, []), 'Tipo #7');
    equal(vehicleTypeLabel(null, []), 'Sin clasificar');
    equal(vehiclePayload({ numberId:' 001 ', marca:' Mercedes-Benz ', model:' OF 1721 ', serial:' abc-123 ', company:' Transportes Norte ', vehicleType:2 }, 'OWNER-NUMBER-ID'), {
      numberId:1, marca:'Mercedes-Benz', model:'OF 1721', serial:'ABC-123', company:'Transportes Norte', vehicleType:2, userId:'OWNER-NUMBER-ID'
    });
    console.log(`${checks} comprobaciones de unidades, placas, duplicados y contrato de guardado: correctas.`);
  } finally { await fs.rm(temp, {recursive:true, force:true}); }
})().catch(error => { console.error(error); process.exitCode = 1; });
