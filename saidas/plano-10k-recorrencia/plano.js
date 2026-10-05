(function(){
  var KEY='plano10k:';
  function load(k){try{return JSON.parse(localStorage.getItem(KEY+k)||'{}')||{}}catch(e){return {}}}
  function save(k,v){try{localStorage.setItem(KEY+k,JSON.stringify(v))}catch(e){}}
  function count(st,prefix){var d=0;for(var k in st){if(st[k]&&(!prefix||k.indexOf(prefix)===0))d++}return d}

  var page=document.body.getAttribute('data-etapa');
  if(page){
    var st=load(page);
    var boxes=document.querySelectorAll('input[type=checkbox][data-id]');
    function refresh(){
      document.querySelectorAll('[data-count]').forEach(function(el){
        var p=el.getAttribute('data-count');var tot=0,done=0;
        boxes.forEach(function(b){if(b.getAttribute('data-id').indexOf(p)===0){tot++;if(b.checked)done++}});
        el.textContent=done+'/'+tot;
        el.classList.toggle('done',tot>0&&done===tot);
      });
    }
    boxes.forEach(function(b){
      b.checked=!!st[b.getAttribute('data-id')];
      b.addEventListener('change',function(){st[b.getAttribute('data-id')]=b.checked;save(page,st);refresh();});
    });
    refresh();
  }

  document.querySelectorAll('[data-progress]').forEach(function(el){
    var k=el.getAttribute('data-progress');var st=load(k);
    var total=parseInt(el.getAttribute('data-total'),10)||0;
    var gate=parseInt(el.getAttribute('data-gate'),10)||0;
    var doneAll=count(st,'');var doneGate=count(st,'p');
    var t=el.querySelector('.c-tasks'),g=el.querySelector('.c-gate');
    if(t){t.textContent='tarefas '+(doneAll-doneGate)+'/'+(total-gate);t.classList.toggle('done',total-gate>0&&doneAll-doneGate===total-gate)}
    if(g){g.textContent='porta '+doneGate+'/'+gate;g.classList.toggle('done',gate>0&&doneGate===gate)}
  });
})();
