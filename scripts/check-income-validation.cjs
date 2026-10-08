// Run with: node scripts/check-income-validation.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');

(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'bc-income-check-'));
  try {
    for (const name of ['income.models', 'income.validators']) {
      const source = await fs.readFile(path.join(root, 'src/app/ingresos', `${name}.ts`), 'utf8');
      const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
        .replace("'./income.models'", "'./income.models.mjs'");
      await fs.writeFile(path.join(temp, `${name}.mjs`), output);
    }
    await import(pathToFileURL(path.join(root, 'node_modules/@angular/compiler/fesm2022/compiler.mjs')));
    const { FormControl, FormGroup } = await import(pathToFileURL(path.join(root, 'node_modules/@angular/forms/fesm2022/forms.mjs')));
    const { sumIncomeAmounts, operatingDate, traveledKilometers, localDateKey } = await import(pathToFileURL(path.join(temp, 'income.models.mjs')));
    const { moneyPrecision, validOperatingDate, jornadaValidator } = await import(pathToFileURL(path.join(temp, 'income.validators.mjs')));
    assert.equal(sumIncomeAmounts([{ amount: '120.25' }, { amount: '0.10' }, { amount: 0.2 }]), 120.55);
    assert.equal(sumIncomeAmounts([]), 0);
    assert.equal(sumIncomeAmounts([{ amount: 'invalid' }, { amount: null }]), 0);
    assert.equal(operatingDate('2026-10-08T00:00:00.000Z'), '2026-10-08');
    assert.equal(traveledKilometers(0, 180), 180);
    assert.equal(traveledKilometers(100, 100), 0);
    assert.equal(traveledKilometers(null, 100), null);
    assert.equal(traveledKilometers(200, 100), null);
    for (const value of [null, '', 1.2, '0.01', 100.99]) assert.equal(moneyPrecision(new FormControl(value)), null);
    for (const value of [1.001, 'invalid', Infinity]) assert.deepEqual(moneyPrecision(new FormControl(value)), { moneyPrecision: true });
    assert.equal(validOperatingDate(new FormControl(localDateKey())), null);
    assert.equal(validOperatingDate(new FormControl('2024-02-29')), null);
    assert.deepEqual(validOperatingDate(new FormControl('2025-02-29')), { invalidDate: true });
    assert.deepEqual(validOperatingDate(new FormControl('9999-12-31')), { futureDate: true });
    const group = new FormGroup({ kilometerStart: new FormControl(null), kilometerEnd: new FormControl(null), userDriverId: new FormControl(1), userSecondDriverId: new FormControl(null) }, { validators: jornadaValidator });
    assert.equal(group.errors, null);
    group.patchValue({ kilometerStart: 0 });
    assert.deepEqual(group.errors, { incompleteKilometers: true });
    group.patchValue({ kilometerEnd: 180 });
    assert.equal(group.errors, null);
    group.patchValue({ kilometerStart: 200 });
    assert.deepEqual(group.errors, { kilometerOrder: true });
    group.patchValue({ kilometerStart: 0, userSecondDriverId: 1 });
    assert.deepEqual(group.errors, { sameDriver: true });
    group.patchValue({ userSecondDriverId: 2 });
    assert.equal(group.errors, null);
    console.log('26 comprobaciones de importes, fechas, kilometraje y operadores: correctas.');
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
