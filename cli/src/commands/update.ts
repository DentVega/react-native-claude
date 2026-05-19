import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getClaudeCommandsDir, isClaudeInstalled } from '../lib/claude.js';
import { log } from '../lib/log.js';
import { detectProject } from '../lib/project.js';

export async function updateCommand(version?: string) {
  const project = detectProject();

  if (!project.isNodeProject || !project.isExpo) {
    log.error('Este directorio no parece un proyecto Expo.');
    process.exit(1);
  }

  if (!project.hasTemplateApplied) {
    log.error('No encuentro .template-version. Este proyecto no tiene el template aplicado.');
    log.hint('Aplicá primero: expo-config-template apply');
    process.exit(1);
  }

  if (!isClaudeInstalled()) {
    log.error('No encuentro `claude` en PATH.');
    log.hint('Instalá Claude Code: https://docs.claude.com/en/docs/claude-code');
    process.exit(1);
  }

  const commandFile = join(getClaudeCommandsDir(), 'update-template.md');
  if (!existsSync(commandFile)) {
    log.error(`No encuentro ${commandFile}.`);
    log.hint('Instalá los slash commands: expo-config-template install');
    process.exit(1);
  }

  log.success('Proyecto Expo con template aplicado.');

  const slashCmd = version ? `/update-template ${version}` : '/update-template';
  log.blank();
  log.step('Siguiente paso:');
  log.hint('1. Corré: claude');
  log.hint(`2. Tipeá: ${slashCmd}`);
}
