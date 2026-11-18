'use strict';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const fa=new Intl.NumberFormat('fa-IR');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let toastTimer;
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),4500)}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('کپی شد؛ می‌توانی برای همراهت بفرستی.')}catch{toast('مرورگر اجازهٔ کپی نداد؛ متن را انتخاب و کپی کن.')}}
const nav=$('#navigation'),navToggle=$('.nav-toggle'),mega=$('#mega-menu'),megaToggle=$('.mega-toggle');
function closeMega(restore=false){mega.hidden=true;megaToggle.setAttribute('aria-expanded','false');if(restore)megaToggle.focus()}
function closeNav(restore=false){nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','باز کردن منو');closeMega();if(restore)navToggle.focus()}
navToggle.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'بستن منو':'باز کردن منو');if(!open)closeMega()});
megaToggle.addEventListener('click',()=>{const open=megaToggle.getAttribute('aria-expanded')!=='true';mega.hidden=!open;megaToggle.setAttribute('aria-expanded',String(open))});
document.addEventListener('click',event=>{if(!event.target.closest('.mega-wrap'))closeMega();if(!event.target.closest('.site-header'))closeNav()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!mega.hidden)closeMega(true);else if(nav.classList.contains('open'))closeNav(true)}});
nav.addEventListener('focusout',()=>{setTimeout(()=>{if(!nav.contains(document.activeElement))closeMega()},0)});
let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{$('.site-header').classList.toggle('scrolled',scrollY>20);ticking=false});ticking=true}},{passive:true});
$$('[data-year]').forEach(node=>node.textContent=fa.format(new Date().getFullYear()).replace(/٬/g,''));
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window&&!reduceMotion){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:.08});$$('.reveal').forEach(node=>observer.observe(node));document.documentElement.classList.add('motion-ready')}
// Menu contents are kept separate from presentation and loaded only on menu pages.
const grid=$('#menu-grid');
const labels={coffee:'قهوه‌های گرم',cold:'نوشیدنی‌های سرد',breakfast:'صبحانه و میان‌وعده',cake:'کیک و شیرینی',all:'همهٔ منو'};
const normalize=value=>value.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').trim().toLowerCase();
if(grid){
 let menus={},category='coffee';const search=$('#menu-search');
 const detail=document.createElement('dialog');detail.id='item-dialog';detail.setAttribute('aria-label','جزئیات منو');document.body.append(detail);
 function details(item,cat,index){
  const [name,price,description,,tag]=item;
  const allergens=cat==='cake'||cat==='breakfast'?'ممکن است شامل شیر، گلوتن، تخم‌مرغ یا مغزها باشد.':(/لاته|کاپوچینو/.test(name)?'در ترکیب پیشنهادی از شیر استفاده شده است.':'ترکیبات و شیوهٔ تهیه را پیش از سفارش با کافه بررسی کن.');
  detail.innerHTML=`<button class="close-dialog" aria-label="بستن جزئیات">×</button><div class="item-dialog-grid"><img src="assets/images/${cat}-${index}.jpg" alt="${escapeHTML(name)}"><div class="item-dialog-copy"><span class="eyebrow">${escapeHTML(tag||labels[cat])}</span><h2>${escapeHTML(name)}</h2><p>${escapeHTML(description)}</p><span class="item-dialog-price">${escapeHTML(price)} <small>هزار تومان</small></span><p class="fine-print">قیمت و ترکیبات، نمونه و قابل تغییر هستند.</p><div class="notice"><p>${allergens} در صورت حساسیت غذایی، تأیید کارکنان کافه ضروری است.</p></div></div></div>`;
  $('.close-dialog',detail).addEventListener('click',()=>detail.close());detail.showModal();
 }
 function render(){
  const query=normalize(search?.value||'');const cats=category==='all'?Object.keys(menus):[category];let count=0;const cards=[];
  cats.forEach(cat=>menus[cat].forEach((item,index)=>{const [name,price,description,,tag]=item;if(query&&!normalize(name+' '+description).includes(query))return;count++;
   const card=document.createElement('article');card.className='menu-card';card.innerHTML=`<button class="menu-photo" aria-label="جزئیات ${escapeHTML(name)}"><img src="assets/images/${cat}-${index}.jpg" alt="${escapeHTML(name)}" loading="lazy" decoding="async">${tag?`<span class="menu-tag">${escapeHTML(tag)}</span>`:''}<span class="menu-plus" aria-hidden="true">+</span></button><div class="menu-name"><h3>${escapeHTML(name)}</h3><span class="price">${escapeHTML(price)}</span></div><p>${escapeHTML(description)}</p>`;
   $('button',card).addEventListener('click',()=>details(item,cat,index));cards.push(card);
  }));
  grid.replaceChildren(...cards);grid.hidden=count===0;const empty=$('#menu-empty');if(empty)empty.hidden=count!==0;$('#menu-result').textContent=`${fa.format(count)} انتخاب در ${labels[category]}`;
 }
 function setCategory(next,update=false){category=Object.hasOwn(menus,next)||next==='all'?next:'coffee';$$('[data-category]').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});render();if(update&&document.body.dataset.page==='menu.html'){const url=new URL(location.href);url.searchParams.set('category',category);history.replaceState(null,'',url)}}
 fetch(new URL('assets/menu.json',document.baseURI)).then(response=>{if(!response.ok)throw new Error('menu');return response.json()}).then(data=>{menus=data;setCategory(new URLSearchParams(location.search).get('category')||'coffee');$$('[data-category]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.category,true)));search?.addEventListener('input',render);$('#reset-search')?.addEventListener('click',()=>{search.value='';setCategory('all',true);search.focus()})}).catch(()=>{grid.innerHTML='<p class="fine-print">بارگذاری منو انجام نشد. لطفاً صفحه را دوباره باز کن.</p>';$('#menu-result').textContent='منو بارگذاری نشد.'});
 detail.addEventListener('click',event=>{if(event.target===detail){const r=detail.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detail.close()}});
}
const photoDialog=$('#photo-dialog'),galleryButtons=$$('.gallery-item');
if(galleryButtons.length){
 const image=$('img',photoDialog),caption=$('p',photoDialog);image.className='dialog-gallery-image';photoDialog.setAttribute('aria-label','گالری تصاویر');let photos=[],current=0;
 function showPhoto(){const source=photos[current];image.src=$('img',source).src;image.alt=$('img',source).alt;caption.textContent=source.dataset.caption;$('#photo-position').textContent=`${fa.format(current+1)} از ${fa.format(photos.length)}`}
 function move(direction){current=(current+direction+photos.length)%photos.length;showPhoto()}
 galleryButtons.forEach(button=>button.addEventListener('click',()=>{photos=galleryButtons.filter(node=>!node.hidden);current=photos.indexOf(button);showPhoto();photoDialog.showModal()}));
 $('.close-dialog',photoDialog).addEventListener('click',()=>photoDialog.close());$('#photo-prev').addEventListener('click',()=>move(-1));$('#photo-next').addEventListener('click',()=>move(1));photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(1)}else if(event.key==='ArrowRight'){event.preventDefault();move(-1)}});
 photoDialog.addEventListener('click',event=>{if(event.target===photoDialog){const r=photoDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)photoDialog.close()}});
 $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{$$('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});galleryButtons.forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.gallery!==button.dataset.filter});$('#gallery-result').textContent=`${fa.format(galleryButtons.filter(item=>!item.hidden).length)} تصویر نمایش داده می‌شود.`}));
}
$$('.share-button').forEach(button=>button.addEventListener('click',async()=>{const url=location.href;try{if(navigator.share)await navigator.share({title:document.title,url});else await copyText(url)}catch(error){if(error.name!=='AbortError')toast('برای اشتراک‌گذاری، آدرس صفحه را کپی کن.')}}));
const visitForm=$('#visit-form');
if(visitForm){
 const date=$('#visit-date'),time=$('#visit-time');const now=new Date();const localDate=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;date.min=localDate;date.value=localDate;
 visitForm.addEventListener('submit',event=>{event.preventDefault();if(!visitForm.reportValidity())return;const day=new Date(date.value+'T12:00:00');const readable=new Intl.DateTimeFormat('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(day);const readableTime=time.value.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);const summary=`قرار بعدی: ${readable}، ساعت ${readableTime}\nتعداد: ${$('#visit-guests').value}\nحال‌وهوا: ${$('#visit-mood').value}\n\nاین یک برنامهٔ شخصی است و تأییدیهٔ رزرو میز نیست.`;$('#summary-text').textContent=summary;visitForm.hidden=true;$('#visit-summary').hidden=false;$('#copy-plan').focus()});
 $('#copy-plan').addEventListener('click',()=>copyText($('#summary-text').textContent));$('#edit-plan').addEventListener('click',()=>{visitForm.hidden=false;$('#visit-summary').hidden=true;date.focus()});
}
