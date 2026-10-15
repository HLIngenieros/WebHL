// Línea estructural por sector (guía §6): lo que se ve mientras llega la fotografía, y el trazo que se
// dibuja sobre la lámina. React sin estado: Astro la compila a HTML y la isla del explorador la reutiliza.
// Tres capas para el paralaje de Sectores: estructura (--ink), ejes (--sec, punteados) y cotas (--signal).

type Dibujo = { estructura: string[]; ejes: number[]; cotas: [number, number, number][] };

const SUELO = 'M10 185 H290';

const DIBUJOS: Record<string, Dibujo> = {
  // Torre de precalentador con ciclones, horno inclinado y silo
  cemento: {
    estructura: [
      SUELO,
      'M60 185 V40 H112 V185',
      'M60 70 H112 M60 100 H112 M60 130 H112 M60 160 H112',
      'M60 40 L112 70 M112 70 L60 100 M60 100 L112 130 M112 130 L60 160',
      'M74 48 h24 v10 l-12 10 l-12 -10 z M74 108 h24 v10 l-12 10 l-12 -10 z',
      'M112 146 L232 166 M112 158 L232 178',
      'M140 147 v14 M180 154 v14 M214 160 v14',
      'M236 185 V82 H274 V185 M236 82 L255 62 L274 82',
    ],
    ejes: [86, 255],
    cotas: [[60, 112, 28], [236, 274, 52]],
  },
  // Espesador con puente de rastras y banda transportadora con cercha
  mineria: {
    estructura: [
      SUELO,
      'M30 185 V152 H150 V185',
      'M24 152 H156 M90 152 V128 M40 140 H140',
      'M150 176 L262 70 M156 184 L268 78',
      'M162 170 L174 176 L186 150 L198 158 L210 128 L222 136 L234 106 L246 114 L258 84',
      'M180 185 V158 M222 185 V132 M262 185 V96',
      'M262 70 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0',
    ],
    ejes: [90, 222],
    cotas: [[30, 150, 140], [180, 262, 50]],
  },
  // Dos digestores con cúpula, tubería de unión y chimenea
  'agua-y-energia': {
    estructura: [
      SUELO,
      'M40 185 V96 Q70 64 100 96 V185',
      'M120 185 V96 Q150 64 180 96 V185',
      'M40 120 H100 M120 120 H180',
      'M100 150 H120 M100 160 H120',
      'M200 185 V150 H260 V185 M210 150 V130 H250 V150',
      'M268 185 V40 H278 V185',
    ],
    ejes: [70, 150, 273],
    cotas: [[40, 100, 56], [120, 180, 56]],
  },
  // Tanques API con techo cónico y rack de tubería
  'petroleo-y-gas': {
    estructura: [
      SUELO,
      'M24 185 V112 H116 V185 M24 112 L70 96 L116 112',
      'M24 136 H116 M24 160 H116',
      'M136 185 V132 H196 V185 M136 132 L166 120 L196 132',
      'M196 104 H290 M196 116 H290',
      'M214 185 V104 M250 185 V104 M286 185 V104',
      'M214 140 L250 116 M250 140 L286 116',
    ],
    ejes: [70, 166, 250],
    cotas: [[24, 116, 86], [214, 286, 92]],
  },
  // Viga continua sobre pilas con zapata
  infraestructura: {
    estructura: [
      SUELO,
      'M10 104 H290 M10 120 H290',
      'M10 104 L30 120 L50 104 L70 120 L90 104 L110 120 L130 104 L150 120 L170 104 L190 120 L210 104 L230 120 L250 104 L270 120 L290 104',
      'M74 120 V176 M86 120 V176 M64 176 H96 V185 H64 Z',
      'M144 120 V176 M156 120 V176 M134 176 H166 V185 H134 Z',
      'M214 120 V176 M226 120 V176 M204 176 H236 V185 H204 Z',
    ],
    ejes: [80, 150, 220],
    cotas: [[80, 150, 92], [150, 220, 92]],
  },
  // Nave industrial con cercha a dos aguas
  industria: {
    estructura: [
      SUELO,
      'M40 185 V100 M260 185 V100 M40 100 H260',
      'M40 100 L150 52 L260 100',
      'M62 100 L62 90 M84 100 L84 81 M106 100 L106 71 M128 100 L128 62 M150 100 L150 52 M172 100 L172 62 M194 100 L194 71 M216 100 L216 81 M238 100 L238 90',
      'M40 100 L84 81 M84 100 L128 62 M128 100 L150 52 M172 100 L150 52 M216 100 L172 62 M260 100 L216 81',
      'M110 185 V140 H190 V185',
    ],
    ejes: [40, 150, 260],
    cotas: [[40, 260, 40]],
  },
};

export const SECTORES_ILUSTRADOS = Object.keys(DIBUJOS);

interface Props { sector: string; titulo?: string; clase?: string; tono?: 'linea' | 'blanco' }

export default function Ilustracion({ sector, titulo, clase, tono = 'linea' }: Props) {
  const d = DIBUJOS[sector] ?? DIBUJOS.industria;
  const accesible = titulo ? { role: 'img', 'aria-label': titulo } : { 'aria-hidden': true as const };
  let i = 0;
  return (
    <svg viewBox="0 0 300 200" className={`ilustracion trazo tono-${tono}${clase ? ` ${clase}` : ''}`} preserveAspectRatio="xMidYMid meet" {...accesible}>
      <g className="capa-ejes">
        {d.ejes.map((x) => (
          <g key={x}>
            <line x1={x} y1={20} x2={x} y2={185} />
            <circle cx={x} cy={13} r={6} />
          </g>
        ))}
      </g>
      <g className="capa-estructura">
        {d.estructura.map((p) => <path key={p} className="t" d={p} pathLength={1} style={{ '--i': i++ } as React.CSSProperties} />)}
      </g>
      <g className="capa-cotas">
        {d.cotas.map(([x1, x2, y]) => (
          <path key={`${x1}-${x2}-${y}`} className="t" pathLength={1} style={{ '--i': i++ } as React.CSSProperties}
            d={`M${x1} ${y} H${x2} M${x1} ${y - 5} V${y + 5} M${x2} ${y - 5} V${y + 5} M${x1 - 3} ${y + 3} L${x1 + 3} ${y - 3} M${x2 - 3} ${y + 3} L${x2 + 3} ${y - 3}`} />
        ))}
      </g>
    </svg>
  );
}
