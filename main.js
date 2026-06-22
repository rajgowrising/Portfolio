/* =============================================
   main.js
   Shared behavior loaded on every page:
   - Highlights the current page in the nav
   - Fades in cards/rows as they scroll into view
   - Draws the animated network background
     (only runs on pages that have the canvas)
   ============================================= */

// ===== Active nav link =====
(function(){
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link=>{
    const href = link.getAttribute('href');
    if(href === path || (path === '' && href === 'index.html')){
      link.classList.add('is-active');
    }
  });
})();

// ===== Scroll reveal =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
  });
},{ threshold:0.15 });

document.querySelectorAll('.tl-card, .exp-cell, .edu-row, .int-card, .stat-row, .contact-cell').forEach(el=>{
  el.classList.add('reveal');
  io.observe(el);
});

// ===== Network canvas animation (hero background, home page only) =====
(function(){
  const canvas = document.getElementById('network-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, points, raf;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function initPoints(){
    const count = Math.min(46, Math.floor((canvas.offsetWidth*canvas.offsetHeight)/26000));
    points = Array.from({length:count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.25*devicePixelRatio,
      vy: (Math.random()-0.5)*0.25*devicePixelRatio,
    }));
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    const maxDist = 170 * devicePixelRatio;

    points.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    });

    for(let i=0;i<points.length;i++){
      for(let j=i+1;j<points.length;j++){
        const a = points[i], b = points[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < maxDist){
          ctx.strokeStyle = `rgba(92,124,255,${(1 - dist/maxDist) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    points.forEach(p=>{
      ctx.fillStyle = 'rgba(255,178,62,0.55)';
      ctx.beginPath();
      ctx.arc(p.x,p.y,1.6*devicePixelRatio,0,Math.PI*2);
      ctx.fill();
    });

    if(!prefersReduced) raf = requestAnimationFrame(step);
  }

  function start(){
    resize();
    initPoints();
    ctx.clearRect(0,0,w,h);
    if(prefersReduced){
      step(); // draw one static frame
    } else {
      cancelAnimationFrame(raf);
      step();
    }
  }

  window.addEventListener('resize', start);
  start();
})();
