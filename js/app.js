const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5ueIjPlyvdskd9j0u_NZfBQj1yiruieQsL_ExTIRc3txFjlM4HWSv59vjoDKUU65JzA/exec";
const form = document.getElementById('privacyForm');
const statusEl = document.getElementById('formStatus');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.consenso_trattamento = !!fd.get('consenso_trattamento');
  data.consenso_marketing = !!fd.get('consenso_marketing');
  try{
    const res = await fetch(WEB_APP_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    const json = await res.json();
    statusEl.textContent = json.ok ? 'Modulo inviato con successo' : 'Errore: '+json.error;
  }catch(err){
    statusEl.textContent = 'Errore di rete: '+err;
  }
});
