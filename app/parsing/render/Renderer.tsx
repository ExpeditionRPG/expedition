/// <reference path="../../../typings/custom/require.d.ts" />

export type CombatChild = {text: string, visible?: string, event: any[]};
export type Instruction = {text: string, visible?: string};
export type RoleplayChild = {text: string, visible?: string, choice: any};

// These renderers
export interface Renderer {
 toRoleplay: (attribs: {[k: string]: any}, body: (string|RoleplayChild|Instruction)[]) => any;
 toCombat: (attribs: {[k: string]: any}, events: CombatChild[]) => any;
 toTrigger: (attribs: {[k: string]: any}) => any;
 toQuest: (attribs: {[k: string]: any}) => any;
 finalize: (quest: any, inner: any[]) => any;
}
