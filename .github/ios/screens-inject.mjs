// App Store skrinshotlari uchun: www/index.html ga (faqat skrinshot yig'ishda!) namunaviy ma'lumot va
// ekranlarni ketma-ket almashtiruvchi skript qo'shiladi. Ishlab chiqarish (TestFlight) yig'ishiga tegmaydi.
// Ishlatish: node screens-inject.mjs www/index.html
import { readFileSync, writeFileSync } from 'node:fs';
const f = process.argv[2] || 'www/index.html';
let h = readFileSync(f, 'utf8');

// 1) <head> boshida: onboarding o'tkazib yuboriladi, namunaviy kundalik yoziladi (faqat kalitlar bo'sh bo'lsa)
const seed = `<script>(function(){try{
if(localStorage.getItem('hayz-kd-v1')) return;
var D=864e5, p=function(n){return (n<10?'0':'')+n;};
var tl=function(t){var d=new Date(t);return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());};
var d0=new Date(); d0.setHours(7,0,0,0); var base=d0.getTime();
var log=[]; [10,38,66,94,122,150].forEach(function(ago,i){ var a=base-ago*D, len=(i%2?5:6); log.push({id:'s'+i,a:tl(a),b:tl(a+len*D),c:(i%3==2?'jigar':'qizil')}); });
var kd={v:1,prof:{who:'o',H:6,T:24,N:40,anchor:'',gusl:20,hoff:-1,ism:'Муслима',fam:'',yosh:28,mazhab:'hanafiy',reader:false,onb:true,hol:'o',pr:{f:'05:05',s:'06:25',z:'12:35',a:'16:45',m:'18:40',i:'19:55'}},log:log,births:[],preg:{on:false,from:'',basis:'lmp'},qz:{rd:0,nd:0,ign:{}},gusl:{},mz:{kind:'istihoza',q1:'',q2:'',q3:''},notes:[],ui:{m:null}};
localStorage.setItem('hayz-kd-v1',JSON.stringify(kd));
localStorage.setItem('hayz-tour','1');
localStorage.setItem('hayz-skin','pushti');
localStorage.setItem('hayz-theme','light');
}catch(e){}})();</script>`;
if (!h.includes('<head>')) { console.error('::error::<head> topilmadi'); process.exit(1); }
h = h.replace('<head>', '<head>' + seed);

// 2) </body> oldidan: ekranlarni ketma-ket ochadi; har biri tayyor bo'lganda trace.txt (Documents) ga yozadi
const cyc = `<script>(function(){
var STEPS=[
 ['#bosh',null],
 ['#kundalik/taqvim',null],
 ['#calc','out'],
 ['#talim/atamalar',null],
 ['#savol','oqQ'],
 ['#sozlama',null]];
var FS=null; try{ FS=Capacitor.Plugins.Filesystem; }catch(e){}
function trace(s){ try{ if(FS) return FS.writeFile({path:'trace.txt',data:s,directory:'DOCUMENTS',encoding:'utf8'}); }catch(e){} }
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
(async function(){
 trace('boot');
 await sleep(8000);
 for(var i=0;i<STEPS.length;i++){
  var st=STEPS[i];
  location.hash=st[0];
  await sleep(1500);
  try{
   if(st[1]==='out'){ var o=document.getElementById('out'); if(o) o.scrollIntoView({block:'start'}); }
   if(st[1]==='oqQ'){ var q=document.getElementById('oqQ'); if(q){ q.value='нифос'; q.dispatchEvent(new Event('input',{bubbles:true})); } }
  }catch(e){}
  await sleep(2000);
  var h2=document.querySelector('.panel:not([hidden]) h2');
  var info=[i,st[0],document.body.dataset.tab,(h2&&h2.textContent)||'',!!document.getElementById('opening'),!!document.getElementById('onb'),!!document.getElementById('tuhrTour'),!!document.getElementById('tuhrLock'),scrollY|0].join('|');
  await trace(info);
  await sleep(6500);
 }
 trace('done');
})();
})();</script>`;
if (!h.includes('</body>')) { console.error('::error::</body> topilmadi'); process.exit(1); }
const k = h.lastIndexOf('</body>');
h = h.slice(0, k) + cyc + h.slice(k);
writeFileSync(f, h);
console.log('skrinshot uchun skriptlar qo\'shildi');
