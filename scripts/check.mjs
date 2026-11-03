import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skillsRoot = join(root, 'skills');
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
let count = 0;

function within(parent, child) {
  const path = relative(parent, child);
  return path === '' || (path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
}

function check(path) {
  const content = decoder.decode(readFileSync(path));
  const label = relative(root, path);
  if (content.startsWith('\uFEFF') || content.includes('\r') || !content.endsWith('\n')) {
    throw new Error(label + ': use UTF-8 without BOM, LF, and a final newline');
  }
  if (!path.endsWith('.md')) {
    return;
  }
  const inSkill = within(skillsRoot, path);
  if (inSkill && /(?:\.codex[\\/]|\.claude[\\/]|agents\/openai\.yaml|functions\.exec|mcp__|\b[A-Za-z]:[\\/])/.test(content)) {
    throw new Error(label + ': move machine paths and provider integration out of the skill');
  }
  if (path.endsWith(sep + 'SKILL.md')) {
    // This repository uses a deliberately small, valid YAML subset, not a general YAML parser.
    const match = /^---\nname: ([a-z0-9]+(?:-[a-z0-9]+)*)\ndescription: ("[^\n]*")\n---\n\n(\S[\s\S]*)$/.exec(content);
    if (!match) {
      throw new Error(label + ': expected plain name and JSON-quoted description frontmatter');
    }
    const [, name, encodedDescription] = match;
    const description = JSON.parse(encodedDescription);
    if (name.length > 64 || relative(skillsRoot, dirname(path)) !== name ||
        !description.trim() || description.length > 1024 || /\[TODO[:\]]/.test(content)) {
      throw new Error(label + ': invalid name, description, or unfinished scaffold');
    }
    count++;
  }
  const prose = content
    .replace(/^(\x60{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/\x60+[^\x60\n]*\x60+/g, '');
  for (const match of prose.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)) {
    const href = match[1];
    if (/^(?:https?:\/\/|mailto:|#)/.test(href)) {
      continue;
    }
    const destination = resolve(dirname(path), decodeURIComponent(href.split('#')[0]));
    const boundary = inSkill ? join(skillsRoot, relative(skillsRoot, path).split(sep)[0]) : root;
    if (!within(boundary, destination)) {
      throw new Error(label + ': reference leaves its package: ' + href);
    }
    statSync(destination);
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if (entry.isFile()) {
      check(path);
    } else {
      throw new Error('Unexpected link or special file: ' + path);
    }
  }
}

walk(root);
if (count === 0) {
  throw new Error('No skills checked');
}
console.log('Checked ' + count + ' standalone skills: frontmatter, UTF-8/LF, local links, and provider paths.');
