import {renderArticle,html} from '../../../lib/render-editorial';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){const {slug}=await params;const page=await renderArticle(slug);return html(page??'<h1>Guide not found</h1><a href="/">Return to the guides</a>',page?200:404);}
