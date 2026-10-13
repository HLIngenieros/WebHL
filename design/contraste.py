"""Verifica el contraste WCAG de los pares de color definidos en tokens.css.

Uso: python design/contraste.py
Sale con código 1 si algún par queda por debajo de su mínimo.
"""
import re
import sys
from pathlib import Path

TOKENS = Path(__file__).with_name("tokens.css")

# (texto/elemento, fondo, mínimo, uso)
PARES = [
    ("ink", "bg", 4.5, "texto principal"),
    ("ink", "paper", 4.5, "texto en paneles"),
    ("muted", "bg", 4.5, "texto secundario"),
    ("muted", "paper", 4.5, "texto secundario en paneles"),
    ("accent", "bg", 4.5, "enlaces"),
    ("accent", "paper", 4.5, "enlaces en paneles"),
    ("accent-ink", "accent", 4.5, "botón primario"),
    ("bg", "ink", 4.5, "botón/filtro activo invertido"),
    ("signal-ink", "bg", 4.5, "señalización como texto"),
    ("signal-ink", "paper", 4.5, "señalización como texto en paneles"),
    ("accent", "accent-soft", 4.5, "chip de acento"),
    ("signal-ink", "signal-soft", 4.5, "chip alto"),
    ("bad", "bad-soft", 4.5, "chip crítico"),
    ("good", "good-soft", 4.5, "chip correcto"),
    ("bad", "bg", 4.5, "mensaje de error"),
    ("signal", "bg", 3.0, "cotas y marcas (no texto)"),
    ("accent", "bg", 3.0, "anillo de foco (no texto)"),
    ("ink", "bg", 3.0, "borde inferior de campos (no texto)"),
]


def bloque(css, selector):
    i = css.index(selector)
    ini = css.index("{", i) + 1
    fin = css.index("}", ini)
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9A-Fa-f]{6})", css[ini:fin]))


def luminancia(hexa):
    canales = [int(hexa[k:k + 2], 16) / 255 for k in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contraste(a, b):
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    css = TOKENS.read_text(encoding="utf-8")
    claro = bloque(css, ":root {")
    oscuro = {**claro, **bloque(css, ':root[data-theme="dark"]')}
    fallos = 0
    print(f"{'Par':<28}{'Uso':<38}{'Mín':>5}{'Claro':>8}{'Oscuro':>8}")
    for fg, bg, minimo, uso in PARES:
        fila = f"{fg + ' / ' + bg:<28}{uso:<38}{minimo:>5}"
        for tema in (claro, oscuro):
            r = contraste(tema[fg], tema[bg])
            ok = r >= minimo
            fallos += not ok
            fila += f"{r:>7.2f}{'' if ok else '!'}"
        print(fila)
    print("\nOK" if not fallos else f"\n{fallos} par(es) por debajo del mínimo (!)")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
