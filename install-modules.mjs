import { readFile } from 'fs/promises';
import { install } from 'esinstall';

// For details on this file, see:
// https://www.bryanbraun.com/2021/08/27/a-minimalist-development-workflow-using-es-modules-and-esinstall/
(async () => {
  const json = JSON.parse(
    await readFile(new URL('./package.json', import.meta.url)),
  );
  const { installOptions, install: moduleList } = json.esinstall;

  await install(moduleList, installOptions);
})();
