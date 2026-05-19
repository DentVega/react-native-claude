import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';

export type ProjectInfo = {
  isNodeProject: boolean;
  isExpo: boolean;
  hasTemplateApplied: boolean;
  packageManager: PackageManager | null;
};

export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const pkgPath = join(cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    return {
      isNodeProject: false,
      isExpo: false,
      hasTemplateApplied: false,
      packageManager: null,
    };
  }

  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    return {
      isNodeProject: true,
      isExpo: false,
      hasTemplateApplied: false,
      packageManager: detectPackageManager(cwd),
    };
  }

  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  return {
    isNodeProject: true,
    isExpo: 'expo' in allDeps,
    hasTemplateApplied: existsSync(join(cwd, '.template-version')),
    packageManager: detectPackageManager(cwd),
  };
}

function detectPackageManager(cwd: string): PackageManager | null {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
  return null;
}
