import { z } from 'zod';
import { tool, resPath, nodePath } from './types.js';

const g = 'script';

export const scriptTools = [
  tool({ group: g, name: 'list_scripts', readOnly: true,
    description: 'List .gd scripts under a directory.',
    input: { path: resPath().optional(), recursive: z.boolean().optional() } }),
  tool({ group: g, name: 'read_script', readOnly: true,
    description: 'Read the full text of a GDScript file.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'create_script',
    description: 'Create a new .gd file. If content is empty a template "extends <extends>" is generated. Refuses to overwrite unless force.',
    input: { path: resPath('Destination .gd path.'), content: z.string().optional(), extends: z.string().optional(), class_name: z.string().optional(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'edit_script',
    description: 'Edit a script using exactly one mode: (a) replacements [{search, replace, regex?}] for targeted edits; (b) content + start_line [+ end_line] to replace a 1-based line range; (c) content alone to replace the whole file; (d) insert_at_line + text to insert. Validates afterwards and reports parse errors. force=true edits a file that is open in the script editor.',
    input: { path: resPath(), replacements: z.array(z.object({ search: z.string(), replace: z.string(), regex: z.boolean().optional() })).optional(), content: z.string().optional(), start_line: z.number().int().optional(), end_line: z.number().int().optional(), insert_at_line: z.number().int().optional(), text: z.string().optional(), force: z.boolean().optional() } }),
  tool({ group: g, name: 'attach_script',
    description: 'Attach an existing script to a node in the edited scene.',
    input: { node_path: nodePath(), script_path: resPath('Script path.') } }),
  tool({ group: g, name: 'validate_script', readOnly: true,
    description: 'Check a GDScript file for parse errors without running it.',
    input: { path: resPath() } }),
  tool({ group: g, name: 'get_open_scripts', readOnly: true,
    description: 'Scripts currently open in the script editor.',
    input: {} }),
];
