/// <reference path="../../../typings/custom/require.d.ts" />

export type CombatChild = {text: string, visible?: string, event: any[]};
export type RoleplayChild = {text: string, visible?: string, choice: any};

// These renderers
export interface Renderer {
 toRoleplay: (attribs: {[k: string]: string}, body: (string|RoleplayChild)[]) => any;
 toCombat: (attribs: {[k: string]: string}, events: CombatChild[]) => any;
 toTrigger: (text: string) => any;
 toQuest: (attribs: {[k: string]: string}) => any;
 finalize: (quest: any, inner: any[]) => any;
}