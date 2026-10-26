import {renderHome,html} from '../lib/render-editorial';
export const dynamic='force-dynamic';
export async function GET(){return html(await renderHome());}
