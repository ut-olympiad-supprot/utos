/* Plain text CMS content: never interpret submitted text as HTML. */
(async()=>{
 const host=document.getElementById('stories-list'),filters=document.getElementById('story-filters'),count=document.getElementById('story-count');
 try{
  const response=await fetch('./content/stories.json');if(!response.ok)throw Error(response.status);
  const data=await response.json();if(!Array.isArray(data.stories))throw Error('Invalid stories');
  const stories=data.stories.filter(s=>s&&s.published===true&&['category','title','author','body'].every(k=>typeof s[k]==='string')&&s.title.trim()&&s.body.trim());
  const categories=[...new Set(stories.map(s=>s.category))];
  const initial=new URL(location.href).searchParams.get('category');let selected=categories.includes(initial)?initial:'すべて';
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const render=()=>{
   host.replaceChildren();const visible=stories.filter(s=>selected==='すべて'||s.category===selected);
   for(const category of categories.filter(c=>selected==='すべて'||c===selected)){
    const group=el('section','story-group'),heading=el('h3','',category),grid=el('div','stories-cards');group.append(heading,grid);
    for(const story of visible.filter(s=>s.category===category)){
     const card=el('article','voice-card'),meta=el('div','voice-meta'),title=el('h4','',story.title),body=el('div','voice-body');
     meta.append(el('span','voice-tag',category));
     for(const paragraph of story.body.split(/\n\s*\n/).filter(p=>p.trim()))body.append(el('p','',paragraph));
     card.append(meta,title,body,el('p','voice-attribution',story.author));grid.append(card);
    }host.append(group);
   }
   if(!visible.length)host.append(el('p','stories-empty','体験談は準備中です。'));
   count.textContent=(selected==='すべて'?'すべての種目':selected)+'：'+visible.length+'件';
   for(const button of filters.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.textContent===selected));
  };
  filters.replaceChildren();
  for(const category of ['すべて',...categories]){const button=el('button','story-filter',category);button.type='button';button.addEventListener('click',()=>{selected=category;const url=new URL(location.href);if(category==='すべて')url.searchParams.delete('category');else url.searchParams.set('category',category);history.replaceState(null,'',url);render()});filters.append(button)}
  filters.hidden=false;render();
 }catch(error){console.warn('Stories feed unavailable; showing saved stories.',error);count.textContent='種目ごとの体験談をご覧いただけます。'}
})();
