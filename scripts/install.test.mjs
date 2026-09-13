import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function fixture(t) {
  const parent = realpathSync(tmpdir());
  const root = mkdtempSync(join(parent, 'leinoskills-test-'));
  const repository = join(root, 'repository');
  const installer = join(repository, 'scripts', 'install.mjs');
  mkdirSync(dirname(installer), { recursive: true });
  copyFileSync(fileURLToPath(new URL('install.mjs', import.meta.url)), installer);
  for (const name of ['alpha', 'beta']) {
    mkdirSync(join(repository, 'skills', name), { recursive: true });
    writeFileSync(join(repository, 'skills', name, 'SKILL.md'), name + '\n');
  }
  t.after(() => {
    const path = relative(parent, realpathSync(root));
    assert.ok(path && path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
    rmSync(root, { recursive: true });
  });
  const target = join(root, 'consumer', 'skills');
  function run(...args) {
    const result = spawnSync(process.execPath, [installer, '--target', target, ...args], {
      encoding: 'utf8',
      cwd: root,
    });
    assert.ifError(result.error);
    return result;
  }
  return { root, repository, target, run };
}

test('fresh install shares source, preserves unrelated skills, and replays without writes', (t) => {
  const { repository, target, run } = fixture(t);
  mkdirSync(join(target, 'unrelated'), { recursive: true });
  writeFileSync(join(target, 'unrelated', 'keep.txt'), 'keep');
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  for (const name of ['alpha', 'beta']) {
    assert.ok(lstatSync(join(target, name)).isSymbolicLink());
    assert.equal(realpathSync(join(target, name)), realpathSync(join(repository, 'skills', name)));
  }
  writeFileSync(join(repository, 'skills', 'alpha', 'SKILL.md'), 'edited\n');
  assert.equal(readFileSync(join(target, 'alpha', 'SKILL.md'), 'utf8'), 'edited\n');
  assert.equal(readFileSync(join(target, 'unrelated', 'keep.txt'), 'utf8'), 'keep');
  const replay = run();
  assert.equal(replay.status, 0, replay.stderr);
  assert.deepEqual(replay.stdout.trim().split('\n').map((line) => JSON.parse(line).action), ['unchanged', 'unchanged']);
  assert.deepEqual(readdirSync(dirname(target)), ['skills']);
});

test('dry-run creates no target or backup', (t) => {
  const { target, run } = fixture(t);
  const result = run('--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).skills.length, 2);
  assert.equal(existsSync(dirname(target)), false);
});

test('conflicts are checked for every skill before any install', (t) => {
  const { target, run } = fixture(t);
  mkdirSync(join(target, 'beta'), { recursive: true });
  writeFileSync(join(target, 'beta', 'SKILL.md'), 'original\n');
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Existing skills: beta/);
  assert.equal(existsSync(join(target, 'alpha')), false);
  assert.equal(readFileSync(join(target, 'beta', 'SKILL.md'), 'utf8'), 'original\n');
  assert.deepEqual(readdirSync(dirname(target)), ['skills']);
});

test('replace backs up complete previous copies outside discovery and preserves them on replay', (t) => {
  const { target, run } = fixture(t);
  mkdirSync(join(target, 'alpha', 'agents'), { recursive: true });
  writeFileSync(join(target, 'alpha', 'SKILL.md'), 'original\n');
  writeFileSync(join(target, 'alpha', 'agents', 'openai.yaml'), 'original metadata\n');
  const preview = run('--replace', '--dry-run');
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(JSON.parse(preview.stdout).skills[0].action, 'replace');
  assert.deepEqual(readdirSync(dirname(target)), ['skills']);
  const result = run('--replace');
  assert.equal(result.status, 0, result.stderr);
  const backup = JSON.parse(result.stdout.split('\n')[0]).backup;
  assert.equal(dirname(dirname(backup)), dirname(target));
  assert.equal(readFileSync(join(backup, 'SKILL.md'), 'utf8'), 'original\n');
  assert.equal(readFileSync(join(backup, 'agents', 'openai.yaml'), 'utf8'), 'original metadata\n');
  const names = readdirSync(dirname(target));
  const replay = run('--replace');
  assert.equal(replay.status, 0, replay.stderr);
  assert.deepEqual(readdirSync(dirname(target)), names);
});

test('replace preserves an existing link and its external source', (t) => {
  const { root, target, run } = fixture(t);
  const external = join(root, 'previous');
  mkdirSync(external);
  writeFileSync(join(external, 'SKILL.md'), 'external original\n');
  mkdirSync(target, { recursive: true });
  symlinkSync(external, join(target, 'alpha'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = run('--replace');
  assert.equal(result.status, 0, result.stderr);
  const backup = JSON.parse(result.stdout.split('\n')[0]).backup;
  assert.ok(lstatSync(backup).isSymbolicLink());
  assert.equal(realpathSync(backup), realpathSync(external));
  assert.equal(readFileSync(join(external, 'SKILL.md'), 'utf8'), 'external original\n');
});

test('rejects overlapping source and target, including directory aliases', (t) => {
  const { root, repository, run } = fixture(t);
  const alias = join(root, 'alias');
  symlinkSync(repository, alias, process.platform === 'win32' ? 'junction' : 'dir');
  for (const target of [root, repository, join(repository, 'new'), join(alias, 'new')]) {
    const result = run('--target', target, '--replace');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must not contain each other/);
  }
  assert.equal(existsSync(join(repository, 'new')), false);
});
