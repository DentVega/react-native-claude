import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getClaudeCommandsDir } from '../lib/claude.js';
import { downloadRawFile, fetchLatestTag } from '../lib/github.js';
import { log } from '../lib/log.js';

const COMMAND_FILES = ['apply-template.md', 'update-template.md'];

export type InstallOptions = { force?: boolean; ref?: string };

export async function installCommand(options: InstallOptions = {}) {
  const dir = getClaudeCommandsDir();

  log.step('Resolviendo versión del template...');
  let ref: string;
  try {
    ref = options.ref ?? (await fetchLatestTag());
    log.info(`Versión a usar: ${ref}`);
  } catch (err) {
    log.error(`No se pudo resolver el último tag: ${(err as Error).message}`);
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });

  let installed = 0;
  let skipped = 0;

  for (const file of COMMAND_FILES) {
    const target = join(dir, file);
    if (existsSync(target) && !options.force) {
      log.warn(`Ya existe: ${target} — saltado (usá --force para sobrescribir)`);
      skipped++;
      continue;
    }

    try {
      const content = await downloadRawFile(`commands/${file}`, ref);
      writeFileSync(target, content, 'utf-8');
      log.success(`Instalado: ${target}`);
      installed++;
    } catch (err) {
      log.error(`Falló la descarga de ${file}: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  log.blank();
  log.info(`Instalados: ${installed}, saltados: ${skipped}.`);
  if (installed > 0) {
    log.blank();
    log.step('Siguiente paso:');
    log.hint('Dentro de un proyecto Expo, corré `claude` y tipea /apply-template');
  }
}
