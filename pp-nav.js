(function(){
  const chapters = (window.PP_CHAPTERS||[]);
  const path = location.pathname.split('/').pop() || 'index.html';
  const idx = chapters.findIndex(c => c.file === path);

  const pills = document.getElementById('pp-pillbar');
  if (pills && chapters.length){
    chapters.slice(0,6).forEach((c,i)=>{
      const a = document.createElement('a');
      a.className = 'pp-pill' + (c.file===path ? ' active':'' );
      a.href = c.file;
      a.textContent = 'Kap. ' + (i+1);
      pills.appendChild(a);
    });
    const all = document.createElement('a');
    all.className = 'pp-pill';
    all.href = 'manifest.html';
    all.textContent = 'Alle kapitler';
    pills.appendChild(all);
  }

  const tocList = document.getElementById('pp-toc-list');
  if (tocList && chapters.length){
    chapters.forEach(c=>{
      const a = document.createElement('a');
      a.href = c.file;
      a.textContent = c.title;
      if (c.file === path) a.style.fontWeight = '700';
      tocList.appendChild(a);
    });
  }

  const prev = document.getElementById('pp-prev');
  const next = document.getElementById('pp-next');
  if (prev){
    if (idx > 0) { prev.href = chapters[idx-1].file; prev.textContent = '← ' + chapters[idx-1].title; }
    else { prev.style.visibility = 'hidden'; }
  }
  if (next){
    if (idx >= 0 && idx < chapters.length-1) { next.href = chapters[idx+1].file; next.textContent = chapters[idx+1].title + ' →'; }
    else { next.style.visibility = 'hidden'; }
  }

  const toc = document.getElementById('pp-toc');
  const btn = document.getElementById('pp-toc-btn');
  if (btn && toc){
    btn.addEventListener('click', e => { e.preventDefault(); toc.classList.add('open'); toc.setAttribute('aria-hidden','false'); });
    document.addEventListener('keydown', e => { if(e.key==='Escape') { toc.classList.remove('open'); toc.setAttribute('aria-hidden','true'); }});
    document.addEventListener('click', e => {
      if (toc.classList.contains('open') && !toc.contains(e.target) && e.target!==btn) {
        toc.classList.remove('open'); toc.setAttribute('aria-hidden','true');
      }
    });
  }
})();