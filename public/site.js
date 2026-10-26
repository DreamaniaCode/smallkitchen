document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;let count=0;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('.guide').forEach(card=>{card.hidden=filter!=='All guides'&&card.dataset.category!==filter;if(!card.hidden)count++;});
 document.querySelector('#filter-status').textContent=`${count} guides shown`;
}));
document.querySelector('#fit-form')?.addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(e.currentTarget);const n=k=>Number(data.get(k));
 const axes=[['Width','sw','aw','cw'],['Depth','sd','ad','cd'],['Height','sh','ah','ch']];
 const invalid=axes.some(([,s,a,c])=>![n(s),n(a),n(c)].every(Number.isFinite)||n(s)<=0||n(a)<=0||n(c)<0);
 const box=document.querySelector('#fit-result');if(invalid){box.textContent='Please enter valid positive dimensions and nonnegative extra clearances.';return;}
 const rows=axes.map(([label,s,a,c])=>({label,remaining:n(s)-n(a)-n(c)}));const fits=rows.every(r=>r.remaining>=0);
 box.replaceChildren();const heading=document.createElement('strong');heading.textContent=fits?'The entered dimensions fit within this rectangular space.':'The entered dimensions exceed your available space.';box.append(heading);
 for(const r of rows){const p=document.createElement('p');p.textContent=`${r.label}: ${Math.abs(r.remaining).toFixed(2)} in ${r.remaining>=0?'remaining':'short'}.`;box.append(p);}
 const note=document.createElement('p');note.textContent='This comparison uses only your inputs. Confirm exact-model opening travel, safe placement and all manufacturer instructions. A zero margin leaves no allowance for measurement error.';box.append(note);
});
