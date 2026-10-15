// Lámina de foto (guía §6 y §8): la foto en monocromo teñida con el acento de la sección y el trazo de
// plano encima; al pasar el cursor vuelve a color. Nunca pasa de 800 px. Sin foto, la ilustración.
import Ilustracion from './Ilustracion';
import type { Imagen } from '../lib/explorador';

interface Props {
  imagen?: Imagen;
  sector: string;
  sizes: string;
  /** Texto de la ilustración cuando no hay foto (si no, es decorativa). */
  titulo?: string;
  prioridad?: boolean;
  clase?: string;
}

export default function Lamina({ imagen, sector, sizes, titulo, prioridad = false, clase }: Props) {
  if (!imagen) {
    return (
      <div className={`lamina sin-foto${clase ? ` ${clase}` : ''}`}>
        <Ilustracion sector={sector} titulo={titulo} clase="lamina-trazo" />
      </div>
    );
  }
  return (
    <div className={`lamina${clase ? ` ${clase}` : ''}`}>
      <picture>
        <source type="image/avif" srcSet={imagen.avif} sizes={sizes} />
        <source type="image/webp" srcSet={imagen.webp} sizes={sizes} />
        <img
          src={imagen.src}
          width={imagen.width}
          height={imagen.height}
          alt={imagen.alt}
          loading={prioridad ? 'eager' : 'lazy'}
          decoding={prioridad ? 'auto' : 'async'}
          fetchPriority={prioridad ? 'high' : 'auto'}
        />
      </picture>
      <span className="lamina-tinte" aria-hidden="true" />
      <Ilustracion sector={sector} tono="blanco" clase="lamina-trazo" />
    </div>
  );
}
