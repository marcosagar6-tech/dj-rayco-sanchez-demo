// DJ Rayco Sánchez · comportamiento de la web, versión 5 (elegante y simple) (sin librerías)
// Si algo falla o la persona pide reducir el movimiento, la web se ve entera y quieta.
(function () {
  var TEL = '34657531818';
  var d = document;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hayIO = 'IntersectionObserver' in window;

  // Menú del móvil
  var menu = d.getElementById('menu-movil');
  var abrir = d.querySelector('.abrir-menu');
  if (menu && abrir) {
    var cerrar = menu.querySelector('.cerrar');
    var abrirMenu = function () {
      menu.classList.add('abierta'); menu.removeAttribute('inert'); menu.setAttribute('aria-hidden', 'false');
      abrir.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden';
      setTimeout(function () { cerrar.focus(); }, 30);
    };
    var cerrarMenu = function () {
      menu.classList.remove('abierta'); menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true');
      abrir.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; abrir.focus();
    };
    abrir.addEventListener('click', abrirMenu);
    cerrar.addEventListener('click', cerrarMenu);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('abierta')) cerrarMenu(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { d.body.style.overflow = ''; } });
  }

  // Una sola acción principal por pantalla: si se ve un botón de presupuesto del contenido,
  // se esconden la barra del móvil y el botón de la cabecera del ordenador.
  var cab = d.querySelector('.cabecera');
  var accion = d.querySelector('.accion-fija');
  var ctas = d.querySelectorAll('[data-cta]');
  if (ctas.length && hayIO) {
    var vistos = new Set();
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
      var hay = vistos.size > 0;
      if (accion) accion.classList.toggle('escondida', hay);
      if (cab) cab.classList.toggle('cta-a-la-vista', hay);
    }, { threshold: 0.6 });
    ctas.forEach(function (el) { io2.observe(el); });
  }

  // Revelados al bajar
  var revelan = d.querySelectorAll('.revela, .revela-foto');
  if (revelan.length && hayIO && !quieto) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revelan.forEach(function (el) { io.observe(el); });
  } else { revelan.forEach(function (el) { el.classList.add('visto'); }); }

  // La cabecera se vuelve sólida al bajar
  var pendiente = false;
  var medir = function () { pendiente = false; if (cab) cab.classList.toggle('solida', window.scrollY > 40); };
  window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } }, { passive: true });
  medir();

  // Diseña tu noche: deslizadores de energía, curva plata y mensaje para WhatsApp
  var plan = d.getElementById('plan');
  if (plan) (function () {
    var datos = JSON.parse(plan.getAttribute('data-plan'));
    var formP = d.getElementById('form-plan');
    var cont = d.getElementById('deslizadores');
    var fig = plan.querySelector('.curva-plan');
    var linea = fig.querySelector('.linea'), area = fig.querySelector('.area'), grupo = fig.querySelector('.puntos'), nombres = fig.querySelector('.curva-nombres');
    var burbujaP = d.getElementById('burbuja-plan');
    var W = 600, H = 220, M = 28;
    var NS = 'http://www.w3.org/2000/svg';
    var qs = new URLSearchParams(location.search).get('tipo');
    if (qs && datos.tipos[qs]) { var rq = formP.querySelector('input[name="tipo"][value="' + qs + '"]'); if (rq) rq.checked = true; }
    var tipo = function () { var t = formP.querySelector('input[name="tipo"]:checked'); return t ? t.value : 'boda'; };
    var f1 = function (n) { return n.toFixed(1); };
    var dibuja = function () {
      var ins = cont.querySelectorAll('input'), n = ins.length, pts = [];
      for (var i = 0; i < n; i++) pts.push([M + (W - 2 * M) * i / (n - 1), H - M - (H - 2 * M) * (+ins[i].value - 1) / 4]);
      var dd = 'M' + f1(pts[0][0]) + ',' + f1(pts[0][1]);
      for (var k = 0; k < n - 1; k++) {
        var p0 = pts[Math.max(k - 1, 0)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(k + 2, n - 1)];
        dd += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ',' + f1(p2[1]);
      }
      var da = dd + ' L' + f1(pts[n - 1][0]) + ',' + (H - M) + ' L' + f1(pts[0][0]) + ',' + (H - M) + ' Z';
      linea.setAttribute('d', dd); area.setAttribute('d', da);
      linea.style.d = 'path("' + dd + '")'; area.style.d = 'path("' + da + '")';
      var cs = grupo.querySelectorAll('circle');
      if (cs.length !== n) { grupo.innerHTML = ''; for (var c = 0; c < n; c++) { var el = d.createElementNS(NS, 'circle'); el.setAttribute('r', '6'); grupo.appendChild(el); } cs = grupo.querySelectorAll('circle'); }
      for (var j = 0; j < n; j++) { cs[j].setAttribute('cx', f1(pts[j][0])); cs[j].setAttribute('cy', f1(pts[j][1])); cs[j].style.cx = f1(pts[j][0]) + 'px'; cs[j].style.cy = f1(pts[j][1]) + 'px'; }
      pintaP();
    };
    var monta = function () {
      var t = datos.tipos[tipo()];
      cont.innerHTML = ''; nombres.innerHTML = '';
      t.momentos.forEach(function (m, i) {
        var fila = d.createElement('div'); fila.className = 'deslizador';
        var id = 'energia-' + i;
        fila.innerHTML = '<label for="' + id + '"></label><output for="' + id + '"></output><input type="range" id="' + id + '" min="1" max="5" step="1">';
        fila.querySelector('label').textContent = m[0];
        var inp = fila.querySelector('input'), out = fila.querySelector('output');
        var pon = function () { var p = datos.energia[inp.value - 1]; out.textContent = p; inp.setAttribute('aria-valuetext', p); inp.style.setProperty('--lleno', ((inp.value - 1) / 4 * 100) + '%'); };
        inp.value = m[1]; pon();
        inp.addEventListener('input', function () { pon(); dibuja(); });
        cont.appendChild(fila);
        var s = d.createElement('span'); s.textContent = m[0]; s.style.left = ((M + (W - 2 * M) * i / (t.momentos.length - 1)) / W * 100).toFixed(2) + '%'; nombres.appendChild(s);
      });
      dibuja();
    };
    var mensajeP = function () {
      var t = datos.tipos[tipo()], ins = cont.querySelectorAll('input');
      var v = function (n) { var el = formP.elements[n]; return el ? String(el.value || '').trim() : ''; };
      var g = [].map.call(formP.querySelectorAll('input[name="gustos"]:checked'), function (x) { return x.value; });
      var l = ['Hola, Rayco. Así me gustaría que sonara mi celebración:', '', '· Tipo de evento: ' + t.nombre];
      if (v('nombre')) l.push('· Nombre: ' + v('nombre'));
      if (v('fecha')) l.push('· Fecha: ' + v('fecha').split('-').reverse().join('/'));
      l.push('', 'Energía de cada momento:');
      t.momentos.forEach(function (m, i) { if (ins[i]) l.push('– ' + m[0] + ': ' + datos.energia[ins[i].value - 1]); });
      if (g.length) l.push('', 'Lo que nos gusta: ' + g.join(', '));
      if (v('imprescindibles')) l.push('', 'No pueden faltar: ' + v('imprescindibles'));
      if (v('nunca')) l.push('', 'Mejor que no suene: ' + v('nunca'));
      l.push('', '¿Me preparas presupuesto?');
      return l.join('\n');
    };
    var pintaP = function () { burbujaP.textContent = mensajeP(); };
    formP.addEventListener('change', function (e) { if (e.target.name === 'tipo') monta(); else pintaP(); });
    formP.addEventListener('input', function (e) { if (e.target.type !== 'range') pintaP(); });
    d.getElementById('enviar-plan').addEventListener('click', function () {
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(mensajeP()), '_blank', 'noopener');
    });
    monta();
  })();

  // Formulario de contacto: prepara el mensaje de WhatsApp
  var form = d.getElementById('form-contacto');
  if (!form) return;
  var burbuja = d.getElementById('burbuja');
  var error = d.getElementById('error-form');
  var hecho = d.getElementById('hecho');
  var otraVez = d.getElementById('abrir-otra-vez');
  var copiar = d.getElementById('copiar-mensaje');

  // Si vienes desde Bodas, Empresas o Fiestas, el tipo ya viene marcado
  var tipo = new URLSearchParams(location.search).get('tipo');
  if (tipo) { var rt = form.querySelector('input[name="tipo"][value="' + tipo + '"]'); if (rt) rt.checked = true; }

  var valor = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var fechaBonita = function (v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0];
  };
  var nombresTipo = { boda: 'Boda', empresa: 'Evento de empresa', fiesta: 'Cumpleaños o fiesta privada', finano: 'Fin de año', otro: 'Otra celebración' };

  var mensaje = function () {
    var t = form.querySelector('input[name="tipo"]:checked');
    var l = ['Hola, Rayco. Quiero pedir presupuesto.'];
    l.push('');
    l.push('· Nombre: ' + (valor('nombre') || '—'));
    l.push('· Tipo de evento: ' + (t ? nombresTipo[t.value] : '—'));
    l.push('· Fecha: ' + (fechaBonita(valor('fecha')) || '—'));
    l.push('· Lugar o municipio: ' + (valor('lugar') || '—'));
    l.push('· Invitados aproximados: ' + (valor('invitados') || '—'));
    if (valor('mensaje')) { l.push(''); l.push(valor('mensaje')); }
    return l.join('\n');
  };
  var pinta = function () { burbuja.textContent = mensaje(); };
  form.addEventListener('input', pinta);
  form.addEventListener('change', pinta);
  pinta();

  var enlace = function () { return 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(mensaje()); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    error.textContent = '';
    var falta = [];
    if (!valor('nombre')) falta.push('tu nombre');
    if (!form.querySelector('input[name="tipo"]:checked')) falta.push('el tipo de evento');
    if (!valor('fecha')) falta.push('la fecha');
    if (!form.elements.acepto.checked) falta.push('aceptar la privacidad');
    if (falta.length) {
      error.textContent = 'Falta: ' + (falta.length > 1 ? falta.slice(0, -1).join(', ') + ' y ' + falta[falta.length - 1] : falta[0]) + '.';
      var primero = !valor('nombre') ? form.elements.nombre : !form.querySelector('input[name="tipo"]:checked') ? form.querySelector('input[name="tipo"]') : !valor('fecha') ? form.elements.fecha : form.elements.acepto;
      primero.focus();
      return;
    }
    window.open(enlace(), '_blank', 'noopener');
    hecho.classList.add('visible');
    hecho.focus();
  });
  if (otraVez) otraVez.addEventListener('click', function () { window.open(enlace(), '_blank', 'noopener'); });
  if (copiar) copiar.addEventListener('click', function () {
    var ok = function () { copiar.textContent = 'Copiado'; setTimeout(function () { copiar.textContent = 'Copiar mensaje'; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(mensaje()).then(ok, function () {});
  });
})();
