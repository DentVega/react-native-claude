import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function getClaudeCommandsDir(): string {
  return join(homedir(), '.claude', 'commands');
}

export function isClaudeInstalled(): boolean {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function getClaudeVersion(): string | null {
  try {
    return execSync('claude --version', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}
