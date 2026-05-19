import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getClaudeCommandsDir, isClaudeInstalled } from '../lib/claude.js';
import { log } from '../lib/log.js';
import { detectProject } from '../lib/project.js';

export async function applyCommand(version?: string) {
  const project = detectProject();

  if (!project.isNodeProject) {
    log.error('No se detectó package.json. Corré el comando desde la raíz de un proyecto Node.');
    process.exit(1);
  }

  if (!project.isExpo) {
    log.error('Este proyecto no tiene la dependencia `expo`. El template es solo para apps Expo.');
    process.exit(1);
  }

  if (project.hasTemplateApplied) {
    log.error('Este proyecto ya tiene el template aplicado (existe .template-version).');
    log.hint('Para actualizar, usá: expo-config-template update');
    process.exit(1);
  }

  if (!isClaudeInstalled()) {
    log.error('No encuentro `claude` en PATH.');
    log.hint('Instalá Claude Code: https://docs.claude.com/en/docs/claude-code');
    process.exit(1);
  }

  const commandFile = join(getClaudeCommandsDir(), 'apply-template.md');
  if (!existsSync(commandFile)) {
    log.error(`No encuentro ${commandFile}.`);
    log.hint('Instalá los slash commands primero: expo-config-template install');
    process.exit(1);
  }

  log.success('Proyecto Expo detectado.');
  if (project.packageManager) {
    log.info(`Gestor de paquetes: ${project.packageManager}`);
  }

  const slashCmd = version ? `/apply-template ${version}` : '/apply-template';
  log.blank();
  log.step('Siguiente paso:');
  log.hint('1. Corré: claude');
  log.hint(`2. Tipeá: ${slashCmd}`);
  log.blank();
  log.hint('Claude validará, te preguntará lo mínimo y aplicará el template.');
}
