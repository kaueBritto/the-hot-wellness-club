// The Hot Wellness Club — comportamento do site (demonstração: a reserva não grava nada)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');

  // grade real da semana (0 = domingo). As vagas são de demonstração.
  const GRADE = {
    1: [['16:00', 2], ['18:00', 0], ['19:30', 1]],
    2: [['16:00', 4], ['18:00', 1], ['19:30', 0]],
    3: [['16:00', 3], ['18:00', 0], ['19:30', 0]],
    4: [['18:20', 2], ['19:30', 0]],
    5: [['07:20', 5]],
    6: [['07:00', 1], ['08:30', 0], ['09:30', 3]],
  };
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const textoVagas = (n) => (n === 0 ? 'Lista de espera' : n === 1 ? 'Última vaga' : n + ' vagas');

  // cabeçalho: transparente sobre a foto, papel depois
  const topo = $('.topo');
  const barra = $('.barra');
  const marco = $('.hero, .capa');
  const aoRolar = () => {
    const limite = marco ? marco.offsetHeight - 90 : 40;
    topo.classList.toggle('papel', scrollY > Math.max(40, limite));
    if (barra) barra.classList.toggle('visivel', scrollY > (marco ? marco.offsetHeight * 0.7 : 300) && !document.body.classList.contains('preso'));
  };
  addEventListener('scroll', aoRolar, { passive: true });
  addEventListener('resize', aoRolar);
  aoRolar();

  // menu do celular
  const gaveta = $('.gaveta');
  const prende = (sim) => { document.body.classList.toggle('preso', sim); document.documentElement.style.overflow = sim ? 'hidden' : ''; aoRolar(); };
  const menu = (abre) => { gaveta.classList.toggle('aberta', abre); gaveta.setAttribute('aria-hidden', String(!abre)); prende(abre); if (abre) $('.fecha', gaveta).focus(); };
  $('.abre')?.addEventListener('click', () => menu(true));
  $('.fecha', gaveta)?.addEventListener('click', () => menu(false));
  $$('a', gaveta).forEach((a) => a.addEventListener('click', () => menu(false)));

  // entrada das seções
  const vistos = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); vistos.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv').forEach((el) => vistos.observe(el));

  // próxima turma com vaga
  const proxima = () => {
    const agora = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
      for (const [hora, vagas] of GRADE[d.getDay()] || []) {
        const [h, m] = hora.split(':').map(Number);
        const quando = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
        if (vagas > 0 && quando - agora > 45 * 60000) return { d, hora, vagas, i };
      }
    }
    return null;
  };
  const p = proxima();
  const alvoAgora = $('[data-proxima]');
  if (p && alvoAgora) alvoAgora.innerHTML = `<b>${p.i === 0 ? 'Hoje' : p.i === 1 ? 'Amanhã' : DIAS[p.d.getDay()]}, ${p.hora}</b> · ${textoVagas(p.vagas).toLowerCase()}`;

  // horários no celular: um dia por vez
  const abas = $$('.semana[data-grade] button');
  const lista = $('.aulas.do-dia');
  const mostraDia = (dia) => {
    abas.forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.dia) === dia)));
    lista.innerHTML = (GRADE[dia] || []).map(([hora, v]) => `<li class="aula${v === 0 ? ' cheia' : ''}"><time>${hora}</time><p>Hot Pilates<small>50 min · com Adelly</small></p>${v === 0 ? '<span class="vagas">Lista de espera</span>' : `<button class="btn menor" data-reservar data-dia="${dia}" data-hora="${hora}">${v === 1 ? 'Última vaga' : 'Reservar'}</button>`}</li>`).join('');
  };
  if (abas.length && lista) {
    const hoje = new Date().getDay();
    mostraDia(GRADE[hoje] ? hoje : 1);
    abas.forEach((b) => b.addEventListener('click', () => mostraDia(Number(b.dataset.dia))));
  }

  // em uma palavra
  const palavras = $$('.palavras-lista button');
  const depo = $('.depo');
  if (palavras.length && depo) {
    const troca = (b) => {
      palavras.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      $('.palavra', depo).textContent = b.dataset.palavra;
      $('blockquote', depo).textContent = b.dataset.fala;
      $('cite', depo).textContent = b.dataset.quem;
      depo.classList.remove('troca'); void depo.offsetWidth; depo.classList.add('troca');
    };
    palavras.forEach((b) => { b.addEventListener('click', () => troca(b)); b.addEventListener('mouseenter', () => { if (matchMedia('(min-width: 64rem)').matches) troca(b); }); });
  }

  // reserva em três passos (demonstração)
  const veu = $('.veu'), folha = $('.folha');
  if (folha) {
    const passos = $$('[data-passo]', folha), marcas = $$('.etapas li', folha);
    const dias = $('.semana', folha), opcoes = $('.opcoes', folha);
    let escolha = { data: null, hora: null };
    const proximosDias = () => { const out = []; const a = new Date(); for (let i = 0; out.length < 6 && i < 10; i++) { const d = new Date(a.getFullYear(), a.getMonth(), a.getDate() + i); if (GRADE[d.getDay()]) out.push(d); } return out; };
    const horarios = (d, marcada) => {
      escolha.data = d;
      $$('button', dias).forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.t) === d.getTime())));
      opcoes.innerHTML = GRADE[d.getDay()].map(([hora, v], i) => `<label><input type="radio" name="hora" value="${hora}" ${v === 0 ? 'disabled' : ''} ${(marcada ? hora === marcada : v > 0 && !opcoes.dataset.ok) ? 'checked' : ''}><b>${hora}</b><span>Hot Pilates</span><small>${textoVagas(v)}</small></label>`).join('');
      const c = $('input:checked', opcoes) || $('input:not(:disabled)', opcoes); if (c) { c.checked = true; escolha.hora = c.value; }
    };
    const vai = (n) => { passos.forEach((x) => { x.hidden = Number(x.dataset.passo) !== n; }); marcas.forEach((m, i) => m.classList.toggle('on', i < n)); $('.etapas', folha).hidden = n === 3; $('header > div', folha).hidden = n === 3; folha.scrollTop = 0; };
    const abre = (dia, hora) => {
      const ds = proximosDias();
      dias.innerHTML = ds.map((d) => `<button type="button" role="tab" data-t="${d.getTime()}"><small>${CURTO[d.getDay()]}</small><b>${d.getDate()}</b></button>`).join('');
      const alvo = ds.find((d) => dia != null && d.getDay() === Number(dia)) || ds.find((d) => GRADE[d.getDay()].some((x) => x[1] > 0)) || ds[0];
      horarios(alvo, hora);
      vai(1); veu.classList.add('aberta'); folha.classList.add('aberta'); folha.setAttribute('aria-hidden', 'false'); prende(true);
    };
    const fecha = () => { veu.classList.remove('aberta'); folha.classList.remove('aberta'); folha.setAttribute('aria-hidden', 'true'); prende(false); };
    document.addEventListener('click', (e) => {
      const r = e.target.closest('[data-reservar]');
      if (r) { e.preventDefault(); if (gaveta.classList.contains('aberta')) menu(false); return abre(r.dataset.dia, r.dataset.hora); }
      if (e.target.closest('[data-fecha]') || e.target === veu) return fecha();
      const d = e.target.closest('.folha .semana button'); if (d) return horarios(new Date(Number(d.dataset.t)));
    });
    opcoes.addEventListener('change', (e) => { escolha.hora = e.target.value; });
    $('[data-ir="2"]', folha).addEventListener('click', () => { if (!escolha.hora) return; $('[data-quando]', folha).textContent = `${DIAS[escolha.data.getDay()]}, ${escolha.data.getDate()} de ${MESES[escolha.data.getMonth()]} · ${escolha.hora}`; vai(2); $('#r-nome').focus(); });
    $('[data-volta]', folha).addEventListener('click', () => vai(1));
    const fone = $('#r-fone');
    fone.addEventListener('input', () => { const n = fone.value.replace(/\D/g, '').slice(0, 11); fone.value = n.length > 6 ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}` : n.length > 2 ? `(${n.slice(0, 2)}) ${n.slice(2)}` : n; });
    $('form', folha).addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#r-nome'), en = $('#e-nome'), ef = $('#e-fone');
      const okN = nome.value.trim().split(/\s+/).length >= 2, okF = fone.value.replace(/\D/g, '').length >= 10;
      en.hidden = okN; ef.hidden = okF; nome.setAttribute('aria-invalid', String(!okN)); fone.setAttribute('aria-invalid', String(!okF));
      if (!okN) return nome.focus(); if (!okF) return fone.focus();
      $('[data-final]', folha).textContent = $('[data-quando]', folha).textContent;
      vai(3);
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecha(); if (gaveta.classList.contains('aberta')) menu(false); } });
  }
})();
