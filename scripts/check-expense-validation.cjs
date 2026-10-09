// Run with: node scripts/check-expense-validation.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'bc-expense-check-'));
  let checks = 0;
  const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
  try {
    await fs.symlink(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), 'dir');
    for (const [name, relative] of Object.entries({
      'expense.models': 'src/app/gastos/expense.models.ts',
      'expense.validators': 'src/app/gastos/expense.validators.ts',
      'income.models': 'src/app/ingresos/income.models.ts',
      'income.validators': 'src/app/ingresos/income.validators.ts'
    })) {
      const source = await fs.readFile(path.join(root, relative), 'utf8');
      const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
        .replace("'../ingresos/income.validators'", "'./income.validators.mjs'")
        .replace("'./income.models'", "'./income.models.mjs'");
      await fs.writeFile(path.join(temp, `${name}.mjs`), output);
    }
    await import(pathToFileURL(path.join(root, 'node_modules/@angular/compiler/fesm2022/compiler.mjs')));
    const { FormControl, FormGroup } = await import(pathToFileURL(path.join(root, 'node_modules/@angular/forms/fesm2022/forms.mjs')));
    const { expensePayload, validVehicleId } = await import(pathToFileURL(path.join(temp, 'expense.models.mjs')));
    const { nonNegativeMoney, odometerReading, expenseAmountRequired } = await import(pathToFileURL(path.join(temp, 'expense.validators.mjs')));
    const { validOperatingDate } = await import(pathToFileURL(path.join(temp, 'income.validators.mjs')));
    const { localDateKey } = await import(pathToFileURL(path.join(temp, 'income.models.mjs')));
    for (const value of [null,'',0,'0',12.5,'12.50',0.01]) equal(nonNegativeMoney(new FormControl(value)), null);
    equal(nonNegativeMoney(new FormControl(-1)), { negativeAmount: true });
    equal(nonNegativeMoney(new FormControl(0.001)), { moneyPrecision: true });
    for (const value of [NaN,Infinity,'invalid']) equal(nonNegativeMoney(new FormControl(value)), { invalidAmount: true });
    for (const value of [null,'',0,100,2147483647]) equal(odometerReading(new FormControl(value)), null);
    for (const value of [-1,0.5,2147483648,Infinity]) equal(odometerReading(new FormControl(value)), { odometerReading: true });
    const amountGroup = new FormGroup({amountDl:new FormControl(null),amount:new FormControl(null),labour:new FormControl(20)}, {validators:expenseAmountRequired});
    equal(amountGroup.errors, {missingAmount:true});
    amountGroup.patchValue({amountDl:0,amount:0});equal(amountGroup.errors, {missingAmount:true});
    amountGroup.patchValue({amountDl:0.01});equal(amountGroup.errors, null);
    amountGroup.patchValue({amountDl:null,amount:100});equal(amountGroup.errors, null);
    equal(validOperatingDate(new FormControl(localDateKey())), null);
    equal(validOperatingDate(new FormControl('2024-02-29')), null);
    equal(validOperatingDate(new FormControl('2025-02-29')), {invalidDate:true});
    equal(validOperatingDate(new FormControl('9999-12-31')), {futureDate:true});
    for (const value of [null,'',0,-1,'1.5','bus',2147483648]) equal(validVehicleId(value), null);
    equal(validVehicleId('001'), 1);equal(validVehicleId(2147483647), 2147483647);
    const payload = expensePayload({categoryId:2,expenseTypeId:3,workshopId:null,expenseDate:'2026-01-20',description:'  Aceite y filtro  ',kilometer:0,amount:null,amountDl:125.5,labour:0},7);
    equal(payload, {vehicleId:7,expenseTypeId:3,workshopId:null,expenseDate:'2026-01-20',description:'Aceite y filtro',kilometer:0,amount:null,amountDl:125.5,labour:0});
    equal('categoryId' in payload, false);
    console.log(`${checks} comprobaciones de importes, fechas, kilometraje, vehículo y contrato del gasto: correctas.`);
  } finally { await fs.rm(temp,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
