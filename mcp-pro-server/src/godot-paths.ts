import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface ProjectInfo {
  dir: string;
  name: string;
  useCustomUserDir: boolean;
  customUserDirName: string;
}

/** Locate the Godot project directory: env override, then walk up from cwd. */
export function findProjectDir(start = process.cwd()): string | null {
  const env = process.env.GODOT_PROJECT_PATH;
  if (env) {
    const p = path.resolve(env);
    if (fs.existsSync(path.join(p, 'project.godot'))) return p;
    if (fs.existsSync(p) && path.basename(p) === 'project.godot') return path.dirname(p);
    return null;
  }
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'project.godot'))) return dir;
    // Common layout: repo root with a godot/ subfolder.
    const sub = path.join(dir, 'godot', 'project.godot');
    if (fs.existsSync(sub)) return path.dirname(sub);
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function unquote(v: string): string {
  const t = v.trim();
  return t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t;
}

/** Minimal parser for the [application] section of project.godot. */
export function readProjectInfo(dir: string): ProjectInfo {
  const text = fs.readFileSync(path.join(dir, 'project.godot'), 'utf8');
  const values: Record<string, string> = {};
  let section = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(';')) continue;
    const m = line.match(/^\[(.+)\]$/);
    if (m) { section = m[1]; continue; }
    if (section !== 'application') continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    values[line.slice(0, eq).trim()] = line.slice(eq + 1);
  }
  return {
    dir,
    name: unquote(values['config/name'] ?? '') || '[unnamed project]',
    useCustomUserDir: unquote(values['config/use_custom_user_dir'] ?? 'false') === 'true',
    customUserDirName: unquote(values['config/custom_user_dir_name'] ?? ''),
  };
}

/** Resolve Godot's user:// directory for this project on the current OS. */
export function userDataDir(info: ProjectInfo): string {
  let base: string;
  switch (process.platform) {
    case 'darwin': base = path.join(os.homedir(), 'Library', 'Application Support'); break;
    case 'win32': base = process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'); break;
    default: base = process.env.XDG_DATA_HOME ?? path.join(os.homedir(), '.local', 'share');
  }
  if (info.useCustomUserDir && info.customUserDirName) {
    return path.join(base, info.customUserDirName);
  }
  return path.join(base, 'Godot', 'app_userdata', info.name);
}

/** Token written by the addon when `godot_mcp_pro/require_connection_token` is on. */
export function readAuthToken(info: ProjectInfo): string | null {
  const file = path.join(userDataDir(info), 'mcp_auth_token');
  try {
    const t = fs.readFileSync(file, 'utf8').trim();
    return t || null;
  } catch {
    return null;
  }
}
