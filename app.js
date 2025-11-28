// app.js
(function(){
  // helper functions
  function q(sel){return document.querySelector(sel);}
  function addRow(time='', odd=''){
    const rows = q('#rows');
    const r = document.createElement('div');
    r.className = 'row';
    r.innerHTML = `
      <input class="input-time" placeholder="HH:MM or 09:33 AM" value="${time}">
      <input class="input-odd" placeholder="odd (e.g. 12.34)" value="${odd}">
      <button class="btn alt remove">✖</button>
    `;
    rows.prepend(r);
    r.querySelector('.remove').addEventListener('click', ()=> r.remove());
    // realtime analyze on change
    r.querySelectorAll('input').forEach(inp=>{
      inp.addEventListener('input', ()=> analyze());
    });
  }

  function parseRows(){
    const data=[];
    document.querySelectorAll('#rows .row').forEach(r=>{
      const t = r.querySelector('.input-time').value.trim();
      const oddS = r.querySelector('.input-odd').value.trim();
      const odd = parseFloat(oddS.replace(/[,xX]/g,''));
      if(!isNaN(odd)) data.push({time:t, odd:odd});
    });
    return data;
  }

  function mean(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }
  function median(arr){
    if(!arr.length) return 0;
    arr = [...arr].sort((a,b)=>a-b);
    const mid = Math.floor(arr.length/2);
    return arr.length%2 ? arr[mid] : (arr[mid-1]+arr[mid])/2;
  }
  function stddev(arr){
    const m = mean(arr);
    const v = arr.reduce((s,x)=>s + Math.pow(x-m,2),0)/arr.length;
    return Math.sqrt(v);
  }

  function analyze(){
    const rows = parseRows();
    const cnt = rows.length;
    const odds = rows.map(r=>r.odd);
    q('#count').textContent = cnt;
    if(cnt===0){
      q('#mean').textContent='—';
      q('#median').textContent='—';
      q('#std').textContent='—';
      q('#highSummary').innerHTML='';
      q('#recentList').innerHTML='';
      updateChart([]);
      return;
    }
    const m = mean(odds);
    const med = median(odds);
    const s = stddev(odds);
    q('#mean').textContent = m.toFixed(2);
    q('#median').textContent = med.toFixed(2);
    q('#std').textContent = s.toFixed(2);

    // high odd summary (descriptive)
    const over10 = rows.filter(r=>r.odd>=10).length;
    const over20 = rows.filter(r=>r.odd>=20).length;
    const top3 = [...rows].sort((a,b)=>b.odd-a.odd).slice(0,3);
    const list = q('#highSummary');
    list.innerHTML = '';
    const li1 = document.createElement('li');
    li1.textContent = `Count >=10x: ${over10}  •  Count >=20x: ${over20}`;
    list.appendChild(li1);
    const li2 = document.createElement('li');
    li2.textContent = `Top values (descriptive): ${top3.map(t=>`${t.time || '-'} → ${t.odd}x`).join(' • ')}`;
    list.appendChild(li2);
    const li3 = document.createElement('li');
    li3.textContent = `Mean/Median/Std (descriptive) — ${m.toFixed(2)} / ${med.toFixed(2)} / ${s.toFixed(2)}`;
    list.appendChild(li3);

    // recent list (latest first)
    const recent = q('#recentList');
    recent.innerHTML = '';
    rows.slice().reverse().forEach(r=>{
      const it = document.createElement('div'); it.className='item';
      it.innerHTML = `<div>${r.time || '-'}</div><div style="font-weight:800">${r.odd}x</div>`;
      recent.appendChild(it);
    });

    // update histogram chart
    updateChart(odds);
  }

  // Chart.js histogram
  let histChart = null;
  function updateChart(data){
    const ctx = q('#histChart').getContext('2d');
    if(!data || data.length===0){
      if(histChart){ histChart.destroy(); histChart=null; }
      return;
    }
    // prepare bins
    const max = Math.max(...data, 1);
    const step = Math.max(1, Math.ceil(max/10));
    const bins = [];
    for(let i=0;i<=Math.ceil(max/step);i++){
      bins.push(i*step);
    }
    // labels numeric
    const counts = new Array(bins.length-1).fill(0);
    data.forEach(v=>{
      for(let i=0;i<bins.length-1;i++){
        if(v>=bins[i] && v < bins[i+1]){ counts[i]++; break; }
        if(i===bins.length-2 && v>=bins[i+1]) counts[counts.length-1]++;
      }
    });
    const labels = bins.slice(0,-1).map((b,i)=>`${b}–${bins[i+1]-0.01}`);
    if(histChart) histChart.destroy();
    histChart = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'frequency', data:counts, backgroundColor:'rgba(40,246,212,0.15)', borderColor:'rgba(40,246,212,0.6)', borderWidth:1 }] },
      options:{
        plugins:{ legend:{display:false} },
        scales:{ y:{ beginAtZero:true }, x:{ ticks:{ color:'#bfe' } }
      }
    });
  }

  // init controls
  q('#addRow').addEventListener('click', ()=> addRow('',''));
  q('#clearAll').addEventListener('click', ()=>{
    q('#rows').innerHTML=''; analyze();
  });
  q('#analyze').addEventListener('click', ()=> analyze());

  // start with 5 blank rows
  for(let i=0;i<5;i++) addRow('','');
  analyze();

  // expose for convenience (dev)
  window.MHAnalyzing = { analyze, addRow, parseRows };
})();
