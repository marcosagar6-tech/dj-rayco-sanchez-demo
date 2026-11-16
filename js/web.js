// DJ Rayco Sánchez · comportamiento de la web (sin librerías)
(function () {
  var TEL = '34657531818';
  var d = document;

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

  // La cabecera se vuelve sólida al bajar de la foto de portada
  var cab = d.querySelector('.cabecera');
  var pendiente = false;
  var medir = function () {
    pendiente = false;
    if (cab) cab.classList.toggle('solida', window.scrollY > 40);
  };
  window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } }, { passive: true });
  medir();

  // Aparición suave al bajar (solo un grupo por página, solo ordenador; el CSS decide)
  var aparecen = d.querySelectorAll('.aparece');
  if (aparecen.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    aparecen.forEach(function (el) { io.observe(el); });
  } else { aparecen.forEach(function (el) { el.classList.add('visto'); }); }

  // Móvil: la acción fija de abajo se esconde mientras se ve otro botón de presupuesto (una sola acción por pantalla)
  var accion = d.querySelector('.accion-fija');
  var ctas = d.querySelectorAll('[data-cta]');
  if (accion && ctas.length && 'IntersectionObserver' in window) {
    var vistos = new Set();
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
      accion.classList.toggle('escondida', vistos.size > 0);
    }, { threshold: 0.6 });
    ctas.forEach(function (el) { io2.observe(el); });
  }

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
  if (tipo) { var r = form.querySelector('input[name="tipo"][value="' + tipo + '"]'); if (r) r.checked = true; }

  var valor = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var fechaBonita = function (v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0];
  };
  var nombresTipo = { boda: 'Boda', empresa: 'Evento de empresa', fiesta: 'Fiesta privada', otro: 'Otra celebración' };

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
