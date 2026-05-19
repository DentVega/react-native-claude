import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getClaudeCommandsDir, getClaudeVersion } from '../lib/claude.js';
import { fetchLatestTag } from '../lib/github.js';
import { log } from '../lib/log.js';

export async function doctorCommand() {
  let ok = true;

  const nodeMajor = parseInt(process.version.slice(1).split('.')[0] ?? '0', 10);
  if (nodeMajor >= 18) {
    log.success(`Node: ${process.version}`);
  } else {
    log.error(`Node: ${process.version} (se requiere >= 18)`);
    ok = false;
  }

  try {
    const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
    log.success(`git: ${gitVersion}`);
  } catch {
    log.error('git: no encontrado');
    ok = false;
  }

  const claudeVersion = getClaudeVersion();
  if (claudeVersion) {
    log.success(`Claude Code: ${claudeVersion}`);
  } else {
    log.error('Claude Code: no encontrado en PATH');
    log.hint('Instalación: https://docs.claude.com/en/docs/claude-code');
    ok = false;
  }

  const commandsDir = getClaudeCommandsDir();
  const hasApply = existsSync(join(commandsDir, 'apply-template.md'));
  const hasUpdate = existsSync(join(commandsDir, 'update-template.md'));
  if (hasApply && hasUpdate) {
    log.success(`Slash commands: instalados en ${commandsDir}`);
  } else {
    log.warn('Slash commands: faltan en ~/.claude/commands/');
    log.hint('Instalá: expo-config-template install');
    ok = false;
  }

  try {
    const tag = await fetchLatestTag();
    log.success(`Último release del template: ${tag}`);
  } catch (err) {
    log.warn(`No se pudo consultar GitHub: ${(err as Error).message}`);
  }

  log.blank();
  if (ok) {
    log.success('Todo en orden.');
  } else {
    log.error('Faltan dependencias. Revisá las recomendaciones arriba.');
    process.exit(1);
  }
}
