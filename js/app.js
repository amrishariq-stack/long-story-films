/* ============================================================
   Long Story Films — site behaviour
   (Original scripts from index.html, unchanged in behaviour,
    plus a Formspree-wired form and an additive 3D/dynamic module.)
   ============================================================ */

/* always open at the top (Home), never a restored scroll position */
if("scrollRestoration" in history){ history.scrollRestoration = "manual"; }
window.addEventListener("beforeunload",()=>{ /* keep manual restoration */ });
window.addEventListener("load",()=>{ if(!location.hash) window.scrollTo(0,0); });
window.scrollTo(0,0);

/* hero entrance */
window.addEventListener("load",()=>document.querySelector(".hero")?.classList.add("loaded"));
document.addEventListener("DOMContentLoaded",()=>document.querySelector(".hero")?.classList.add("loaded"));

/* header state on scroll */
const header=document.getElementById("header");
if(header){
  const onScroll=()=>header.classList.toggle("scrolled",window.scrollY>40);
  onScroll();window.addEventListener("scroll",onScroll,{passive:true});
}

/* mobile menu */
const toggle=document.getElementById("menuToggle"),nav=document.getElementById("nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded",open);
    toggle.textContent=open?"Close":"Menu";
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    nav.classList.remove("open");toggle.textContent="Menu";toggle.setAttribute("aria-expanded","false");
  }));
}

/* scroll reveal */
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});
},{threshold:0.16,rootMargin:"0px 0px -8% 0px"});
document.querySelectorAll(".reveal,.stagger").forEach(el=>io.observe(el));

/* FAQ accordion */
document.querySelectorAll(".faq-q").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const item=btn.parentElement,ans=item.querySelector(".faq-a"),open=item.classList.contains("open");
    document.querySelectorAll(".faq.open").forEach(o=>{o.classList.remove("open");o.querySelector(".faq-a").style.maxHeight=null;});
    if(!open){item.classList.add("open");ans.style.maxHeight=ans.scrollHeight+"px";}
  });
});

/* ------------------------------------------------------------
   Inquiry form — Formspree (no backend)
   TODO: paste your real endpoint into the form's `action`
         (https://formspree.io/f/XXXXXXXX) in index.html / inquire.html.
   Until then the success state still shows after the required-field
   guard passes, so the page is testable.
   ------------------------------------------------------------ */
const form=document.getElementById("inquiryForm");
if(form){
  form.addEventListener("submit",async (e)=>{
    e.preventDefault();
    const ok=form.querySelector('[name="name"]').value.trim()
      && form.querySelector('[name="partner"]').value.trim()
      && form.querySelector('[name="email"]').value.trim();
    if(!ok){form.querySelector('[name="name"]').focus();return;}

    const submitBtn=form.querySelector("button[type=submit]");
    const showSuccess=()=>{
      if(submitBtn)submitBtn.style.display="none";
      document.getElementById("formSuccess")?.classList.add("show");
    };

    const action=form.getAttribute("action")||"";
    const endpointReady=action && !/REPLACE_ME/i.test(action);

    // If no real endpoint yet, just show the success state (testable locally).
    if(!endpointReady){showSuccess();return;}

    if(submitBtn){submitBtn.disabled=true;submitBtn.style.opacity="0.6";}
    try{
      const res=await fetch(action,{
        method:"POST",
        headers:{"Accept":"application/json"},
        body:new FormData(form)
      });
      if(res.ok){showSuccess();}
      else{
        if(submitBtn){submitBtn.disabled=false;submitBtn.style.opacity="";}
        alert("Something went wrong sending your message. Please email hello@longstoryfilms.com.");
      }
    }catch(err){
      if(submitBtn){submitBtn.disabled=false;submitBtn.style.opacity="";}
      alert("Network error. Please email hello@longstoryfilms.com.");
    }
  });
}


/* ============================================================
   ============================================================
   3D / DYNAMIC MODULE  (additive — remove this block to revert)
   ============================================================
   ============================================================ */
(function dynamicLayer(){
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none)");

  /* ============================================================
     Full-bleed films SCRUBBED to scroll.
     A section's frames advance as it scrolls past its pinned,
     full-viewport canvas (padded-cover + dark fill so the film
     melts into the charcoal page). Used by the hero/tagline stage
     (Invitation film) and the Approach section (strip film).
     ============================================================ */
  function makeScrub(section, canvas, pathFn, count, still){
    if(!section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha:false });
    const frames = new Array(count);
    const SCALE = 0.96;
    let current = -1;
    const bgFill = (getComputedStyle(document.documentElement).getPropertyValue("--bone")||"#15120e").trim();
    const W = ()=> canvas.clientWidth  || window.innerWidth;
    const H = ()=> canvas.clientHeight || window.innerHeight;

    function size(){
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      canvas.width = Math.floor(W()*dpr); canvas.height = Math.floor(H()*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(current>=0) draw(current, true);
    }
    function draw(index, force){
      let img = frames[index];
      if(!img){ for(let d=1; d<count && !img; d++){ img = frames[Math.max(0,index-d)] || frames[Math.min(count-1,index+d)]; } }
      if(!img) return;
      if(!force && index===current) return;
      current = index;
      const cw = W(), ch = H();
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(cw/iw, ch/ih) * SCALE;
      const dw = iw*s, dh = ih*s;
      ctx.fillStyle = bgFill; ctx.fillRect(0,0,cw,ch);
      ctx.drawImage(img, (cw-dw)/2, (ch-dh)/2, dw, dh);
    }
    function frameNow(){
      const r = section.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      return Math.min(count-1, Math.floor(p * count));
    }
    function load(i){
      const img = new Image();
      img.onload = img.onerror = ()=>{
        frames[i] = img.complete ? img : frames[i];
        if(i===0 || i===still) draw(reduceMotion.matches ? still : frameNow(), true);
      };
      img.src = pathFn(i);
    }
    size();
    [0, still].forEach(load);
    let n = 1;
    (function chain(){ if(n>=count) return; if(n!==still) load(n); n++; requestAnimationFrame(chain); })();
    window.addEventListener("resize", size, {passive:true});

    if(reduceMotion.matches){ draw(still, true); }
    else {
      let raf=false;
      const onScroll=()=>{ if(raf) return; raf=true; requestAnimationFrame(()=>{ draw(frameNow()); raf=false; }); };
      window.addEventListener("scroll", onScroll, {passive:true});
      onScroll();
    }
  }
  makeScrub(document.getElementById("filmStage"), document.getElementById("heroCanvas"),
            (i)=>`frames/frame_${String(i+1).padStart(4,"0")}.webp`, 242, 188);
  makeScrub(document.getElementById("approach"), document.getElementById("stripCanvas"),
            (i)=>`frames-strip/frame_${String(i+1).padStart(4,"0")}.webp`, 242, 120);

  /* ---- Reel: looping background video behind the final invitation ---- */
  const reel = document.getElementById("reelVideo");
  if(reel){
    reel.muted = true;
    if(reduceMotion.matches){ reel.removeAttribute("autoplay"); reel.pause(); }
    else {
      const rio = new IntersectionObserver((es)=>es.forEach(e=>{
        if(e.isIntersecting) reel.play().catch(()=>{}); else reel.pause();
      }),{threshold:0.12});
      rio.observe(reel);
    }
  }

  if(reduceMotion.matches) return; // everything below is motion

  /* ============================================================
     Scroll-linked IN/OUT effect (e.g. the tagline band)
     Eases in as it approaches centre, eases out as it leaves.
     ============================================================ */
  const inout = Array.from(document.querySelectorAll(".scroll-inout"));
  /* ---- Hero text parallax ---- */
  const heroInner = document.querySelector(".hero .hero-inner");
  const heroSec = document.getElementById("top");

  let ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{
      const vh = window.innerHeight;
      if(heroInner && heroSec){
        const r = heroSec.getBoundingClientRect();
        if(r.bottom > -200) heroInner.style.transform = `translateY(${(-r.top)*0.08}px)`;
      }
      for(const el of inout){
        const r = el.getBoundingClientRect();
        const center = r.top + r.height/2;
        // 0 at viewport centre, grows toward edges
        const dist = Math.min(1, Math.abs(center - vh/2) / (vh*0.62));
        const eased = dist*dist;
        el.style.opacity = String(1 - eased);
        el.style.transform = `translateY(${(center - vh/2)*0.06}px) scale(${1 - eased*0.06})`;
      }
      ticking=false;
    });
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  window.addEventListener("resize", onScroll, {passive:true});
  onScroll();

  /* ============================================================
     3D card tilt — only on real boxed cards (packages, portrait).
     Open layouts (principles, film grid) are intentionally excluded
     so text never spills past an implied box.
     ============================================================ */
  if(!coarsePointer.matches){
    const TILT = 5; // max degrees — subtle, professional
    document.querySelectorAll(".pkg, .portrait-slot").forEach(card=>{
      card.classList.add("tilt");
      const scene = card.parentElement;
      if(scene && !scene.classList.contains("tilt-scene")) scene.classList.add("tilt-scene");

      let raf=null, rect=null;
      const move=(e)=>{
        if(!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const ry = (px - 0.5) * (TILT * 2);
        const rx = (0.5 - py) * (TILT * 2);
        if(raf) return;
        raf = requestAnimationFrame(()=>{
          card.style.transform =
            `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
          raf=null;
        });
      };
      card.addEventListener("pointerenter",()=>{ rect = card.getBoundingClientRect(); card.classList.add("is-tilting"); });
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave",()=>{
        card.classList.remove("is-tilting");
        card.style.transform = "perspective(1100px) rotateX(0) rotateY(0) translateZ(0)";
        rect=null;
      });
    });
  }
})();
