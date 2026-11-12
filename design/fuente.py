"""R1 · Fuentes (Plan R, decisión R-1).

Reduce Poppins (500/600/700), Open Sans variable (wght 400-600) e IBM Plex Mono 500 a los caracteres que
usa el sitio y calcula los respaldos con métricas ajustadas, para que el cambio de fuente
(font-display: swap) no mueva el texto.

Uso:  python design/fuente.py <carpeta>
      (carpeta con los woff2 latinos de @fontsource/poppins 5.2.6, @fontsource-variable/open-sans 5.2.6 y
      @fontsource/ibm-plex-mono 5.2.6, en cualquier subcarpeta)
Escribe public/fonts/*.woff2 e imprime los @font-face de respaldo para global.css.
Requiere: pip install fonttools brotli. Las métricas de Arial y Consolas se leen de C:/Windows/Fonts.
"""
import io
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RAIZ = Path(__file__).resolve().parent.parent
FONTS = RAIZ / 'public/fonts'
# Texto: ES y EN (Latin-1 + tipografía: rayas, comillas, viñeta, euro, flechas, menos, espacio fino).
TEXTO = [*range(0x20, 0x7F), *range(0xA0, 0x100), 0x2009, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C,
         0x201D, 0x2022, 0x2026, 0x202F, 0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212]
# Plex Mono solo pinta datos en MAYÚSCULAS: sin minúsculas (salvo las que tienen mayúscula en Latin-1).
MONO = [c for c in TEXTO if not (0x61 <= c <= 0x7A or 0xDF <= c <= 0xFF and c != 0xF7)]
FUNCIONES = ['kern', 'liga', 'tnum', 'lnum', 'case', 'ccmp', 'locl', 'mark', 'mkmk', 'rvrn']
# Muestras para el ancho medio: español corrido (texto y títulos) y datos (mono).
MUESTRA = ('Construimos la industria con gente que cumple, desde 1968. Obra civil, montaje mecánico y '
           'eléctrico e instrumentación en plantas de cemento y minería en Colombia, Panamá y República '
           'Dominicana. Gestionar proyectos generando valor y confianza.')
MUESTRA_MONO = 'P-06 · 9.470.000 HH · 5.250 T/DÍA · CARTAGENA, COLOMBIA · 2014-2017 · ISO 45001'
SISTEMA = {'arial': 'C:/Windows/Fonts/arial.ttf', 'arialbd': 'C:/Windows/Fonts/arialbd.ttf',
           'consolas': 'C:/Windows/Fonts/consola.ttf'}
# destino, archivo de Fontsource, ejes a fijar o recortar (variable), caracteres
FUENTES = [
    ('poppins-500.woff2', 'poppins-latin-500-normal.woff2', None, TEXTO),
    ('poppins-600.woff2', 'poppins-latin-600-normal.woff2', None, TEXTO),
    ('poppins-700.woff2', 'poppins-latin-700-normal.woff2', None, TEXTO),
    ('open-sans-var.woff2', 'open-sans-latin-wght-normal.woff2', {'wght': (400, 600)}, TEXTO),
    ('plex-mono-500.woff2', 'ibm-plex-mono-latin-500-normal.woff2', None, MONO),
]
# nombre del respaldo, archivo reducido que imita (y ejes), fuente del sistema, src, muestra
RESPALDOS = [
    ('Open Sans respaldo', 'open-sans-var.woff2', {'wght': 400}, 'arial', 'local("Arial")', MUESTRA),
    ('Poppins respaldo', 'poppins-600.woff2', None, 'arialbd', 'local("Arial Bold"), local("Arial-BoldMT")',
     MUESTRA),
    ('Plex respaldo', 'plex-mono-500.woff2', None, 'consolas', 'local("Consolas")', MUESTRA_MONO),
]


def ancho(fuente: TTFont, texto: str) -> float:
    """Ancho del texto en ems (suma de avances / unitsPerEm)."""
    cmap, hmtx = fuente.getBestCmap(), fuente['hmtx']
    upm = fuente['head'].unitsPerEm
    return sum(hmtx[cmap[ord(c)]][0] for c in texto if ord(c) in cmap) / upm


def reducir(origen: Path, destino: Path, ejes: dict | None, caracteres: list) -> None:
    fuente = TTFont(origen)
    if ejes:
        fuente = instancer.instantiateVariableFont(fuente, ejes)
        tmp = io.BytesIO()  # se guarda y relee: el subset falla sobre la gvar perezosa de la instancia
        fuente.save(tmp)
        fuente = TTFont(io.BytesIO(tmp.getvalue()))
    opciones = subset.Options()
    opciones.layout_features = FUNCIONES
    opciones.notdef_outline = True
    recorte = subset.Subsetter(opciones)
    recorte.populate(unicodes=caracteres)
    recorte.subset(fuente)
    fuente.flavor = 'woff2'
    fuente.save(destino)
    print(f'/* {destino.name}: {origen.stat().st_size / 1024:.1f} KB → {destino.stat().st_size / 1024:.1f} KB */')


def cara(nombre: str, archivo: str, ejes: dict | None, sistema: str, src: str, muestra: str) -> str:
    fuente = TTFont(io.BytesIO((FONTS / archivo).read_bytes()))
    if ejes:
        fuente = instancer.instantiateVariableFont(fuente, ejes)
    respaldo = TTFont(SISTEMA[sistema])
    ajuste = ancho(fuente, muestra) / ancho(respaldo, muestra)
    upm = fuente['head'].unitsPerEm
    hhea = fuente['hhea']
    # Como next/font: los override se dividen por size-adjust, que también escala las métricas.
    pct = lambda v: f'{abs(v) / (upm * ajuste) * 100:.2f}%'
    return (f'@font-face {{\n  font-family: "{nombre}";\n  src: {src};\n  font-weight: 100 900;\n'
            f'  size-adjust: {ajuste * 100:.2f}%;\n  ascent-override: {pct(hhea.ascent)};\n'
            f'  descent-override: {pct(hhea.descent)};\n  line-gap-override: {pct(hhea.lineGap)};\n}}')


def main() -> None:
    carpeta = Path(sys.argv[1])
    for destino, origen, ejes, caracteres in FUENTES:
        reducir(next(carpeta.rglob(origen)), FONTS / destino, ejes, caracteres)
    for r in RESPALDOS:
        print(cara(*r))


if __name__ == '__main__':
    main()
