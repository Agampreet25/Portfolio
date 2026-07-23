  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function css(v){ return getComputedStyle(root).getPropertyValue(v).trim(); }
  function hexRGBA(hex,a){ let h=hex.replace('#',''); if(h.length===3)h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }
  function themeColor(i){ return css(['--c1','--c2','--c3','--c4'][i]) || '#2D5BA8'; }

  function activate(){ document.body.classList.add('loaded'); document.getElementById('ambient').classList.add('on'); document.getElementById('spine').classList.add('on'); }
  window.addEventListener('load', activate);
  requestAnimationFrame(()=>setTimeout(activate,90));

  // theme toggle
  const toggle=document.getElementById('themeToggle'), icon=document.getElementById('themeIcon');
  const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  const moon='<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  toggle.addEventListener('click',()=>{ const d=root.getAttribute('data-theme')==='dark'; root.setAttribute('data-theme',d?'light':'dark'); icon.innerHTML=d?sun:moon; toggle.setAttribute('aria-label', d?'Toggle dark mode':'Toggle light mode'); });

  // nav border
  const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>12),{passive:true});

  /* ---------------- LATENT SPACE ---------------- */
  const lc=document.getElementById('latentCanvas'), lctx=lc.getContext('2d'), tip=document.getElementById('latentTip');
  const themeNames=['Representation','Financial','Clinical','Biomedical'];
  // publications: theme index + short title
  const PUBS=[
    {t:0,x:.18,y:.30,ti:'Transfer Learning for Cross-Domain Sentiment Classification'},
    {t:0,x:.26,y:.44,ti:'Cross-Domain Knowledge Adaptation via Iterative Scaling'},
    {t:1,x:.50,y:.22,ti:'Gold Price Forecasting with LSTM-Autoencoder'},
    {t:1,x:.60,y:.30,ti:'Machine & Hybrid DL for Bitcoin Forecasting'},
    {t:1,x:.55,y:.40,ti:'Financial Time Series Prediction on Apple Stocks'},
    {t:1,x:.66,y:.44,ti:'Wavelet-GNN-LSTM for Cryptocurrency Forecasting'},
    {t:2,x:.30,y:.70,ti:'Field-Level Explanations for Leukocyte Classification'},
    {t:2,x:.40,y:.78,ti:'Automated PCOS Diagnosis from Ultrasound'},
    {t:2,x:.24,y:.62,ti:'TREX-Net: Explainable Transfer Learning (Under Review)'},
    {t:2,x:.44,y:.66,ti:'Uncertainty-Aware Imaging for Sarcoma Risk'},
    {t:3,x:.76,y:.66,ti:'AI for Spatial Transcriptomics: A Scoping Review'},
    {t:3,x:.82,y:.74,ti:'WellGuide: Biomedical LLMs for Health Support'},
  ];
  // cluster centroids per theme (target positions when filtered)
  const CENTROIDS=[{x:.22,y:.37},{x:.58,y:.34},{x:.34,y:.69},{x:.79,y:.70}];
  let LW,LH,filter='all',mouse={x:-99,y:-99},hoverIdx=-1;
  const nodes=PUBS.map(p=>({...p, cx:p.x, cy:p.y, tx:p.x, ty:p.y, r:0, seed:Math.random()*6.28}));

  function lresize(){ const dpr=window.devicePixelRatio||1; LW=lc.clientWidth; LH=lc.clientHeight; lc.width=LW*dpr; lc.height=LH*dpr; lctx.setTransform(dpr,0,0,dpr,0,0); }
  function setTargets(){
    nodes.forEach(n=>{
      if(filter==='all'){ n.tx=n.x; n.ty=n.y; }
      else { const active=(''+n.t===filter); const c=CENTROIDS[n.t];
        // pull active theme into tight cluster center-stage, push others to edges faintly
        if(active){ n.tx=.5+(n.x-c.x)*1.7; n.ty=.5+(n.y-c.y)*1.7; }
        else { n.tx=n.x*.15 + (n.x>.5?.9:.1)*.85; n.ty=n.y; }
      }
    });
  }
  function lpx(n){ return {X:n.cx*LW, Y:n.cy*LH}; }
  function drawLatent(tms){
    if(!LW) return;
    lctx.clearRect(0,0,LW,LH);
    // faint grid
    lctx.strokeStyle=hexRGBA(css('--hair').startsWith('#')?css('--hair'):'#E6E2DA',.6); lctx.lineWidth=1;
    for(let gx=0;gx<=LW;gx+=LW/8){ lctx.beginPath(); lctx.moveTo(gx,0); lctx.lineTo(gx,LH); lctx.stroke(); }
    for(let gy=0;gy<=LH;gy+=LH/5){ lctx.beginPath(); lctx.moveTo(0,gy); lctx.lineTo(LW,gy); lctx.stroke(); }
    // ease toward targets + gentle drift
    hoverIdx=-1; let best=16;
    nodes.forEach((n,i)=>{
      n.cx += (n.tx-n.cx)*.08; n.cy += (n.ty-n.cy)*.08;
      const driftX = reduce?0:Math.sin(tms/1400 + n.seed)*.004;
      const driftY = reduce?0:Math.cos(tms/1600 + n.seed)*.004;
      const {X,Y}=lpx({cx:n.cx+driftX, cy:n.cy+driftY});
      n._X=X; n._Y=Y;
      const d=Math.hypot(mouse.x-X, mouse.y-Y);
      if(d<best){ best=d; hoverIdx=i; }
    });
    // links within same theme (subtle)
    nodes.forEach((a,i)=>nodes.forEach((b,j)=>{ if(j>i && a.t===b.t){
      const dim=(filter!=='all' && ''+a.t!==filter);
      lctx.strokeStyle=hexRGBA(themeColor(a.t).startsWith('#')?themeColor(a.t):'#2D5BA8', dim?.03:.10); lctx.lineWidth=1;
      lctx.beginPath(); lctx.moveTo(a._X,a._Y); lctx.lineTo(b._X,b._Y); lctx.stroke();
    }}));
    // points
    nodes.forEach((n,i)=>{
      const dim=(filter!=='all' && ''+n.t!==filter);
      const col=themeColor(n.t); const isHover=(i===hoverIdx);
      const tr = n.r; n.r += (( (isHover?7:4) )-n.r)*.2;
      lctx.beginPath(); lctx.arc(n._X,n._Y,n.r+(isHover?2:0),0,6.283);
      lctx.fillStyle=hexRGBA(col.startsWith('#')?col:'#2D5BA8', dim?.18:.95); lctx.fill();
      if(isHover && !dim){ lctx.beginPath(); lctx.arc(n._X,n._Y,n.r+6,0,6.283); lctx.strokeStyle=hexRGBA(col.startsWith('#')?col:'#2D5BA8',.5); lctx.lineWidth=1.2; lctx.stroke(); }
    });
    // tooltip
    if(hoverIdx>=0 && !(filter!=='all' && ''+nodes[hoverIdx].t!==filter)){
      const n=nodes[hoverIdx];
      tip.innerHTML='<div class="tt-theme" style="color:'+themeColor(n.t)+'">'+themeNames[n.t]+'</div><div class="tt-title">'+n.ti+'</div>';
      let tx=n._X+14, ty=n._Y+10; if(tx>LW-200) tx=n._X-214; if(ty>LH-60) ty=n._Y-70;
      tip.style.left=tx+'px'; tip.style.top=ty+'px'; tip.classList.add('show'); lc.style.cursor='pointer';
    } else { tip.classList.remove('show'); lc.style.cursor='crosshair'; }
    requestAnimationFrame(drawLatent);
  }
  lc.addEventListener('pointermove',e=>{ const r=lc.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
  lc.addEventListener('pointerleave',()=>{ mouse.x=-99; mouse.y=-99; });
  document.getElementById('latentFilters').addEventListener('click',e=>{
    const b=e.target.closest('.lf'); if(!b) return;
    document.querySelectorAll('.lf').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    filter=b.dataset.theme; setTargets();
  });
  window.addEventListener('resize',lresize);
  lresize(); setTargets(); requestAnimationFrame(drawLatent);

  /* ---------------- SIGNAL SPINE ---------------- */
  const sc=document.getElementById('spine'), sx=sc.getContext('2d');
  let SW,SH,st=0, sectionMix=0, targetMix=0;
  function sresize(){ const dpr=window.devicePixelRatio||1; SW=sc.clientWidth=innerWidth; SH=sc.clientHeight=innerHeight; sc.width=SW*dpr; sc.height=SH*dpr; sx.setTransform(dpr,0,0,dpr,0,0); }
  // mode per section: 0 noise→trend, 1 ECG, 2 wavelet, 3 gene bands
  const sectionModes=[['about',0],['research',0],['projects',1],['experience',2],['skills',3]];
  let mode=0;
  function currentMode(){
    let m=0; for(const [id,md] of sectionModes){ const el=document.getElementById(id); if(el && el.getBoundingClientRect().top < innerHeight*0.5) m=md; } return m;
  }
  function drawSpine(){
    if(!SW){ requestAnimationFrame(drawSpine); return; }
    st+=0.02; sx.clearRect(0,0,SW,SH);
    const col=css('--signal').startsWith('#')?css('--signal'):'#2D5BA8';
    const xMid=SW*0.5; // spine runs vertically-ish as a right-side ribbon
    // draw a faint flowing signal along the right gutter
    const gutter=Math.min(SW*0.5, SW-40);
    sx.lineWidth=1.4;
    for(let pass=0;pass<2;pass++){
      sx.strokeStyle=hexRGBA(col,pass?0.05:0.12); sx.beginPath();
      for(let y=0;y<=SH;y+=4){
        const p=y/SH; let amp;
        const m=currentMode();
        if(m===0){ amp=Math.sin(y*0.03+st)*18*(1-p)+Math.sin(y*0.013+st*.5)*14; }
        else if(m===1){ // ecg-like: mostly flat with spikes
          const beat=(y*0.6+st*40)%140; amp = (beat<8? Math.sin(beat/8*3.14)*46 : Math.sin(y*0.01+st*.4)*8); }
        else if(m===2){ // wavelet: nested oscillation
          amp=Math.sin(y*0.05+st)*10 + Math.sin(y*0.017+st*.6)*20 + Math.sin(y*0.13+st*1.4)*6*(1-p); }
        else { amp=Math.sin(y*0.02+st*.5)*22; } // gene bands handled below with rects
        const x=gutter + amp + (pass?18:0);
        y===0?sx.moveTo(x,y):sx.lineTo(x,y);
      }
      sx.stroke();
    }
    // gene-expression bands when in mode 3
    if(currentMode()===3){
      for(let y=0;y<SH;y+=26){ const v=(Math.sin(y*0.05+st)+1)/2; sx.fillStyle=hexRGBA(col, 0.03+v*0.05); sx.fillRect(gutter-6,y,26,12); }
    }
    requestAnimationFrame(drawSpine);
  }
  window.addEventListener('resize',sresize);
  sresize(); requestAnimationFrame(drawSpine);

  /* ---------------- reveals + project tilt ---------------- */
  const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.12});
  document.querySelectorAll('.reveal, .stagger').forEach(el=>io.observe(el));
  if(!reduce){
    document.querySelectorAll('.proj.tilt').forEach(card=>{
      card.addEventListener('pointermove',ev=>{ const r=card.getBoundingClientRect(); const mx=(ev.clientX-r.left)/r.width, my=(ev.clientY-r.top)/r.height; card.style.setProperty('--mx',(mx*100)+'%'); card.style.setProperty('--my',(my*100)+'%'); card.style.transform=`translateY(-4px) perspective(900px) rotateX(${(0.5-my)*4}deg) rotateY(${(mx-0.5)*4}deg)`; });
      card.addEventListener('pointerleave',()=>{ card.style.transform=''; });
    });
  }
