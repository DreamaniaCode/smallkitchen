import {owner} from '../../../../lib/admin-auth';
import {collection} from '../../../../lib/content';
import {renderArticle,html} from '../../../../lib/render-editorial';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){if(!await owner())return new Response('Owner access required.',{status:403});const {id}=await params;const article=(await collection('articles')).find(a=>a.id===id);if(!article)return new Response('Not found',{status:404});return html((await renderArticle(article.slug,true))??'Not found');}
