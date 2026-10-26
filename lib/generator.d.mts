export function validateBrief(input:unknown):{topic:string;keyword:string;notes:string;sources:string;category:string;provider:string;sourceUrls:string[]};
export function generatorPrompt(brief:Record<string,any>):string;
export function parseDraft(raw:string,brief:Record<string,any>):Record<string,any>;
export function generateWithProvider(settings:Record<string,any>,brief:Record<string,any>,fetcher?:typeof fetch):Promise<Record<string,any>>;
