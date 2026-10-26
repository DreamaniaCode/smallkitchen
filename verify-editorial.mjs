import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validate} from './lib/validation.mjs';
import {renderMarkdown,headingList,seoChecks,wordCount} from './lib/article-tools.mjs';
import {validateBrief,parseDraft,generateWithProvider} from './lib/generator.mjs';
const seed=JSON.parse(readFileSync('data/seed.json','utf8'));
const catalog=[...JSON.parse(readFileSync('data/product-photo-catalog.json','utf8')),...JSON.parse(readFileSync('data/coffee-photo-catalog.json','utf8'))];
assert.equal(seed.articles.length,30);assert.equal(new Set(seed.articles.map(a=>a.slug)).size,30);
for(const a of seed.articles){validate('articles',a);assert(wordCount(a.body)>=500,a.id);assert.equal(seoChecks(a).filter(c=>!c.pass).length,0,a.id);assert(catalog.some(p=>'product-'+p.id===a.image));for(const s of a.sources)assert(s.url.startsWith('https://'));}
for(const p of catalog){assert(p.realPhoto);assert(existsSync('public'+p.src));assert(p.author&&p.sourceUrl&&p.licenseUrl);assert(!/NC|ND/.test(p.license));}
assert(!renderMarkdown('## <script>alert(1)</script>\n\n[x](javascript:alert(1))').includes('<script>'));
assert(renderMarkdown('## Good section\n\n- One\n- Two\n\n[Source](https://example.com)').includes('<ul>'));
assert(renderMarkdown('### Detail\n\nA **clear** answer.').includes('<h3'));
assert.equal(headingList('## Same\n\n## Same')[1].id,'same-2');
const brief=validateBrief({topic:'A useful small-kitchen guide',keyword:'small kitchen guide',category:'Measuring guides',provider:'gemini',notes:'Verified manufacturer instructions and dimensions. '.repeat(5),sources:'https://example.com/manual'});
const article={title:'A useful guide',slug:'useful-guide',description:'A practical measuring guide for small kitchen appliances.',seoTitle:'Small Kitchen Appliance Measuring Guide',seoDescription:'Measure your small kitchen before choosing an appliance. Compare its footprint, access and manufacturer instructions for a practical shortlist.',primaryKeyword:'small kitchen guide',body:('Useful original planning advice. '.repeat(160))+'\n\n[Source](https://example.com/manual)',amazonQuery:'compact kitchen appliances',faqs:[{question:'How do I measure?',answer:'Use the exact manual.'},{question:'What about fit?',answer:'Measure opening and operating space.'}]};
const parsed=parseDraft(JSON.stringify(article),brief);assert.equal(parsed.status,'draft');assert.throws(()=>parseDraft(JSON.stringify({...article,body:article.body+' [Bad](https://unverified.example/)'}),brief));
await assert.rejects(()=>generateWithProvider({},brief),/Configure/);
let sent;const mock=async(url,options)=>{sent={url,options};return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(article)}]}}]})};};
const result=await generateWithProvider({GEMINI_API_KEY:'unit-test-only',GEMINI_MODEL:'model-under-test'},brief,mock);assert.equal(result.status,'draft');assert(sent.url.startsWith('https://generativelanguage.googleapis.com/'));assert(!sent.url.includes('unit-test-only'));assert.equal(sent.options.headers['x-goog-api-key'],'unit-test-only');
console.log('Passed: 30 sourced articles, unique URLs, 500+ words, SEO metadata, 15 real licensed photos, safe Markdown, repeated heading anchors, generator configuration errors, source URL confinement, server-only API header and draft-only output.');
