import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildSite() {
  const dataPath = path.join(__dirname, 'cms-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Read existing index.html to extract the video src base64 so we never lose it
  const currentHtmlPath = path.join(__dirname, 'index.html');
  const currentHtml = fs.readFileSync(currentHtmlPath, 'utf8');
  const videoMatch = currentHtml.match(/<video[^>]+src="([^"]+)"/);
  const videoSrc = videoMatch ? videoMatch[1] : '';

  const esc = (s = '') =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const placeholderPalettes = [
    ['#14b8a6', '#7c3aed'],
    ['#0ea5e9', '#6366f1'],
    ['#8b5cf6', '#ec4899'],
    ['#10b981', '#3b82f6'],
    ['#f59e0b', '#7c3aed']
  ];

  const teamHtml = (data.team || [])
    .map(
      (m, idx) =>
        `<div class="tm" data-tm-idx="${idx}" role="button" tabindex="0" aria-label="View profile of ${esc(m.name)}">` +
        (m.image
          ? `<img src="${m.image}" alt="${esc(m.name)}">`
          : `<div class="pw" style="--a:#14b8a6;--c:#7c3aed"></div>`) +
        `<div class="ov"></div>` +
        `<div class="cap"><b>${esc(m.name)}</b><small>${esc(m.role)}</small></div></div>`
    )
    .join('\n');

  const portfolioHtml = (data.portfolio || [])
    .map((w, idx) => {
      const [c1, c2] = placeholderPalettes[idx % placeholderPalettes.length];
      const media = w.image
        ? `<img src="${w.image}" alt="${esc(w.name)}">`
        : `<div class="pw ph-card" style="--a:${c1};--c:${c2}"><div class="ph-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>PORTFOLIO PLACEHOLDER</span><small>${esc(w.category)}</small></div></div>`;
      return `<div class="wk"><div class="im">${media}</div><div class="t"><b>${esc(w.name)}</b><small>${esc(w.category)}</small></div></div>`;
    })
    .join('\n');

  const pricing = data.pricing || {};
  const featuresHtml = (pricing.features || [])
    .map((f) => `        <li>${esc(f)}</li>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Toskaa Studio — Unlimited Design Subscription</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap">
<style>
:root,:root[data-theme="light"]{color-scheme:light;--bg:#a6a2b3!important;--card:#fbfafd!important;--ink:#0d0d14!important;--mute:#6a6678!important;--line:#d9d5e3!important;--soft:#f1eff7!important;--a:#14b8a6;--b:#7c3aed;--g:radial-gradient(circle at 8% 95%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 95% 5%,rgba(124,58,237,.7),transparent 55%),#150f2b;--gt:linear-gradient(120deg,#14b8a6,#7c3aed);--dark:#150f2b!important;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0a0814;--card:#16121f;--ink:#f4f2fa;--mute:#a8a3b8;--line:#322c44;--soft:#1f1a2e;--dark:#0a0814}}
:root[data-theme="dark"]{--bg:#0a0814;--card:#16121f;--ink:#f4f2fa;--mute:#a8a3b8;--line:#322c44;--soft:#1f1a2e;--dark:#0a0814}
html{scroll-behavior:smooth;scroll-padding-top:90px}
*,*::before,*::after{box-sizing:inherit;border-radius:0!important}
body{margin:0;background:var(--card);color:var(--ink);font-family:"Inter Tight",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;line-height:1.5}
a{color:inherit;text-decoration:none}
.wrap{width:100%}
.card{background:var(--card);--p:clamp(18px,4vw,64px);padding:6px var(--p) var(--p)}
.nav{position:sticky;top:calc(env(safe-area-inset-top,0px) + 14px);z-index:25;display:flex;justify-content:space-between;align-items:center;gap:16px;background:var(--card);border:0;border-radius:99px;padding:12px 14px 12px 24px;box-shadow:0 10px 34px rgba(13,13,20,.1);margin:clamp(18px,2.5vw,30px) 0 44px}
.logo{display:flex;align-items:center;gap:9px;font-weight:600;letter-spacing:.2px}
.logo i{width:24px;height:24px;background:var(--g);border-radius:50% 8px 50% 8px;display:block}
.nav nav{display:flex;align-items:center;gap:clamp(14px,3vw,38px);font-size:15px}.nav nav a:not(.btn){position:relative;padding:6px 0;transition:.25s}.nav nav a:not(.btn)::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:2px;background:var(--gt);transform:scaleX(0);transform-origin:left;transition:transform .3s}.nav nav a:not(.btn):hover{transform:translateY(-2px);color:var(--b)}.nav nav a:not(.btn):hover::after{transform:scaleX(1)}
.btn{display:inline-block;background:var(--g);color:#fff;padding:13px 26px;font-weight:500;border:0;cursor:pointer;font:inherit;font-weight:500;border-radius:99px;transition:.2s}
.btn:hover{transform:scale(1.07)}.btn:active{transform:scale(.97)}
.btn.w2{background:#fff;color:#1a1033}
.nav .mob-cta,.menu-btn{display:none}
.menu-btn{flex-direction:column;justify-content:center;align-items:center;gap:5px;width:42px;height:42px;background:transparent;border:0;cursor:pointer;padding:0}
.menu-btn span{display:block;width:22px;height:2px;background:var(--ink);transition:transform .25s,opacity .25s}
.nav.open .menu-btn span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav.open .menu-btn span:nth-child(2){opacity:0}
.nav.open .menu-btn span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.meta{display:flex;justify-content:space-between;font-size:13px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;gap:12px;flex-wrap:wrap}
.hero{display:grid;grid-template-columns:1fr 230px;gap:30px;align-items:start}
.frame{position:relative;border:1px dashed var(--line);padding:clamp(10px,2vw,18px)}
.frame b{position:absolute;color:var(--b);font-size:20px;line-height:1;font-weight:400}
.frame b:nth-child(1){left:-9px;top:-10px}.frame b:nth-child(2){right:-9px;top:-10px}.frame b:nth-child(3){left:-9px;bottom:-10px}.frame b:nth-child(4){right:-9px;bottom:-10px}
h1{font-size:clamp(38px,6.8vw,100px);line-height:.98;letter-spacing:-.045em;font-weight:600;margin:0}
.chip{display:inline-block;height:.5em;width:1.8em;border-radius:99px;vertical-align:middle;background:var(--g);margin:0 .08em;position:relative;top:-.05em}
.chip.t{font-size:.2em;color:#fff;width:auto;height:auto;padding:0 1em;line-height:2.6;letter-spacing:0;font-weight:500;vertical-align:.8em;top:0}
.grad{background:var(--gt);-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.08em;margin-right:-.05em;padding-bottom:.04em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.under{display:flex;gap:20px;align-items:center;margin-top:18px;flex-wrap:wrap}
.tag{background:var(--g);color:#fff;font-size:clamp(14px,1.5vw,19px);line-height:1.25;padding:10px 14px;max-width:340px;border-radius:6px}

.watch{width:100%;aspect-ratio:230/260;border-radius:22px;background:radial-gradient(circle at 10% 90%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 90% 10%,rgba(124,58,237,.7),transparent 55%),#150f2b;position:relative}
.watch i{position:absolute;inset:0;margin:auto;width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.18)}
.watch i::after{content:"";position:absolute;left:27px;top:23px;border-left:19px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent}
.wl{font-size:15px;margin:12px 0 0}.watch{display:block;border:0;padding:0;cursor:pointer;transition:transform .3s}.watch:hover{transform:scale(1.04)}.watch i{transition:transform .3s}.watch:hover i{transform:scale(1.18)}
.vm{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:64px 20px 20px;background:rgba(8,6,16,.8);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s}.vm.on{opacity:1;visibility:visible}.vb{position:relative;width:min(960px,100%);transform:scale(.92);transition:transform .35s}.vm.on .vb{transform:scale(1)}.vm video{display:block;width:100%;aspect-ratio:16/9;background:#000}.vm .x{position:absolute;top:-48px;right:0;background:none;border:0;color:#fff;font-size:36px;line-height:1;cursor:pointer;transition:transform .25s}.vm .x:hover{transform:scale(1.2) rotate(90deg)}
.hero2{display:grid;grid-template-columns:1.1fr 1fr 1fr;background:var(--g);color:#fff;margin-top:44px;align-items:stretch}.hero2>*{padding:clamp(22px,3vw,40px)}.hero2>*+*{border-left:1px solid rgba(255,255,255,.28)}.pitch{display:flex;flex-direction:column;justify-content:space-between;gap:30px;font-size:clamp(20px,2.3vw,30px);line-height:1.2;letter-spacing:-.02em;font-weight:500}.pitch small{font-size:13px;opacity:.7;font-weight:500;text-transform:uppercase;letter-spacing:.14em}
.mq{overflow:hidden}.track{display:flex;width:max-content;animation:l 70s linear infinite}@keyframes l{to{transform:translateX(-50%)}}@keyframes r{from{transform:translateX(-50%)}to{transform:translateX(0)}}@media(prefers-reduced-motion:reduce){.track{animation:none}}
.strip{margin:clamp(70px,9vw,130px) calc(-1*var(--p)) 0}
.tm{position:relative;flex:none;width:clamp(210px,23vw,300px);aspect-ratio:3/4;overflow:hidden;background:#1d1d1d;color:#fff;cursor:pointer}
.tm svg,.tm img,.tm .ov,.tm .pw{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tm svg,.tm img{filter:grayscale(1) brightness(var(--k,1))}
.tm svg,.tm img,.tm .pw{transition:transform .7s}
.tm:hover svg,.tm:hover img,.tm:hover .pw{transform:scale(1.08)}
.tm .ov{background:var(--g);opacity:.55;transition:opacity .4s}.tm:hover .ov{opacity:.3}
.tm .cap{position:absolute;left:0;bottom:0;width:100%;padding:22px 20px;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent)}
.tm b{display:block;font-size:20px;font-weight:600;letter-spacing:-.02em}.tm small{font-size:14px;opacity:.85}
.pw{background:linear-gradient(145deg,var(--a),var(--c))}.wk{flex:none;width:max(40vw,250px)}.wk .im{position:relative;aspect-ratio:4/3;overflow:hidden}.cols3.nogap{gap:0}.nogap .box{position:relative}.nogap .box:hover{z-index:2;background:var(--g);box-shadow:0 22px 40px -14px rgba(124,58,237,.5)}.ic{display:block;width:60px;height:60px;padding:14px;margin-bottom:26px;background:var(--g);transition:background .35s}.ic svg{width:100%;height:100%;fill:none;stroke:#fff;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:stroke .35s}.box:hover .ic{background:#fff}.box:hover .ic svg{stroke:url(#gi)}
.wk .pw,.wk img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s}.wk:hover .pw,.wk:hover img{transform:scale(1.06)}.wk .t{padding:16px 20px 4px}.wk b{display:block;font-size:20px;font-weight:600;letter-spacing:-.02em}.wk small{color:var(--mute);font-size:14px}
.pw.ph-card{display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 15% 85%,var(--a),transparent 60%),radial-gradient(circle at 85% 15%,var(--c),transparent 60%),#150f2b}
.pw.ph-card::after{display:none}
.ph-inner{width:76%;height:68%;background:rgba(255,255,255,.92);color:#150f2b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-shadow:0 18px 40px rgba(0,0,0,.25);border:1px dashed rgba(124,58,237,.45);padding:16px;text-align:center}
.ph-inner svg{width:38px;height:38px;stroke:#7c3aed;opacity:.85}
.ph-inner span{font-size:12px;font-weight:700;letter-spacing:.14em;color:#150f2b}
.ph-inner small{font-size:13px;color:#6a6678;font-weight:500}

/* Team Detail Popup Modal */
.tmm{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,6,16,.76);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}
.tmm.on{opacity:1;visibility:visible}
.tmb{position:relative;width:min(760px,100%);min-height:400px;background:var(--card);color:var(--ink);border:1px solid var(--line);display:grid;grid-template-columns:42% 58%;overflow:hidden;padding:0;box-shadow:0 28px 70px rgba(0,0,0,.38);transform:scale(.94);transition:transform .3s}
.tmm.on .tmb{transform:scale(1)}
.tmb-img{position:relative;width:100%;height:100%;min-height:400px;margin:0;padding:0;background:#150f2b;overflow:hidden}
.tmb-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1)}
.tmb-img .ov{position:absolute;inset:0;background:var(--g);opacity:.45;pointer-events:none}
.tmb-body{padding:clamp(26px,4vw,44px);display:flex;flex-direction:column;justify-content:center;position:relative;background:var(--card)}
.tmb-x{position:absolute;top:14px;right:14px;width:36px;height:36px;background:var(--soft);border:1px solid var(--line);color:var(--ink);font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}
.tmb-x:hover{background:var(--g);color:#fff;border-color:transparent}
.tmb-role{font-size:13px;color:var(--b);font-weight:600;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.tmb-name{font-size:clamp(26px,3.2vw,36px);font-weight:600;letter-spacing:-.03em;line-height:1.08;margin:0 0 16px}
.tmb-line{height:1px;background:var(--line);width:100%;margin-bottom:16px}
.tmb-lbl{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--mute);font-weight:600;margin-bottom:6px}
.tmb-desc{font-size:16px;line-height:1.65;color:var(--ink);margin:0}

.grid div:nth-child(1){background:radial-gradient(circle at 15% 90%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 85% 10%,rgba(124,58,237,.7),transparent 55%),#150f2b}
.grid div:nth-child(2){background:radial-gradient(circle at 90% 10%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 10% 90%,rgba(124,58,237,.7),transparent 55%),#150f2b}
.grid div:nth-child(3){background:radial-gradient(circle at 15% 15%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 80% 90%,rgba(124,58,237,.7),transparent 55%),#150f2b}
.grid div:nth-child(4){background:radial-gradient(circle at 20% 90%,rgba(124,58,237,.7),transparent 55%),radial-gradient(circle at 85% 20%,rgba(20,184,166,.6),transparent 55%),#150f2b}
.grid div:nth-child(5){background:radial-gradient(circle at 5% 90%,rgba(20,184,166,.6),transparent 50%),radial-gradient(circle at 95% 10%,rgba(124,58,237,.7),transparent 50%),#150f2b}
.svc{list-style:none;margin:0;align-self:center}
.svc li{display:flex;gap:16px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.28);font-size:17px}
.svc li span{color:rgba(255,255,255,.65);min-width:26px;transition:.3s}.svc li{transition:.3s;cursor:default}.svc li:hover{padding-left:16px;background:rgba(255,255,255,.12)}.svc li:hover span{color:#5eead4}
.cta{color:#fff;padding:clamp(22px,3vw,40px);display:flex;flex-direction:column;justify-content:space-between;font-size:clamp(20px,2.3vw,28px);line-height:1.15;min-height:260px;transition:.2s}
.cta:hover{background:rgba(255,255,255,.08)}.cta i,.cta span{display:inline-block;transition:.25s;transform-origin:left bottom}.cta i{transform-origin:left center}.cta:hover i{transform:scale(1.3)}.cta:hover span{transform:scale(1.05)}
.cta i{font-style:normal;font-size:46px;line-height:1}
.cta small{display:block;font-size:14px;opacity:.85;margin-top:8px}
section{margin-top:clamp(70px,9vw,130px)}
.eyebrow{font-size:13px;color:var(--b);font-weight:600;text-transform:uppercase;letter-spacing:.14em;margin-bottom:12px}
h2{font-size:clamp(30px,5vw,64px);letter-spacing:-.04em;line-height:1;margin:0 0 18px;font-weight:600}
.lead{color:var(--mute);max-width:560px;font-size:18px;margin:0 0 32px}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.box{background:var(--soft);padding:26px;transition:.35s}.box:hover{transform:translateY(-8px);background:var(--g);color:#fff;box-shadow:0 22px 40px -14px rgba(124,58,237,.5)}.box:hover p{color:rgba(255,255,255,.85)}
.box b{display:inline-block;font-size:55px;line-height:1;font-weight:600;letter-spacing:-.04em;margin-bottom:26px;background:var(--gt);-webkit-background-clip:text;background-clip:text;color:transparent;transition:.35s}.box:hover b{background:none;color:#fff}
.box h3{margin:0 0 6px;font-size:22px;letter-spacing:-.02em}
.box p{margin:0;color:var(--mute)}
.who{padding:24px 0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}.who .track{animation-name:r;animation-duration:55s}
.who span{flex:none;margin-right:12px;border:1px solid var(--line);padding:12px 26px;font-size:17px;cursor:default;position:relative;transition:.3s}.who span:hover{transform:scale(1.22);z-index:2;background:var(--g);color:#fff;border-color:transparent;box-shadow:0 14px 30px -10px rgba(124,58,237,.6)}
.price{display:grid;grid-template-columns:1fr 1fr;gap:30px;background:radial-gradient(circle at 10% 90%,rgba(20,184,166,.45),transparent 45%),radial-gradient(circle at 95% 10%,rgba(124,58,237,.55),transparent 50%),var(--dark);border-radius:36px;padding:clamp(24px,5vw,60px);align-items:center;color:#fff}
.price h2{margin:0;font-size:clamp(28px,3.8vw,50px);line-height:1.08}
.amt{font-size:clamp(44px,6vw,72px);font-weight:600;letter-spacing:-.04em;line-height:1}
.amt small{font-size:18px;font-weight:400;opacity:.8;letter-spacing:0}
.price ul{padding-left:20px;margin:18px 0 28px;line-height:1.9}
.price p{margin:18px 0 0;opacity:.85}
.tw{overflow-x:auto}
.cmp{width:100%;border-collapse:collapse;font-size:17px;min-width:480px}
.cmp th,.cmp td{text-align:left;padding:16px 10px;border-bottom:1px solid var(--line);transition:background .3s,padding .3s}.cmp tr:hover td{background:var(--soft)}.cmp tr:hover td:first-child{padding-left:26px}.cmp tr:hover td:last-child{padding-left:22px}
.cmp th{font-size:14px;color:var(--mute);font-weight:500}
.cmp th:last-child,.cmp td:last-child{color:var(--b);font-weight:600}
details{border-bottom:1px solid var(--line);padding:20px 0}
summary{cursor:pointer;font-size:20px;font-weight:500;list-style:none;display:flex;justify-content:space-between;gap:16px}
summary::after{content:"+";color:var(--b);font-size:26px;line-height:1;transition:transform .35s}
details.o summary::after{transform:rotate(45deg)}
details p{color:var(--mute);margin:12px 0 0;max-width:680px;overflow:hidden}
.final{background:var(--g);color:#fff;padding:clamp(28px,6vw,80px);text-align:center;border-radius:28px}
.final h2{margin-inline:auto;max-width:800px}
footer{display:flex;justify-content:center;align-items:center;text-align:center;flex-wrap:wrap;gap:12px;margin-top:50px;color:var(--mute);font-size:14px}
@media(max-width:900px){
  .hero,.hero2,.price,.cols3{grid-template-columns:1fr}
  .nav{padding:10px 14px 10px 20px;margin:14px 0 32px}
  .nav .nav-cta{display:none}
  .menu-btn{display:flex}
  .nav nav{display:none;position:absolute;top:calc(100% + 10px);left:0;right:0;background:var(--card);box-shadow:0 18px 40px rgba(13,13,20,.14);padding:20px 22px;flex-direction:column;align-items:stretch;gap:12px;z-index:30}
  .nav.open nav{display:flex}
  .nav nav a:not(.btn){padding:8px 0;border-bottom:1px solid var(--line);font-size:16px}
  .nav nav .mob-cta{display:block;text-align:center;margin-top:6px}
  .meta{display:block;font-size:12px;letter-spacing:.1em;margin-bottom:14px}
  .meta span:first-child::after{content:", "}
  .watch{width:100%;max-width:100%;aspect-ratio:16/9}
  .hero2>*+*{border-left:0;border-top:1px solid rgba(255,255,255,.28)}
  .grid{grid-template-columns:1fr 1fr}
  .grid div:nth-child(5){grid-column:span 2}
  .tw{overflow-x:visible}
  .cmp{min-width:0;width:100%;font-size:clamp(12px,3.2vw,15px)}
  .cmp th{font-size:clamp(11px,2.9vw,13px)}
  .cmp th,.cmp td{padding:11px 6px}
  .cmp tr:hover td:first-child,.cmp tr:hover td:last-child{padding-left:6px}
  .wk{width:66.666vw}
  .wk .t{padding:12px 14px 4px}
  .wk b{font-size:17px}
  .wk small{font-size:13px}
}
@media(max-width:640px){.tmb{grid-template-columns:1fr}.tmb-img{min-height:260px}}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="gi" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs></svg>
<div class="wrap"><div class="card">

<div class="nav" id="navbar">
  <a class="logo" href="#top"><i></i>TOSKAA STUDIO</a>
  <nav id="nav-menu"><a href="#services">Services</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#works">Our Works</a><a href="#faq">FAQ</a></nav>
  <a class="btn nav-cta" href="#pricing">Get Started</a>
  <button class="menu-btn" id="mbtn" aria-label="Toggle navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>
</div>

<div id="top" class="meta"><span>Design Subscription</span><span>Pause or cancel anytime</span></div>
<div class="hero">
  <div>
    <div class="frame"><b>✦</b><b>✦</b><b>✦</b><b>✦</b>
      <h1>Your Time Belongs to Strategy. <span class="grad">Leave the</span> <span class="grad">Design to Us.</span></h1>
    </div>
    <div class="under">
      <a class="btn" href="#pricing">See Pricing</a>
    </div>
  </div>
  <div><button class="watch" id="vbtn" aria-label="Play video"><i></i></button><p class="wl">SEE HOW IT WORKS</p></div>
</div>

<div class="hero2" id="services">
  <div class="pitch"><small>Flat monthly fee</small><span>Unlimited design requests for one flat monthly fee. No contracts, no recruiting, no overhead.</span></div>
  <a class="cta" href="#pricing"><i>↗</i><span>LET’S<br>START A PROJECT<small id="cta-subtext">${esc(pricing.ctaSubtext || 'From $1,850/month')}</small></span></a>
  <ul class="svc">
    <li><span>1</span>UI/UX Design</li><li><span>2</span>Branding</li><li><span>3</span>Web Development</li><li><span>4</span>Marketing Creatives</li><li><span>5</span>Printed Visualization</li>
  </ul>
</div>
<div class="mq strip" id="team-strip"${data.showTeam === false ? ' style="display:none"' : ''}><div class="track" id="team-track">
${teamHtml}
</div></div>

<section id="who">
  <div class="eyebrow">Who it’s for</div>
  <h2>Great design, without building a team.</h2>
  <p class="lead">Scalable creative support for businesses that need consistent, professional design but don’t have an in-house team or the time to hire one.</p>
  <div class="mq who"><div class="track"><span>Startups</span><span>Small businesses</span><span>Marketing teams</span><span>Agencies</span><span>SaaS companies</span><span>Founders</span><span>E-commerce brands</span><span>Real estate</span><span>Education</span></div></div>
</section>

<section id="how">
  <div class="eyebrow">How it works</div>
  <h2>Subscribe. Request. Receive.</h2>
  <p class="lead">A simple, predictable workflow that keeps your projects moving.</p>
  <div class="cols3">
    <div class="box"><b>01</b><h3>Subscribe</h3><p>Pick the plan and get access to your private request board in minutes.</p></div>
    <div class="box"><b>02</b><h3>Request anything</h3><p>Add as many requests as you like to your task queue. We handle them one by one.</p></div>
    <div class="box"><b>03</b><h3>Get fast delivery</h3><p>Receive polished work with an average 36-hour turnaround. Revise until you’re happy.</p></div>
  </div>
</section>

<section>
  <div class="eyebrow">What we do</div>
  <h2>One subscription, every creative need.</h2>
  <div class="cols3 nogap" style="margin-top:30px">
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></i><h3>UI/UX Design</h3><p>Web and mobile interfaces, prototypes, user flows and design systems.</p></div>
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/></svg></i><h3>Branding</h3><p>Logos, brand guidelines, identity systems and collateral.</p></div>
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg></i><h3>Web Development</h3><p>Fast, responsive websites and landing pages built to convert visitors into customers.</p></div>
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg></i><h3>Marketing Creatives</h3><p>Social posts, ads, banners, decks and email templates.</p></div>
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1.5"/></svg></i><h3>Printed Visualization</h3><p>Brochures, flyers, posters, packaging and other print-ready materials.</p></div>
    <div class="box"><i class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></i><h3>And more</h3><p>Not on the list? Ask. If it’s design, we’ll likely cover it.</p></div>
  </div>
</section>

<section id="pricing">
  <div class="price">
    <div><h2 id="price-headline">${esc(pricing.headline || 'You focus on your business, we’ll handle the design.')}</h2></div>
    <div>
      <div class="amt"><span id="price-amt">${esc(pricing.amount || '$1,850')}</span> <small id="price-period">${esc(pricing.period || '/month')}</small></div>
      <p id="price-sub">${esc(pricing.subtitle || 'One subscription. Unlimited requests. Fast turnaround.')}</p>
      <ul id="price-features">
${featuresHtml}
      </ul>
      <a class="btn w2" href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3YJ13201AB3799113NLRPHHI">Start Now</a>
    </div>
  </div>
</section>

<section id="works">
  <div class="eyebrow">Our works</div>
  <h2>Selected projects we’ve delivered.</h2>
  <p class="lead">A small selection of recent work across product, branding, web and print.</p>
  <div class="mq strip" style="margin-top:34px"><div class="track" id="works-track">
${portfolioHtml}
  </div></div>
</section>

<section>
  <div class="eyebrow">The smarter choice</div>
  <h2>Subscription vs. in-house hire</h2>
  <div class="tw"><table class="cmp">
    <tr><th></th><th>In-house designer</th><th>Toskaa Studio</th></tr>
    <tr><td>Hiring time</td><td>Weeks to months</td><td>Start in days</td></tr>
    <tr><td>Cost</td><td>Salary, benefits, software</td><td>One flat monthly fee</td></tr>
    <tr><td>Skills</td><td>Usually one specialty</td><td>UI/UX, brand, web, print</td></tr>
    <tr><td>Flexibility</td><td>Long-term commitment</td><td>Pause or cancel anytime</td></tr>
  </table></div>
</section>

<section id="faq">
  <div class="eyebrow">FAQ</div>
  <h2>Questions, answered.</h2>
  <details><summary>How many requests can I make?</summary><p>As many as you like. Requests go into your task queue and are completed one at a time.</p></details>
  <details><summary>How fast is delivery?</summary><p>Our average turnaround is 36 hours. Larger projects may take longer, and we’ll let you know upfront.</p></details>
  <details><summary>Can I pause or cancel?</summary><p>Yes. Pause or cancel anytime, with no long-term contracts or hidden fees.</p></details>
  <details><summary>What if I don’t like a design?</summary><p>Tell us what to change and we’ll revise it until it matches your vision.</p></details>
  <details><summary>Who owns the final files?</summary><p>You do. Every approved design is yours, delivered with source files.</p></details>
</section>

<section id="contact">
  <div class="final">
    <h2>Ready to scale your design?</h2>
    <p style="font-size:18px;margin:0 0 22px">Skip the hiring process and start getting great design this week.</p>
    <a class="btn w2" href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-3YJ13201AB3799113NLRPHHI">Start Your Subscription</a>
  </div>
</section>

<footer><span>© 2026 Toskaa Studio. All rights reserved.</span></footer>
</div></div>

<!-- Team Detail Popup Modal -->
<div class="tmm" id="tmm" role="dialog" aria-modal="true" aria-labelledby="tmm-name">
  <div class="tmb">
    <div class="tmb-img">
      <img id="tmm-img" src="" alt="">
      <div class="ov"></div>
    </div>
    <div class="tmb-body">
      <button class="tmb-x" id="tmm-close" aria-label="Close">×</button>
      <div class="tmb-role" id="tmm-role"></div>
      <h3 class="tmb-name" id="tmm-name"></h3>
      <div class="tmb-line"></div>
      <div class="tmb-lbl">Experience</div>
      <p class="tmb-desc" id="tmm-desc"></p>
    </div>
  </div>
</div>

<div class="vm" id="vm" role="dialog" aria-modal="true" aria-label="Video"><div class="vb"><button class="x" aria-label="Close">×</button><video id="vid" controls playsinline preload="none" src="${videoSrc}"></video></div></div>
<script>
window.TOSKAA_DEFAULT_DATA = ${JSON.stringify(data)};
(function(){
  let cmsData = window.TOSKAA_DEFAULT_DATA;
  try {
    const saved = localStorage.getItem('toskaa_cms_override_v2');
    if (saved) cmsData = JSON.parse(saved);
  } catch(e){}

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const palettes = [['#14b8a6','#7c3aed'],['#0ea5e9','#6366f1'],['#8b5cf6','#ec4899'],['#10b981','#3b82f6'],['#f59e0b','#7c3aed']];

  function renderCMSContent(d) {
    cmsData = d;
    if (d.pricing) {
      const p = d.pricing;
      const elAmt = document.getElementById('price-amt');
      const elPer = document.getElementById('price-period');
      const elSub = document.getElementById('cta-subtext');
      const elHead = document.getElementById('price-headline');
      const elLead = document.getElementById('price-sub');
      const elFeat = document.getElementById('price-features');
      if (elAmt && p.amount) elAmt.textContent = p.amount;
      if (elPer && p.period) elPer.textContent = p.period;
      if (elSub && p.ctaSubtext) elSub.textContent = p.ctaSubtext;
      if (elHead && p.headline) elHead.textContent = p.headline;
      if (elLead && p.subtitle) elLead.textContent = p.subtitle;
      if (elFeat && Array.isArray(p.features)) {
        elFeat.innerHTML = p.features.map(f => '<li>' + esc(f) + '</li>').join('');
      }
    }
    const ts = document.getElementById('team-strip');
    if (ts) {
      ts.style.display = d.showTeam === false ? 'none' : '';
    }
    if (Array.isArray(d.team) && d.team.length) {
      const tt = document.getElementById('team-track');
      if (tt) {
        delete tt._o;
        tt.innerHTML = d.team.map((m, idx) =>
          '<div class="tm" data-tm-idx="' + idx + '" role="button" tabindex="0" aria-label="View profile of ' + esc(m.name) + '">' +
          (m.image ? '<img src="' + m.image + '" alt="' + esc(m.name) + '">' : '<div class="pw" style="--a:#14b8a6;--c:#7c3aed"></div>') +
          '<div class="ov"></div>' +
          '<div class="cap"><b>' + esc(m.name) + '</b><small>' + esc(m.role) + '</small></div></div>'
        ).join('');
      }
    }
    if (Array.isArray(d.portfolio) && d.portfolio.length) {
      const wt = document.getElementById('works-track');
      if (wt) {
        delete wt._o;
        wt.innerHTML = d.portfolio.map((w, idx) => {
          const c = palettes[idx % palettes.length];
          const media = w.image
            ? '<img src="' + w.image + '" alt="' + esc(w.name) + '">'
            : '<div class="pw ph-card" style="--a:' + c[0] + ';--c:' + c[1] + '"><div class="ph-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>PORTFOLIO PLACEHOLDER</span><small>' + esc(w.category) + '</small></div></div>';
          return '<div class="wk"><div class="im">' + media + '</div><div class="t"><b>' + esc(w.name) + '</b><small>' + esc(w.category) + '</small></div></div>';
        }).join('');
      }
    }
  }

  renderCMSContent(cmsData);

  // Team Detail Modal Logic
  const tmm = document.getElementById('tmm');
  const tmmImg = document.getElementById('tmm-img');
  const tmmName = document.getElementById('tmm-name');
  const tmmRole = document.getElementById('tmm-role');
  const tmmDesc = document.getElementById('tmm-desc');
  const tmmClose = document.getElementById('tmm-close');

  function openTeamModal(idx) {
    const list = (cmsData && cmsData.team) || [];
    const member = list[idx];
    if (!member) return;
    tmmImg.src = member.image || '';
    tmmImg.alt = member.name || '';
    tmmName.textContent = member.name || '';
    tmmRole.textContent = member.role || '';
    tmmDesc.textContent = member.experience || '';
    tmm.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeTeamModal() {
    tmm.classList.remove('on');
    document.documentElement.style.overflow = '';
  }

  document.getElementById('team-strip').addEventListener('click', e => {
    const card = e.target.closest('.tm');
    if (card && card.dataset.tmIdx !== undefined) {
      openTeamModal( Number(card.dataset.tmIdx) );
    }
  });
  document.getElementById('team-strip').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.tm');
      if (card && card.dataset.tmIdx !== undefined) {
        e.preventDefault();
        openTeamModal( Number(card.dataset.tmIdx) );
      }
    }
  });
  tmmClose.addEventListener('click', closeTeamModal);
  tmm.addEventListener('click', e => { if (e.target === tmm) closeTeamModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && tmm.classList.contains('on')) closeTeamModal(); });

  // Mobile Menu Logic
  const navBar = document.getElementById('navbar');
  const mbtn = document.getElementById('mbtn');
  if (mbtn && navBar) {
    mbtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = navBar.classList.toggle('open');
      mbtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navBar.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('click', () => {
        navBar.classList.remove('open');
        mbtn.setAttribute('aria-expanded', 'false');
      });
    });
    addEventListener('click', e => {
      if (navBar.classList.contains('open') && !navBar.contains(e.target)) {
        navBar.classList.remove('open');
        mbtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

let bw=0;const build=()=>{if(innerWidth===bw)return;bw=innerWidth;document.querySelectorAll('.track').forEach(t=>{if(!t._o)t._o=[...t.children];t.replaceChildren(...t._o);const n=Math.max(1,Math.ceil(Math.max(innerWidth,screen.width)*1.2/(t.scrollWidth||1)));for(let i=0;i<2*n-1;i++)t._o.forEach(c=>t.appendChild(c.cloneNode(true)))})};build();addEventListener('resize',build);addEventListener('load',()=>{bw=0;build()});
document.querySelectorAll('details').forEach(d=>{const s=d.querySelector('summary'),c=d.querySelector('p');s.addEventListener('click',e=>{e.preventDefault();if(d.dataset.b)return;d.dataset.b=1;const fin=()=>{delete d.dataset.b};if(!d.open){d.open=true;d.classList.add('o');const h=c.offsetHeight;c.animate([{height:0,opacity:0,marginTop:0},{height:h+'px',opacity:1,marginTop:'12px'}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)'}).onfinish=fin}else{d.classList.remove('o');const h=c.offsetHeight;const a=c.animate([{height:h+'px',opacity:1,marginTop:'12px'},{height:0,opacity:0,marginTop:0}],{duration:320,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});a.onfinish=()=>{d.open=false;a.cancel();fin()}}})});
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){let t=scrollY,c=t,r=0;const tick=()=>{c+=(t-c)*.1;if(Math.abs(t-c)<.5){c=t;r=0}else r=requestAnimationFrame(tick);scrollTo({top:c,behavior:'instant'})};addEventListener('wheel',e=>{if(document.documentElement.style.overflow==='hidden'||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();const m=document.documentElement.scrollHeight-innerHeight;t=Math.max(0,Math.min(m,(r?t:scrollY)+e.deltaY*(e.deltaMode?32:1)));if(!r)r=requestAnimationFrame(tick)},{passive:false});addEventListener('scroll',()=>{if(!r){c=t=scrollY}})}
const vm=document.getElementById('vm'),vd=document.getElementById('vid');const openV=()=>{vm.classList.add('on');document.documentElement.style.overflow='hidden';vd.currentTime=0;vd.play().catch(()=>{})};const closeV=()=>{vm.classList.remove('on');document.documentElement.style.overflow='';vd.pause()};document.getElementById('vbtn').addEventListener('click',openV);vm.addEventListener('click',e=>{if(e.target===vm||e.target.classList.contains('x'))closeV()});addEventListener('keydown',e=>{if(e.key==='Escape')closeV()});
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), html, 'utf8');

  // Also build cms.html (kept in root, NOT in dist/, so it's never exposed publicly on Cloudflare!)
  const cmsHtml = `<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Toskaa Studio — Local CMS Admin</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap">
<style>
:root{--bg:#f4f2f9;--card:#ffffff;--ink:#0d0d14;--mute:#6a6678;--line:#e2deed;--soft:#f8f7fc;--a:#14b8a6;--b:#7c3aed;--g:radial-gradient(circle at 8% 95%,rgba(20,184,166,.6),transparent 55%),radial-gradient(circle at 95% 5%,rgba(124,58,237,.7),transparent 55%),#150f2b;--gt:linear-gradient(120deg,#14b8a6,#7c3aed)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Inter Tight",system-ui,-apple-system,sans-serif;line-height:1.5}
.top{background:#150f2b;color:#fff;padding:16px 28px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;position:sticky;top:0;z-index:20;box-shadow:0 4px 20px rgba(0,0,0,.15)}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:.02em}
.brand i{width:22px;height:22px;background:var(--g);border-radius:50% 6px 50% 6px;display:inline-block}
.badge-local{background:rgba(20,184,166,.2);color:#5eead4;border:1px solid rgba(94,234,212,.35);font-size:12px;padding:3px 10px;font-weight:600}
.actions{display:flex;gap:10px;flex-wrap:wrap}
.btn{padding:10px 18px;font:inherit;font-size:14px;font-weight:600;border:0;cursor:pointer;transition:.2s;display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.btn-sec{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2)}
.btn-sec:hover{background:rgba(255,255,255,.22)}
.btn-pri{background:var(--gt);color:#fff}
.btn-pri:hover{opacity:.92;transform:translateY(-1px)}
.btn-pub{background:#14b8a6;color:#081c19}
.btn-pub:hover{background:#2dd4bf}
.btn-danger{background:#fee2e2;color:#b91c1c;padding:7px 13px;font-size:13px}
.btn-danger:hover{background:#fecaca}
.btn-outline{background:var(--soft);color:var(--ink);border:1px solid var(--line);padding:8px 14px;font-size:13px}
.btn-outline:hover{border-color:var(--b);color:var(--b)}
.wrap{max-width:1100px;margin:28px auto;padding:0 20px 60px}
.tabs{display:flex;gap:8px;border-bottom:2px solid var(--line);margin-bottom:24px}
.tab{padding:12px 24px;font:inherit;font-weight:600;font-size:15px;background:transparent;border:0;color:var(--mute);cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:.2s}
.tab.active{color:var(--b);border-bottom-color:var(--b);background:var(--card)}
.panel{display:none}
.panel.active{display:block}
.card{background:var(--card);border:1px solid var(--line);padding:24px;margin-bottom:18px;box-shadow:0 4px 14px rgba(13,13,20,.03)}
.card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.card-head h2,.card-head h3{margin:0;font-size:20px}
.grid-item{display:grid;grid-template-columns:180px 1fr;gap:22px;align-items:start}
.thumb{width:180px;aspect-ratio:3/4;background:#150f2b;position:relative;overflow:hidden;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;text-align:center}
.thumb.landscape{aspect-ratio:4/3}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.thumb .ph-tag{padding:10px;background:rgba(124,58,237,.25);border:1px dashed rgba(255,255,255,.4);font-weight:600;letter-spacing:.06em}
.field{margin-bottom:14px}
.field label{display:block;font-size:13px;font-weight:600;color:var(--mute);margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
.field input,.field select,.field textarea{width:100%;padding:10px 12px;font:inherit;font-size:15px;border:1px solid var(--line);background:var(--soft);color:var(--ink)}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--b);background:#fff}
.field textarea{min-height:86px;resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.toast{position:fixed;bottom:24px;right:24px;background:#150f2b;color:#fff;padding:14px 22px;border-left:4px solid #14b8a6;box-shadow:0 14px 35px rgba(0,0,0,.25);font-weight:500;z-index:100;opacity:0;transform:translateY(12px);pointer-events:none;transition:.25s}
.toast.show{opacity:1;transform:translateY(0)}
.info-banner{background:#eefcf9;border:1px solid #99f6e4;color:#0f766e;padding:14px 18px;margin-bottom:22px;font-size:14px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.toggle-row{display:flex;justify-content:space-between;align-items:center;gap:16px;background:var(--card);border:1px solid var(--line);padding:16px 20px;margin-bottom:18px;box-shadow:0 4px 14px rgba(13,13,20,.03)}
.toggle-info b{display:block;font-size:16px;margin-bottom:2px}
.toggle-info small{color:var(--mute);font-size:13px}
.switch-wrap{display:flex;align-items:center;gap:12px}
.status-pill{font-size:12px;font-weight:700;padding:4px 10px;letter-spacing:.05em;text-transform:uppercase}
.status-pill.on{background:#dcfce7;color:#15803d}
.status-pill.off{background:#f3f4f6;color:#4b5563}
.switch{position:relative;display:inline-block;width:52px;height:28px;flex:none}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;cursor:pointer;inset:0;background:#cbd5e1;transition:.25s;border-radius:99px}
.slider::before{position:absolute;content:"";height:22px;width:22px;left:3px;bottom:3px;background:#fff;transition:.25s;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,.2)}
.switch input:checked + .slider{background:var(--gt)}
.switch input:checked + .slider::before{transform:translateX(24px)}
@media(max-width:700px){.grid-item,.row2{grid-template-columns:1fr}.thumb{width:140px}}
</style>
</head>
<body>

<div class="top">
  <div class="brand">
    <i></i> TOSKAA STUDIO — CMS
    <span class="badge-local" id="mode-badge">LOCAL ADMIN</span>
  </div>
  <div class="actions">
    <a class="btn btn-sec" href="index.html" target="_blank">↗ Lihat Website</a>
    <button class="btn btn-pri" id="btn-save">💾 Simpan Perubahan</button>
    <button class="btn btn-pub" id="btn-publish">🚀 Simpan & Push ke Git/Cloudflare</button>
  </div>
</div>

<div class="wrap">
  <div class="info-banner">
    <div>
      <strong>🔒 Mode Aman (Tidak Terekspos ke Publik):</strong> Halaman CMS ini disimpan di luar folder publik Cloudflare (<code>dist/</code>), sehingga tidak bisa diakses pengunjung luar di <code>toskaa.com</code>.
    </div>
  </div>

  <div class="tabs">
    <button class="tab active" data-tab="team">👥 Tim (${(data.team || []).length})</button>
    <button class="tab" data-tab="pricing">💳 Harga (Pricing)</button>
    <button class="tab" data-tab="portfolio">🖼️ Portfolio (${(data.portfolio || []).length})</button>
  </div>

  <!-- TAB TIM -->
  <div class="panel active" id="panel-team">
    <div class="toggle-row">
      <div class="toggle-info">
        <b>Tampilkan Section Tim di Website</b>
        <small>Aktifkan atau sembunyikan deretan foto anggota tim pada halaman utama website.</small>
      </div>
      <div class="switch-wrap">
        <span class="status-pill on" id="team-vis-badge">Ditampilkan</span>
        <label class="switch" aria-label="Toggle tampilkan section tim">
          <input type="checkbox" id="toggle-show-team" checked>
          <span class="slider"></span>
        </label>
      </div>
    </div>
    <div class="card-head">
      <h2>Kelola Anggota Tim & Popup Detail</h2>
      <button class="btn btn-pri" id="add-team">+ Tambah Anggota Tim</button>
    </div>
    <div id="team-list"></div>
  </div>

  <!-- TAB HARGA -->
  <div class="panel" id="panel-pricing">
    <div class="card">
      <div class="card-head">
        <h2>Pengaturan Harga & Paket Langganan</h2>
      </div>
      <div class="row2">
        <div class="field">
          <label>Harga Utama (Contoh: $1,850)</label>
          <input type="text" id="p-amount">
        </div>
        <div class="field">
          <label>Satuan Periode (Contoh: /month)</label>
          <input type="text" id="p-period">
        </div>
      </div>
      <div class="field">
        <label>Teks Harga pada Tombol CTA Hero (Contoh: From $1,850/month)</label>
        <input type="text" id="p-cta">
      </div>
      <div class="field">
        <label>Judul Seksi Harga (Headline)</label>
        <input type="text" id="p-headline">
      </div>
      <div class="field">
        <label>Sub-judul Seksi Harga</label>
        <input type="text" id="p-subtitle">
      </div>
      <div class="field">
        <label>Daftar Benefit / Fitur (Satu baris per poin)</label>
        <textarea id="p-features" rows="5"></textarea>
      </div>
    </div>
  </div>

  <!-- TAB PORTFOLIO -->
  <div class="panel" id="panel-portfolio">
    <div class="card-head">
      <h2>Kelola Portfolio (Our Works)</h2>
      <button class="btn btn-pri" id="add-portfolio">+ Tambah Project Baru</button>
    </div>
    <div id="portfolio-list"></div>
  </div>
</div>

<div class="toast" id="toast">Perubahan berhasil disimpan!</div>

<script>
const SERVICES = [
  "UI/UX Design",
  "Branding",
  "Web Development",
  "Marketing Creatives",
  "Printed Visualization"
];

let state = ${JSON.stringify(data)};

try {
  const localOverride = localStorage.getItem('toskaa_cms_override_v2');
  if (localOverride && location.protocol === 'file:') {
    state = JSON.parse(localOverride);
  }
} catch(e){}

// Try loading fresh data from local CMS server if running via buka_cms_lokal.bat
fetch('/api/cms')
  .then(r => r.ok ? r.json() : null)
  .then(d => {
    if (d) {
      state = d;
      document.getElementById('mode-badge').textContent = 'TERHUBUNG KE SERVER LOKAL';
      renderAll();
    }
  })
  .catch(() => {});

function showToast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = isError ? '#ef4444' : '#14b8a6';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

function compressImage(file, maxW, maxH, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const ratio = Math.min(maxW / w, maxH / h, 1);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function updateTeamVisibilityUI() {
  const isVisible = state.showTeam !== false;
  const chk = document.getElementById('toggle-show-team');
  const badge = document.getElementById('team-vis-badge');
  if (chk) chk.checked = isVisible;
  if (badge) {
    badge.textContent = isVisible ? 'Ditampilkan' : 'Disembunyikan';
    badge.className = 'status-pill ' + (isVisible ? 'on' : 'off');
  }
}

document.getElementById('toggle-show-team').addEventListener('change', function() {
  state.showTeam = this.checked;
  updateTeamVisibilityUI();
  showToast(this.checked ? 'Section Tim diaktifkan (klik Simpan untuk menerapkan).' : 'Section Tim disembunyikan (klik Simpan untuk menerapkan).');
});

function renderTeam() {
  updateTeamVisibilityUI();
  const wrap = document.getElementById('team-list');
  document.querySelector('[data-tab="team"]').textContent = '👥 Tim (' + state.team.length + ')';
  wrap.innerHTML = state.team.map((m, idx) => \`
    <div class="card">
      <div class="card-head">
        <h3>Anggota #\${idx + 1} — \${esc(m.name || 'Baru')}</h3>
        <button class="btn btn-danger" onclick="removeTeam(\${idx})">Hapus</button>
      </div>
      <div class="grid-item">
        <div>
          <div class="thumb">
            \${m.image ? '<img src="' + m.image + '" alt="">' : '<span class="ph-tag">TANPA FOTO</span>'}
          </div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
            <label class="btn btn-outline" style="justify-content:center;cursor:pointer">
              📷 Upload Foto
              <input type="file" accept="image/*" style="display:none" onchange="uploadTeamPhoto(\${idx}, this)">
            </label>
          </div>
        </div>
        <div>
          <div class="row2">
            <div class="field">
              <label>Nama Lengkap</label>
              <input type="text" value="\${esc(m.name)}" oninput="state.team[\${idx}].name = this.value">
            </div>
            <div class="field">
              <label>Role / Jabatan</label>
              <input type="text" value="\${esc(m.role)}" oninput="state.team[\${idx}].role = this.value">
            </div>
          </div>
          <div class="field">
            <label>Deskripsi Pengalaman Singkat (Muncul di Popup Detail Saat Diklik)</label>
            <textarea oninput="state.team[\${idx}].experience = this.value">\${esc(m.experience)}</textarea>
          </div>
        </div>
      </div>
    </div>
  \`).join('');
}

window.uploadTeamPhoto = function(idx, input) {
  if (!input.files || !input.files[0]) return;
  compressImage(input.files[0], 600, 800, dataUrl => {
    state.team[idx].image = dataUrl;
    renderTeam();
    showToast('Foto anggota tim berhasil dimuat.');
  });
};

window.removeTeam = function(idx) {
  if (state.team.length <= 1) return showToast('Minimal harus ada 1 anggota tim.', true);
  state.team.splice(idx, 1);
  renderTeam();
};

document.getElementById('add-team').addEventListener('click', () => {
  state.team.push({
    id: 'tm-' + Date.now(),
    name: 'New Team Member',
    role: 'Product Designer',
    experience: '5+ years of experience crafting digital products, brand identities, and modern interface systems.',
    image: state.team[0] ? state.team[0].image : ''
  });
  renderTeam();
});

function renderPricing() {
  const p = state.pricing || {};
  document.getElementById('p-amount').value = p.amount || '$1,850';
  document.getElementById('p-period').value = p.period || '/month';
  document.getElementById('p-cta').value = p.ctaSubtext || 'From $1,850/month';
  document.getElementById('p-headline').value = p.headline || '';
  document.getElementById('p-subtitle').value = p.subtitle || '';
  document.getElementById('p-features').value = (p.features || []).join('\\n');
}

function collectPricing() {
  state.pricing = {
    amount: document.getElementById('p-amount').value.trim(),
    period: document.getElementById('p-period').value.trim(),
    ctaSubtext: document.getElementById('p-cta').value.trim(),
    headline: document.getElementById('p-headline').value.trim(),
    subtitle: document.getElementById('p-subtitle').value.trim(),
    features: document.getElementById('p-features').value.split('\\n').map(s => s.trim()).filter(Boolean)
  };
}

function renderPortfolio() {
  const wrap = document.getElementById('portfolio-list');
  document.querySelector('[data-tab="portfolio"]').textContent = '🖼️ Portfolio (' + state.portfolio.length + ')';
  wrap.innerHTML = state.portfolio.map((w, idx) => \`
    <div class="card">
      <div class="card-head">
        <h3>Project #\${idx + 1} — \${esc(w.name || 'Project Baru')}</h3>
        <button class="btn btn-danger" onclick="removePortfolio(\${idx})">Hapus</button>
      </div>
      <div class="grid-item">
        <div>
          <div class="thumb landscape">
            \${w.image ? '<img src="' + w.image + '" alt="">' : '<span class="ph-tag">PLACEHOLDER AKTIF</span>'}
          </div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
            <label class="btn btn-outline" style="justify-content:center;cursor:pointer">
              🖼️ Upload Gambar
              <input type="file" accept="image/*" style="display:none" onchange="uploadPortfolioImage(\${idx}, this)">
            </label>
            \${w.image ? '<button class="btn btn-outline" onclick="clearPortfolioImage(' + idx + ')">Gunakan Placeholder</button>' : ''}
          </div>
        </div>
        <div>
          <div class="field">
            <label>Nama Project / Portfolio</label>
            <input type="text" value="\${esc(w.name)}" oninput="state.portfolio[\${idx}].name = this.value">
          </div>
          <div class="field">
            <label>Kategori Servis (5 Layanan Utama)</label>
            <select onchange="state.portfolio[\${idx}].category = this.value">
              \${SERVICES.map(s => '<option value="' + esc(s) + '"' + (w.category === s ? ' selected' : '') + '>' + esc(s) + '</option>').join('')}
            </select>
          </div>
        </div>
      </div>
    </div>
  \`).join('');
}

window.uploadPortfolioImage = function(idx, input) {
  if (!input.files || !input.files[0]) return;
  compressImage(input.files[0], 960, 720, dataUrl => {
    state.portfolio[idx].image = dataUrl;
    renderPortfolio();
    showToast('Gambar portfolio berhasil di-upload.');
  });
};

window.clearPortfolioImage = function(idx) {
  state.portfolio[idx].image = '';
  renderPortfolio();
  showToast('Gambar dikembalikan ke mode Placeholder.');
};

window.removePortfolio = function(idx) {
  if (state.portfolio.length <= 1) return showToast('Minimal harus ada 1 portfolio.', true);
  state.portfolio.splice(idx, 1);
  renderPortfolio();
};

document.getElementById('add-portfolio').addEventListener('click', () => {
  state.portfolio.push({
    id: 'wk-' + Date.now(),
    name: 'Nama Project Baru',
    category: SERVICES[0],
    image: ''
  });
  renderPortfolio();
});

function renderAll() {
  renderTeam();
  renderPricing();
  renderPortfolio();
}

renderAll();

async function saveChanges(andPublish = false) {
  collectPricing();
  try {
    localStorage.setItem('toskaa_cms_override_v2', JSON.stringify(state));
  } catch(e){}

  try {
    const endpoint = andPublish ? '/api/publish' : '/api/cms';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (res.ok) {
      const out = await res.json();
      showToast(out.message || (andPublish ? 'Berhasil disimpan & di-push ke GitHub/Cloudflare!' : 'Berhasil disimpan ke index.html!'));
      return;
    }
  } catch (err) {
    // Fallback if opened directly without local server
  }
  showToast('Disimpan di browser preview! Jalankan buka_cms_lokal.bat untuk menyimpan permanen & push ke Git.');
}

document.getElementById('btn-save').addEventListener('click', () => saveChanges(false));
document.getElementById('btn-publish').addEventListener('click', () => saveChanges(true));
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'cms.html'), cmsHtml, 'utf8');
  return { html, cmsHtml };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  buildSite();
  console.log('Site and CMS built successfully from cms-data.json');
}
