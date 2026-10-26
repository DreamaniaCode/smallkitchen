import {siteOrigin} from '../../lib/site-url';
import {collection} from '../../lib/content';
import {escapeHtml} from '../../lib/validation.mjs';
export const dynamic='force-dynamic';
export async function GET(){const origin=siteOrigin();const rows=(await collection('articles')).filter(a=>a.status==='published');const paths=['/','/about/','/privacy/','/disclosure/',...rows.map(a=>'/guides/'+a.slug+'/')];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>'+escapeHtml(origin+p)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml','Cache-Control':'no-store'}});}
