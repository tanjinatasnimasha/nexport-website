(function(){
  'use strict';
  const M=window.NexportModel;
  const $=id=>document.getElementById(id);
  let language='en';
  try {if(localStorage.getItem('nexport-language')==='bn')language='bn';} catch {}
  let filter='all',activeService='solar',reviewData=null,toastTimer;
  const selected=new Set();
  const icons={code:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',camera:'<path d="M5 6h10l5 4-4 6H6L3 12l2-6Z"/><path d="m5 16-2 4h6m3-4v4h5m-4-11h4"/>',spark:'<path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8L12 3Z"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/>',box:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9 9-4m-9 4L3 8m9 4v10m-4.5-16.5 9 5"/>'};
  function icon(name){return `<span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg></span>`;}
  function t(key){return M.i18n[language][key];}
  function renderExplorer(){
    const visible=M.visibleServices(filter);
    if(!visible.some(s=>s.id===activeService))activeService=visible[0].id;
    $('service-grid').innerHTML=visible.map(s=>`<button type="button" class="service-card${activeService===s.id?' active':''}" data-service="${s.id}" aria-pressed="${activeService===s.id}" aria-controls="service-detail">${icon(s.icon)}<strong>${s.name[language]}</strong><span>${s.short[language]}</span></button>`).join('');
    const s=M.services.find(x=>x.id===activeService);
    $('service-detail').innerHTML=`<div class="detail-top">${icon(s.icon)}<span class="detail-count">${s.number} / 06</span></div><h3>${s.title[language]}</h3><p class="detail-description">${s.description[language]}</p><p class="detail-examples-label">${t('examplesLabel')}</p><ul class="detail-examples">${s.examples[language].map(e=>`<li>${e}</li>`).join('')}</ul><button type="button" class="button detail-button" data-add="${s.id}">${t('addButton')} <span aria-hidden="true">↗</span></button>`;
  }
  function renderCheckboxes(){
    $('inquiry-services').innerHTML=M.services.map(s=>`<label class="service-check"><input type="checkbox" name="services" value="${s.id}"${selected.has(s.id)?' checked':''}><span>${s.name[language]}</span></label>`).join('');
  }
  function updatePreview(){
    const choices=M.selectedServices([...selected]);
    $('preview-tags').innerHTML=choices.length?choices.map(s=>`<span>${s.name[language]}</span>`).join(''):`<span class="empty-selection">${t('emptySelection')}</span>`;
    $('preview-for').textContent=t(M.useKeys[$('use-case').value]);
    $('preview-when').textContent=t(M.timeKeys[$('timeline').value]);
    $('service-hint').textContent=choices.map(s=>s.hint[language]).join(' ');
  }
  function translate(){
    document.documentElement.lang=language;
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n);});
    document.querySelectorAll('[data-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.placeholder);});
    $('language-button').innerHTML=language==='en'?'বাংলা <span aria-hidden="true">↔</span>':'English <span aria-hidden="true">↔</span>';
    $('language-button').setAttribute('aria-label',language==='en'?'Switch to Bangla':'ইংরেজিতে দেখুন');
    $('navigation').setAttribute('aria-label',t('navAria'));
    document.querySelector('.filter-row').setAttribute('aria-label',t('filterAria'));
    $('service-grid').setAttribute('aria-label',t('serviceAria'));
    $('hero-image').alt=t('heroAlt');
    document.querySelector('[data-open-service]').setAttribute('aria-label',t('solarAria'));
    $('dialog-close').setAttribute('aria-label',t('closeReview'));
    $('menu-toggle').setAttribute('aria-label',t($('menu-toggle').getAttribute('aria-expanded')==='true'?'menuClose':'menuOpen'));
    document.title=language==='en'?'Nexport Tech Corporation | Technology for everyday life':'নেক্সপোর্ট টেক কর্পোরেশন | দৈনন্দিন জীবনের প্রযুক্তি';
    const currentError=$('form-error').dataset.errorKey;if(currentError)$('form-error').textContent=t(currentError);
    renderExplorer();renderCheckboxes();updatePreview();
    if(reviewData)updateReview();
  }
  function clearError(){
    $('form-error').hidden=true;delete $('form-error').dataset.errorKey;
    document.querySelectorAll('[aria-invalid]').forEach(el=>{el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');});
  }
  function menu(open){$('navigation').classList.toggle('open',open);$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').setAttribute('aria-label',t(open?'menuClose':'menuOpen'));}
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},3200);}
  function collectData(){return {services:[...selected],useCase:$('use-case').value,timeline:$('timeline').value,name:$('name').value,reply:$('reply').value,location:$('location').value,details:$('details').value};}
  function updateReview(){const result=M.formatInquiry(reviewData,language);$('review-text').textContent=result.body;$('email-inquiry').href=result.url;$('copy-status').textContent='';}
  $('language-button').addEventListener('click',()=>{language=language==='en'?'bn':'en';try{localStorage.setItem('nexport-language',language);}catch{}translate();});
  $('menu-toggle').addEventListener('click',()=>menu($('menu-toggle').getAttribute('aria-expanded')!=='true'));
  $('navigation').addEventListener('click',event=>{if(event.target.closest('a'))menu(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')menu(false);});
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderExplorer();}));
  $('service-grid').addEventListener('click',event=>{const button=event.target.closest('[data-service]');if(!button)return;activeService=button.dataset.service;renderExplorer();document.querySelector(`[data-service="${activeService}"]`).focus({preventScroll:true});});
  document.querySelector('[data-open-service]').addEventListener('click',()=>{filter='all';activeService='solar';document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'));});renderExplorer();});
  $('service-detail').addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;selected.add(button.dataset.add);renderCheckboxes();updatePreview();clearError();document.getElementById('inquiry').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$('inquiry-services').querySelector(`input[value="${button.dataset.add}"]`).focus({preventScroll:true});toast(t('added'));});
  $('inquiry-services').addEventListener('change',event=>{const input=event.target;if(input.name!=='services')return;input.checked?selected.add(input.value):selected.delete(input.value);updatePreview();clearError();});
  $('inquiry-form').addEventListener('input',clearError);
  $('use-case').addEventListener('change',updatePreview);$('timeline').addEventListener('change',updatePreview);
  $('inquiry-form').addEventListener('submit',event=>{
    event.preventDefault();clearError();const data=collectData();const error=M.validate(data);
    if(error){$('form-error').hidden=false;$('form-error').textContent=t(error.key);$('form-error').dataset.errorKey=error.key;const target=error.field==='services'?$('inquiry-services').querySelector('input'):$(error.field);target.setAttribute('aria-invalid','true');target.setAttribute('aria-describedby','form-error');target.focus();return;}
    reviewData=data;updateReview();$('review-dialog').showModal();
  });
  function closeReview(){$('review-dialog').close();}
  $('dialog-close').addEventListener('click',closeReview);$('edit-inquiry').addEventListener('click',closeReview);
  $('review-dialog').addEventListener('click',event=>{const rect=$('review-dialog').getBoundingClientRect();if(event.target===$('review-dialog')&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))closeReview();});
  $('copy-inquiry').addEventListener('click',async()=>{
    const value=$('review-text').textContent;
    try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(value);$('copy-status').textContent=t('copied');}
    catch{const range=document.createRange();range.selectNodeContents($('review-text'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent=t('copyFallback');}
  });
  translate();
})();
