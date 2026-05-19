import { Command } from 'commander';

import { applyCommand } from './commands/apply.js';
import { doctorCommand } from './commands/doctor.js';
import { installCommand } from './commands/install.js';
import { updateCommand } from './commands/update.js';
import { log } from './lib/log.js';
import { CLI_VERSION } from './lib/version.js';

const program = new Command();

program
  .name('expo-config-template')
  .description('Launcher para aplicar el expo-config-template via Claude Code')
  .version(CLI_VERSION, '-v, --version', 'mostrar la versión del CLI');

program
  .command('install')
  .description('Instalar los slash commands en ~/.claude/commands/')
  .option('--force', 'sobrescribir si ya existen')
  .option('--ref <ref>', 'tag o branch del template (default: último release)')
  .action(async (opts: { force?: boolean; ref?: string }) => {
    await installCommand(opts);
  });

program
  .command('apply [version]')
  .description('Validar el proyecto y guiar a /apply-template')
  .action(async (version?: string) => {
    await applyCommand(version);
  });

program
  .command('update [version]')
  .description('Validar y guiar la actualización del template')
  .action(async (version?: string) => {
    await updateCommand(version);
  });

program
  .command('doctor')
  .description('Verificar requisitos: Claude Code, Node, git, slash commands')
  .action(async () => {
    await doctorCommand();
  });

program.parseAsync().catch((err) => {
  log.error((err as Error).message);
  process.exit(1);
});
