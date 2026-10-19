"""F3.0 · Fuente y LCP (especificación §7).

Reduce Archivo variable a los rangos que usan los tokens y calcula las dos fuentes de respaldo con
métricas ajustadas, para que el cambio de fuente (font-display: swap) no mueva el texto.

Uso:  python design/fuente.py <origen.woff2>
      (origen: el woff2 latino de @fontsource-variable/archivo 5.3)
Escribe public/fonts/archivo-var-latin.woff2 e imprime los @font-face de respaldo para global.css.
Requiere: pip install fonttools brotli. Las métricas de Arial se leen de C:/Windows/Fonts.
"""
import io
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / 'public/fonts/archivo-var-latin.woff2'
# Rangos usados: pesos 300 (voz fina del lema) a 900; anchos 72 % (datos) a 125 % (cifras).
EJES = {'wght': (300, 900), 'wdth': (72, 125)}
# Caracteres de ES y EN (Latin-1 + tipografía: rayas, comillas, viñeta, euro, flechas, menos, espacio
# fino) y las funciones que usa el sitio (kern, ligaduras, cifras tabulares, acentos compuestos).
CARACTERES = [*range(0x20, 0x7F), *range(0xA0, 0x100), 0x2009, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C,
              0x201D, 0x2022, 0x2026, 0x202F, 0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212]
FUNCIONES = ['kern', 'liga', 'tnum', 'lnum', 'case', 'ccmp', 'locl', 'mark', 'mkmk', 'rvrn']
# Muestra de texto para el ancho medio: español corrido, como el del sitio.
MUESTRA = ('Construimos la industria con gente que cumple, desde 1968. Obra civil, montaje mecánico y '
           'eléctrico, fabricación y mantenimiento de plantas de cemento, minería, agua y energía en '
           'Colombia, Panamá y República Dominicana. Gestionar proyectos generando valor y confianza.')
ARIAL = {'normal': 'C:/Windows/Fonts/arial.ttf', 'negrita': 'C:/Windows/Fonts/arialbd.ttf'}
# Cara de respaldo: nombre, instancia de Archivo que imita y Arial local que la sustituye.
RESPALDOS = [
    ('Archivo respaldo', {'wght': 400, 'wdth': 100}, 'normal', 'local("Arial")'),
    ('Archivo respaldo ancho', {'wght': 850, 'wdth': 122}, 'negrita', 'local("Arial Bold"), local("Arial-BoldMT")'),
]


def ancho(fuente: TTFont, texto: str) -> float:
    """Ancho del texto en ems (suma de avances / unitsPerEm)."""
    cmap, hmtx = fuente.getBestCmap(), fuente['hmtx']
    upm = fuente['head'].unitsPerEm
    return sum(hmtx[cmap[ord(c)]][0] for c in texto if ord(c) in cmap) / upm


def instancia(origen: bytes, ejes: dict) -> TTFont:
    return instancer.instantiateVariableFont(TTFont(io.BytesIO(origen)), ejes)


def cara(nombre: str, ejes: dict, arial: str, src: str, origen: bytes) -> str:
    archivo = instancia(origen, ejes)
    respaldo = TTFont(ARIAL[arial])
    ajuste = ancho(archivo, MUESTRA) / ancho(respaldo, MUESTRA)
    upm = archivo['head'].unitsPerEm
    hhea = archivo['hhea']
    # Como next/font: los override se dividen por size-adjust, que también escala las métricas.
    pct = lambda v: f'{abs(v) / (upm * ajuste) * 100:.2f}%'
    return (f'@font-face {{\n  font-family: "{nombre}";\n  src: {src};\n  font-weight: 100 900;\n'
            f'  size-adjust: {ajuste * 100:.2f}%;\n  ascent-override: {pct(hhea.ascent)};\n'
            f'  descent-override: {pct(hhea.descent)};\n  line-gap-override: {pct(hhea.lineGap)};\n}}')


def main() -> None:
    origen = Path(sys.argv[1]).read_bytes()
    reducida = instancia(origen, EJES)
    opciones = subset.Options()
    opciones.layout_features = FUNCIONES
    opciones.notdef_outline = True
    recorte = subset.Subsetter(opciones)
    recorte.populate(unicodes=CARACTERES)
    recorte.subset(reducida)
    reducida.flavor = 'woff2'
    reducida.save(DESTINO)
    print(f'/* {DESTINO.name}: {len(origen) / 1024:.1f} KB → {DESTINO.stat().st_size / 1024:.1f} KB · '
          f'wght {EJES["wght"]} · wdth {EJES["wdth"]} */')
    for r in RESPALDOS:
        print(cara(*r, origen))


if __name__ == '__main__':
    main()
