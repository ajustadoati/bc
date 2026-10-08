// Run with: node scripts/check-income-detail.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'bc-income-detail-check-'));
  try {
    const sources = {
      'income.models': 'src/app/ingresos/income.models.ts',
      'income-detail.models': 'src/app/ingresos/detalle/detalle/income-detail.models.ts'
    };
    for (const [name, sourcePath] of Object.entries(sources)) {
      const source = await fs.readFile(path.join(root, sourcePath), 'utf8');
      const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
        .replace("'../../income.models'", "'./income.models.mjs'");
      await fs.writeFile(path.join(temp, `${name}.mjs`), output);
    }
    const { incomeBreakdown, incomeShare } = await import(pathToFileURL(path.join(temp, 'income-detail.models.mjs')));
    const { sumIncomeAmounts, operatingDate, traveledKilometers } = await import(pathToFileURL(path.join(temp, 'income.models.mjs')));
    const items = [{ paymentTypeId: 1, amount: '120.25' }, { paymentTypeId: 2, amount: '45.50' }];
    const before = JSON.stringify(items);
    const rows = incomeBreakdown(items, [{ paymentTypeId: 1, paymentTypeName: 'Efectivo' }]);
    assert.equal(rows[0].label, 'Efectivo');
    assert.equal(rows[0].amount, 120.25);
    assert.equal(rows[1].label, 'Tipo de pago #2');
    assert.equal(rows[1].amount, 45.5);
    assert.equal(JSON.stringify(items), before);
    assert.equal(sumIncomeAmounts(rows), 165.75);
    assert.equal(incomeBreakdown([{ paymentTypeId: '1', amount: 0.1 }], [{ paymentTypeId: 1, paymentTypeName: 'Efectivo' }])[0].label, 'Efectivo');
    assert.deepEqual(incomeBreakdown([], []), []);
    assert.equal(incomeShare(0, 100), 0);
    assert.equal(incomeShare(25, 100), 25);
    assert.equal(incomeShare(100, 100), 100);
    assert.equal(incomeShare(0, 0), null);
    assert.equal(incomeShare(-10, 100), null);
    assert.equal(incomeShare(150, 100), null);
    assert.equal(incomeShare(10, -100), null);
    assert.equal(incomeShare(Infinity, 100), null);
    assert.equal(incomeShare(10, NaN), null);
    assert.equal(operatingDate('2026-10-08T00:00:00.000Z'), '2026-10-08');
    assert.equal(traveledKilometers(0, 180), 180);
    assert.equal(traveledKilometers(0, 0), 0);
    assert.equal(traveledKilometers(null, 180), null);
    console.log('21 comprobaciones del desglose, porcentajes, fecha y kilometraje: correctas.');
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
