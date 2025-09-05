// js/app.js
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw18QTSPXMYS4YojiodUvOryr4PVAxSkqErbTkAmXH7L9ih-ArkLtL5X9pJyuYATHaXFA/exec";

const form = document.getElementById('privacyForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(msg, ok = false){
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = ok ? 'ok' : 'err';
}

function getInformativaVersion(){
  return (window.INFORMATIVA_VERSION)
      || (document.querySelector('meta[name="informativa-version"]')?.content)
      || 'v-unknown';
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  setStatus('Invio in corso…', true);
  if (submitBtn) submitBtn.disabled = true;

  // Costruisci payload dai campi del form
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // Normalizza checkbox (true/false)
  data.consenso_trattamento  = !!fd.get('consenso_trattamento');
  data.consenso_marketing    = !!fd.get('consenso_marketing');
  data.consenso_profilazione = !!fd.get('consenso_profilazione'); // opzionale
  data.consenso_terzi        = !!fd.get('consenso_terzi');        // opzionale

  // Metadati per audit
  data.informativa_version = getInformativaVersion();
  data.userAgent = navigator.userAgent || '';

  // Validazione minima lato client
  if (!data.ragione_sociale){
    setStatus('Compila la ragione sociale / nome e cognome.', false);
    if (submitBtn) submitBtn.disabled = false;
    return;
  }
  if (!data.consenso_trattamento){
    setStatus('Devi accettare il trattamento per finalità contrattuali (obbligatorio).', false);
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  try{
    // Timeout rete (20 secondi)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timer);

    let json;
    try { json = await res.json(); }
    catch { throw new Error('Risposta non valida dal server'); }

    if (res.ok && json && json.ok){
      setStatus('Modulo inviato con successo.', true);
      form.reset();
    } else {
      const msg = (json && json.error) ? json.error : `Errore HTTP ${res.status}`;
      throw new Error(msg);
    }
  }catch(err){
    setStatus('Errore: ' + (err.message || String(err)), false);
    console.error(err);
  }finally{
    if (submitBtn) submitBtn.disabled = false;
  }
});
