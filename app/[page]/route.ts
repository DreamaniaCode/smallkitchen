import {infoPage,html} from '../../lib/render-editorial';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{page:string}>}){const {page}=await params;const content=infoPage(page);return html(content??'<h1>Page not found</h1><a href="/">Return home</a>',content?200:404);}
