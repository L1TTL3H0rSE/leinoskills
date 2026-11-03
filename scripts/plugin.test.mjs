import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const manifest = readJson('plugin.json');

test('portable and Claude manifests describe the same release', () => {
  const { $schema, ...portable } = manifest;
  assert.equal($schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.match(portable.version, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(readJson('.claude-plugin/plugin.json'), portable);
});

test('both marketplaces resolve to the shared skill package', () => {
  const codex = readJson('.agents/plugins/marketplace.json');
  const claude = readJson('.claude-plugin/marketplace.json');
  assert.equal(codex.name, claude.name);
  for (const catalog of [codex, claude]) {
    assert.equal(catalog.plugins.length, 1);
    const [entry] = catalog.plugins;
    assert.equal(entry.name, manifest.name);
    const source = typeof entry.source === 'string' ? entry.source : entry.source.path;
    assert.equal(resolve(root, source), resolve(root));
  }
  assert.equal(codex.plugins[0].source.source, 'local');
  assert.equal(codex.plugins[0].policy.installation, 'AVAILABLE');
  const skills = readdirSync(join(root, 'skills'), { withFileTypes: true });
  assert.ok(skills.length > 0);
  for (const skill of skills) {
    assert.ok(skill.isDirectory());
    assert.ok(statSync(join(root, 'skills', skill.name, 'SKILL.md')).isFile());
  }
});
