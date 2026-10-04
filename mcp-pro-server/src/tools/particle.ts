import { z } from 'zod';
import { tool, nodePath, color } from './types.js';

const g = 'particle';

export const particleTools = [
  tool({ group: g, name: 'create_particles',
    description: 'Add a GPUParticles2D (or 3D with is_3d) node with a default ParticleProcessMaterial.',
    input: { parent_path: nodePath('Parent node.'), name: z.string().optional(), is_3d: z.boolean().optional(), amount: z.number().int().optional(), lifetime: z.number().optional(), one_shot: z.boolean().optional(), explosiveness: z.number().optional(), randomness: z.number().optional(), emitting: z.boolean().optional() } }),
  tool({ group: g, name: 'set_particle_material',
    description: 'Configure the ParticleProcessMaterial: direction, spread, velocity, gravity, scale, color, emission shape, angular/orbit velocity, damping.',
    input: { node_path: nodePath(), direction: z.any().optional(), spread: z.number().optional(), initial_velocity_min: z.number().optional(), initial_velocity_max: z.number().optional(), gravity: z.any().optional(), scale_min: z.number().optional(), scale_max: z.number().optional(), color: color().optional(), emission_shape: z.enum(['point','sphere','sphere_surface','box','ring']).optional(), emission_sphere_radius: z.number().optional(), emission_box_extents: z.any().optional(), emission_ring_radius: z.number().optional(), emission_ring_inner_radius: z.number().optional(), emission_ring_height: z.number().optional(), angular_velocity_min: z.number().optional(), angular_velocity_max: z.number().optional(), orbit_velocity_min: z.number().optional(), orbit_velocity_max: z.number().optional(), damping_min: z.number().optional(), damping_max: z.number().optional(), attractor_interaction_enabled: z.boolean().optional() } }),
  tool({ group: g, name: 'set_particle_color_gradient',
    description: 'Set a color-over-lifetime gradient: stops [{offset 0-1, color}].',
    input: { node_path: nodePath(), stops: z.array(z.object({ offset: z.number(), color: z.any() })) } }),
  tool({ group: g, name: 'apply_particle_preset',
    description: 'Apply a ready-made look: explosion, fire, smoke, sparks, rain, snow, magic, dust.',
    input: { node_path: nodePath(), preset: z.enum(['explosion','fire','smoke','sparks','rain','snow','magic','dust']) } }),
  tool({ group: g, name: 'get_particle_info', readOnly: true,
    description: 'Current particle node and material settings.',
    input: { node_path: nodePath() } }),
];
