export let userHomeDir: any;
export const home: string;
export function getUid(): number | null;
export function isFakeRoot(): boolean;
export function isWindows(): boolean;
export function isRootUser(uid: number): boolean;
export const ROOT_USER: boolean;
