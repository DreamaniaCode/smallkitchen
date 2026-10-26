export function slugify(text:string):string;
export function headingList(body:string):{title:string;id:string;level:number}[];
export function renderMarkdown(body:string):string;
export function wordCount(body:string):number;
export function seoChecks(a:Record<string,any>):{label:string;pass:boolean;detail?:string}[];
