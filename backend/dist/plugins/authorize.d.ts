import type { preHandlerHookHandler } from 'fastify';
import { type Permission } from '../security/permissions.js';
export declare function authorize(permission: Permission): preHandlerHookHandler;
