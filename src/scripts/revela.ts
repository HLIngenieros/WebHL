// Entradas Izaje, Cota y Trazo (guía §9; Aparece es solo CSS): se disparan una vez al entrar en pantalla.
// Sin este script el contenido se ve igual (el estado oculto solo existe bajo html.js),
// y si no llega a iniciarse, el script en línea del <head> lo rescata a los 2 s.
const SELECTOR = '.izaje, .cota, .trazo, .estacas';

const iniciadas = new WeakSet<Element>();

function iniciar() {
  // Una sola vez por página: el router reemplaza el <body> en cada navegación.
  if (iniciadas.has(document.body)) return;
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
  iniciadas.add(document.body);
  (window as any).__revela = true;
}

// Al cargar (aunque el router falle) y tras cada cambio de página.
iniciar();
document.addEventListener('astro:page-load', iniciar);
