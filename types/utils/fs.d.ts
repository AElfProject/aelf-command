declare const cr: number;
declare const lf: number;

declare function getEolFromFile(path: string): Promise<string | undefined>;
export function writeFilePreservingEol(path: string, data: string): Promise<void>;
