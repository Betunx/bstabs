#!/usr/bin/env node
/**
 * Guard de pre-deploy.
 * Aborta el deploy si el repo está sucio o sin pushear, para que nunca
 * se publique algo que no está en git (causa del bug "deployé la UI vieja").
 *
 * Override de emergencia:  ALLOW_DIRTY_DEPLOY=1 pnpm ... run deploy
 */
import { execSync } from 'node:child_process';

const allow = process.env.ALLOW_DIRTY_DEPLOY === '1';
const git = (c) => execSync(c, { encoding: 'utf8' }).trim();
const fail = (msg) => {
  console.error(`\n\x1b[31m✗ Deploy abortado:\x1b[0m ${msg}`);
  console.error('  Arregla esto y reintenta, o fuerza con ALLOW_DIRTY_DEPLOY=1\n');
  process.exit(1);
};

try {
  git('git rev-parse --is-inside-work-tree');
} catch {
  fail('no es un repo git.');
}

// 1) Working tree limpio (los environment.*.ts gitignored NO cuentan)
const dirty = git('git status --porcelain');
if (dirty && !allow) {
  fail(`hay cambios sin commitear:\n${dirty.split('\n').map((l) => '    ' + l).join('\n')}`);
}

// 2) Rama actual sincronizada con su remoto
let upstream;
try {
  upstream = git('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
} catch {
  if (!allow) fail('la rama actual no tiene upstream (haz push primero).');
}
if (upstream && !allow) {
  const ahead = git(`git rev-list --count ${upstream}..HEAD`);
  const behind = git(`git rev-list --count HEAD..${upstream}`);
  if (ahead !== '0') fail(`tienes ${ahead} commit(s) sin pushear a ${upstream}.`);
  if (behind !== '0') fail(`estás ${behind} commit(s) atrás de ${upstream} (haz pull).`);
}

const branch = git('git rev-parse --abbrev-ref HEAD');
console.log(`\x1b[32m✓ Repo limpio y sincronizado\x1b[0m (rama: ${branch}). Continuando deploy...`);
