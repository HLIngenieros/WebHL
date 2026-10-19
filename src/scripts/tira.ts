// Tira de negativos (guía §12.3): convierte la lista de hitos en un escenario fijo que avanza con el
// scroll. Un oyente pasivo guarda la posición y un único requestAnimationFrame escribe transform, opacity
// y filter; las medidas se toman al iniciar y en resize, nunca por cuadro. Con movimiento reducido no
// arranca: queda la lista.
import { avance, tratamiento } from '../lib/nosotros';

type H = { anio: number; decada: string; titulo: string; texto: string; pie: string; gde: string };
const REVELA = 1000; // ms de negativo a positivo
const w = window as any;
let liberar: (() => void) | null = null;

const filtro = (anio: number, hoy: Date, extra = '') => {
  const x = tratamiento(anio, hoy);
  return `grayscale(${x.gris}) sepia(${x.sepia}) contrast(${x.contraste}) ${extra}`;
};

function iniciar() {
  liberar?.();
  const sec = document.querySelector<HTMLElement>('[data-tira]');
  const escena = sec?.querySelector<HTMLElement>('.tira-escena');
  if (!sec || !escena || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hitos: H[] = JSON.parse(escena.dataset.hitos ?? '[]');
  if (!hitos.length) return;
  sec.classList.add('activa');

  const hoy = new Date();
  const anios = hitos.map((h) => h.anio);
  const [A0, A1] = [anios[0], anios[anios.length - 1]];
  const $ = <T extends Element>(s: string) => escena.querySelector<T>(s)!;
  const digitos = [...escena.querySelectorAll<HTMLElement>('.digito i')];
  const anioTexto = $<HTMLElement>('.escena-anio-texto');
  const caja = $<HTMLElement>('.escena-hito');
  const pelicula = $<HTMLElement>('.pelicula');
  const cuadros = [...escena.querySelectorAll<HTMLElement>('.cuadro')];
  const ampliado = $<HTMLElement>('.ampliado');
  const amplImg = ampliado.querySelector('img');
  const cota = $<HTMLElement>('.regla-cota');
  const cursor = $<HTMLElement>('.regla-cursor');
  const cursorAnio = $<HTMLElement>('.cursor-anio');
  const burbujas = [...escena.querySelectorAll<HTMLElement>('.regla-burbuja')];
  const regla = $<HTMLElement>('.escena-regla');

  let inicio = 0, recorrido = 1, anchoCuadro = 320, anchoPeli = 0, anchoRegla = 1;
  const medir = () => {
    inicio = sec.getBoundingClientRect().top + scrollY;
    recorrido = Math.max(1, sec.offsetHeight - innerHeight);
    const c = cuadros[0];
    anchoCuadro = c ? c.offsetWidth + 20 : 320;
    anchoPeli = escena.querySelector<HTMLElement>('.escena-pelicula')!.offsetWidth;
    anchoRegla = regla.offsetWidth || 1;
  };

  let y = scrollY, actual = -1, cambio = 0, marco = 0, visible = false, anioPrevio = -1;
  const cuadro = (ahora: number) => {
    marco = 0;
    const a = avance((y - inicio) / recorrido, anios);
    if (a.anio !== anioPrevio) {
      anioPrevio = a.anio;
      String(a.anio).padStart(4, '0').split('').forEach((d, k) => { if (digitos[k]) digitos[k].style.transform = `translateY(${-Number(d) * 10}%)`; });
      anioTexto.textContent = String(a.anio);
      cursorAnio.textContent = String(a.anio);
      const p = (a.anio - A0) / (A1 - A0);
      cota.style.transform = `scaleX(${p})`;
      cursor.style.transform = `translateX(${p * anchoRegla}px)`;
    }
    if (a.indice !== actual) {
      actual = a.indice;
      cambio = ahora;
      const h = hitos[actual];
      caja.classList.add('cambia');
      setTimeout(() => {
        $('.escena-n').textContent = `${String(actual + 1).padStart(2, '0')}/${String(hitos.length).padStart(2, '0')}`;
        $('.escena-decada').textContent = h.decada;
        $('.escena-titulo').textContent = h.titulo;
        $('.escena-texto').textContent = h.texto;
        $('.ampliado-pie').textContent = h.pie || 'Archivo HL';
        $('.ampliado-decada').textContent = h.decada;
        caja.classList.remove('cambia');
      }, 200);
      if (amplImg && h.gde) amplImg.src = h.gde;
      burbujas.forEach((b, k) => { b.classList.toggle('actual', k === actual); b.classList.toggle('paso', k < actual); });
      cuadros.forEach((c, k) => {
        const img = c.querySelector('img');
        if (img) img.style.filter = k <= actual ? filtro(hitos[k].anio, hoy, 'brightness(.55)') : 'invert(1) grayscale(1) brightness(.6)';
      });
    }
    // La película centra el hito en curso y avanza con el recorrido hacia el siguiente.
    pelicula.style.transform = `translateX(${anchoPeli / 2 - anchoCuadro / 2 - (a.indice + a.local) * anchoCuadro}px)`;
    // Revelado del cuadro ampliado: de negativo a positivo.
    const e = 1 - (1 - Math.min(1, (ahora - cambio) / REVELA)) ** 3;
    if (amplImg) amplImg.style.filter = `invert(${(1 - e).toFixed(2)}) ${filtro(hitos[actual].anio, hoy)} brightness(${(0.6 + 0.4 * e).toFixed(2)})`;
    ampliado.style.opacity = String(0.35 + 0.65 * e);
    ampliado.style.transform = `scale(${0.92 + 0.08 * e})`;
    if (visible && e < 1) marco = requestAnimationFrame(cuadro);
  };
  const pedir = () => { if (!marco && visible) marco = requestAnimationFrame(cuadro); };
  const alScroll = () => { y = scrollY; pedir(); };
  const alCambiar = () => { medir(); anioPrevio = -1; pedir(); };
  const vigia = new IntersectionObserver(([en]) => { visible = en.isIntersecting; pedir(); });

  medir();
  addEventListener('scroll', alScroll, { passive: true });
  addEventListener('resize', alCambiar);
  vigia.observe(sec);
  w.__tira = (w.__tira ?? 0) + 1;

  liberar = () => {
    cancelAnimationFrame(marco); marco = 0;
    removeEventListener('scroll', alScroll);
    removeEventListener('resize', alCambiar);
    vigia.disconnect();
    w.__tira = Math.max(0, (w.__tira ?? 1) - 1);
    liberar = null;
  };
}

iniciar();
document.addEventListener('astro:page-load', iniciar);
document.addEventListener('astro:before-swap', () => liberar?.());
