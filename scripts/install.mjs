import { lstatSync, mkdirSync, readdirSync, realpathSync, renameSync, symlinkSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';

function stat(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function physicalPath(path) {
  try {
    return realpathSync(path);
  } catch (error) {
    if (error.code !== 'ENOENT' || stat(path)) {
      throw error;
    }
    return join(physicalPath(dirname(path)), basename(path));
  }
}

function contains(parent, child) {
  const path = relative(parent, child);
  return path === '' || (path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
}

function disjoint(left, right) {
  if (contains(left, right) || contains(right, left)) {
    throw new Error('Directories must not contain each other: ' + left + ' / ' + right);
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      target: { type: 'string' },
      replace: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });
  if (values.help) {
    console.log('node scripts/install.mjs --target <skills-directory> [--dry-run] [--replace]');
    return;
  }
  if (!values.target?.trim()) {
    throw new Error('--target <skills-directory> is required; no configuration is guessed.');
  }

  const repository = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const target = physicalPath(resolve(values.target));
  disjoint(repository, target);
  if (stat(target) && !stat(target).isDirectory()) {
    throw new Error('Target is not a directory: ' + target);
  }
  const sourceRoot = join(repository, 'skills');
  const skills = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  if (skills.length === 0) {
    throw new Error('No skills found in ' + sourceRoot);
  }

  const plan = skills.map(({ name }) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
      throw new Error('Invalid skill directory: ' + name);
    }
    const source = realpathSync(join(sourceRoot, name));
    if (!contains(sourceRoot, source) || !stat(join(source, 'SKILL.md'))?.isFile()) {
      throw new Error('Missing standalone skill: ' + source);
    }
    const destination = join(target, name);
    const existing = stat(destination);
    let unchanged = false;
    if (existing?.isSymbolicLink()) {
      try {
        unchanged = relative(realpathSync(destination), source) === '';
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
    return { name, source, destination, action: unchanged ? 'unchanged' : existing ? 'replace' : 'link' };
  });
  const conflicts = plan.filter((item) => item.action === 'replace');
  if (conflicts.length && !values.replace) {
    throw new Error('Existing skills: ' + conflicts.map((item) => item.name).join(', ') +
      '. Use --replace to preserve them in a backup and install links. Nothing changed.');
  }
  const backupRoot = conflicts.length
    ? join(dirname(target), basename(target) + '-leinoskills-backup-' +
      new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8))
    : null;
  if (backupRoot) {
    disjoint(repository, backupRoot);
    disjoint(target, backupRoot);
  }
  if (values['dry-run']) {
    console.log(JSON.stringify({ target, backupRoot, dryRun: true, skills: plan }, null, 2));
    return;
  }

  mkdirSync(target, { recursive: true });
  if (backupRoot) {
    mkdirSync(backupRoot);
  }
  for (const item of plan) {
    const backup = item.action === 'replace' ? join(backupRoot, item.name) : null;
    if (backup) {
      renameSync(item.destination, backup);
    }
    try {
      if (item.action !== 'unchanged') {
        symlinkSync(item.source, item.destination, process.platform === 'win32' ? 'junction' : 'dir');
      }
    } catch (error) {
      if (backup && !stat(item.destination)) {
        renameSync(backup, item.destination);
      }
      throw new Error('Could not link ' + item.name + '; inspect ' + item.destination +
        (backup ? ' and backup ' + backup : '') + '. Earlier links are safe to replay.', { cause: error });
    }
    console.log(JSON.stringify({ ...item, backup }));
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  if (error.cause) {
    console.error(error.cause.message);
  }
  process.exitCode = 1;
}
