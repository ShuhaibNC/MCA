(function(){
  var tabs=document.querySelectorAll('.tab'), panes=document.querySelectorAll('.pane');
  var input=document.getElementById('q'), empty=document.getElementById('noResults');
  // Track the active semester tab; default to the tab marked .active or the first pane.
  var activeSem=(document.querySelector('.tab.active')||{}).dataset
    ? document.querySelector('.tab.active').dataset.sem
    : (document.querySelector('.pane.first')||{dataset:{}}).dataset.sem || 'S1';

  function showPane(sem){
    panes.forEach(function(p){ p.style.display = (p.dataset.sem===sem) ? '' : 'none'; });
  }

  function applyFilter(){
    var q=input.value.trim().toLowerCase(), any=false;
    panes.forEach(function(pane){
      var paneAny=false;
      pane.querySelectorAll('.card').forEach(function(card){
        var hit=!q;
        if(q){
          var h=card.querySelector('h3');
          if(h && h.textContent.toLowerCase().indexOf(q)>-1) hit=true;
        }
        card.querySelectorAll('.res-list a').forEach(function(a){
          var show=!q || hit || a.textContent.toLowerCase().indexOf(q)>-1;
          a.style.display=show?'':'none'; if(show)hit=true;
        });
        card.style.display=hit?'':'none'; if(hit)paneAny=true;
      });
      // When searching show only panes with hits; when cleared restore the active tab's pane.
      pane.style.display = q ? (paneAny?'':'none') : (pane.dataset.sem===activeSem ? '' : 'none');
      var tab=document.querySelector('.tab[data-sem="'+pane.dataset.sem+'"]');
      if(tab)tab.style.display=(q&&!paneAny)?'none':'';
      if(paneAny)any=true;
    });
    if(empty)empty.style.display=(q&&!any)?'block':'none';
  }

  tabs.forEach(function(t){t.addEventListener('click',function(){
    activeSem=t.dataset.sem;
    tabs.forEach(function(x){x.classList.remove('active')});t.classList.add('active');
    if(input.value){ input.value=''; }       // tab click clears any active search
    showPane(activeSem);
    applyFilter();
  })});

  input.addEventListener('input',applyFilter);

  var y=document.getElementById('year');
  if(y)y.textContent=new Date().getFullYear();

  // Theme toggle: default is light; the choice persists across visits.
  var root=document.documentElement, tt=document.getElementById('themeToggle');
  function setTheme(t){
    if(t==='dark')root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
    try{localStorage.setItem('mca-theme',t)}catch(e){}
  }
  if(tt)tt.addEventListener('click',function(){
    setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
  });
})();
