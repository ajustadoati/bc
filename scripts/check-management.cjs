// Run with: node scripts/check-management.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'bc-management-check-'));
  let checks = 0;
  const equal = (a, b) => { assert.deepEqual(a, b); checks++; };
  try {
    await fs.symlink(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), 'dir');
    for (const [name, relative] of Object.entries({ management: 'src/app/shared/management.models.ts', operators: 'src/app/operadores/operator.models.ts', service: 'src/app/services/operador.service.ts' })) {
      const source = await fs.readFile(path.join(root, relative), 'utf8');
      const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, experimentalDecorators: true } }).outputText
        .replace("'../shared/management.models'", "'./management.mjs'")
        .replace("'src/environments/environment'", "'./environment.mjs'");
      await fs.writeFile(path.join(temp, `${name}.mjs`), output);
    }
    await fs.writeFile(path.join(temp, 'environment.mjs'), "export const environment = { baseUrl: 'http://example.invalid' };");
    await import(pathToFileURL(path.join(root, 'node_modules/@angular/compiler/fesm2022/compiler.mjs')));
    const { FormControl } = await import(pathToFileURL(path.join(root, 'node_modules/@angular/forms/fesm2022/forms.mjs')));
    const { of, firstValueFrom, throwError } = require('rxjs');
    const { requiredText, contactPhone, phoneHref, emailHref, searchKey } = await import(pathToFileURL(path.join(temp, 'management.mjs')));
    const { operatorName, operatorInitials, roleLabel, repeatedIdentity, visibleOperators } = await import(pathToFileURL(path.join(temp, 'operators.mjs')));
    const { OperadorService } = await import(pathToFileURL(path.join(temp, 'service.mjs')));
    equal(requiredText(new FormControl('   ')), { requiredText: true });
    equal(requiredText(new FormControl('María')), null);
    for (const value of ['', '+58 412 123 4567', '0212-1234567', '(0212) 123.4567']) equal(contactPhone(new FormControl(value)), null);
    for (const value of ['abc1234567', '123', '1'.repeat(16), '++584121234567']) equal(contactPhone(new FormControl(value)), { contactPhone: true });
    equal(phoneHref('+58 412 123 4567'), 'tel:+584121234567');
    equal(phoneHref('javascript:1234567'), null);
    equal(phoneHref(null), null);
    equal(emailHref('persona@example.com'), 'mailto:persona%40example.com');
    equal(emailHref('correo incorrecto'), null);
    equal(searchKey('  Andrés García '), 'andres garcia');
    const team = [{id:1,firstName:'Andrés',lastName:'García',numberId:' V-1 ',type:'CONDUCTOR'}, {id:2,firstName:'María',lastName:'Pérez',numberId:'V-2',type:'COLECTOR'}, {id:3,firstName:'Admin',lastName:'Demo',numberId:'V-3',type:'ADMIN'}];
    equal(operatorName(team[0]), 'Andrés García');
    equal(operatorInitials(team[1]), 'MP');
    equal(operatorInitials({}), 'OP');
    equal(roleLabel('CONDUCTOR'), 'Conductor');
    equal(repeatedIdentity('v-1', team), true);
    equal(repeatedIdentity('', team), false);
    equal(visibleOperators(team).map(item=>item.id), [1,2]);
    equal(visibleOperators(team,'andres').map(item=>item.id), [1]);
    equal(visibleOperators(team,'','COLECTOR').map(item=>item.id), [2]);
    equal(visibleOperators(team,'v-3'), []);
    const requests = [];
    const responses = [
      {_embedded:{collection:[team[0]]},page:{number:0,totalPages:3},_links:{next:{href:'http://example.invalid/api/users'}}},
      {_embedded:{userDtoList:[team[1]]},page:{number:1,totalPages:3}},
      {page:{number:2,totalPages:3}}
    ];
    const service = new OperadorService({ get: (url, options) => { requests.push({url,options}); return of(responses[Number(options.params.page)]); } });
    equal((await firstValueFrom(service.getOperadores('42'))).map(item=>item.id), [1,2]);
    equal(requests.map(item=>item.url), Array(3).fill('http://example.invalid/api/users/42/company'));
    equal(requests.map(item=>item.options.params.page), ['0','1','2']);
    equal(requests.map(item=>item.options.params.sort), Array(3).fill('userId,asc'));
    equal(await firstValueFrom(new OperadorService({get:()=>of({})}).getOperadores('42')), []);
    const failureService = new OperadorService({get:(_url,options)=>options.params.page==='0'?of(responses[0]):throwError(()=>new Error('Page failed'))});
    await assert.rejects(firstValueFrom(failureService.getOperadores('42')), /Page failed/); checks++;
    console.log(`${checks} comprobaciones de contactos, validaciones, filtros y paginación de empresa: correctas.`);
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
})().catch(error=>{console.error(error);process.exitCode=1;});
