import { useEffect, useRef, useState } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconArrowRight, IconBrandGithub, IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { resolverTecnologia } from '../constants/tecnologias';

const esVideo = (url) =>
  !!url && (url.startsWith('data:video/') || /\.(mp4|webm|mov|avi)$/i.test(url) || url.includes('/video/upload/'));

/**
 * Texto de la descripción: los párrafos se separan con una línea en blanco,
 * los saltos simples se respetan y **texto** se muestra en negrita.
 */
function TextoConFormato({ texto }) {
  const parrafos = (texto || '').trim().split(/\n\s*\n/);
  return parrafos.map((parrafo, i) => (
    <p key={i}>
      {parrafo.split('\n').map((linea, j) => (
        <span key={j}>
          {j > 0 && <br />}
          {linea.split(/(\*\*[^*]+\*\*)/g).map((parte, k) =>
            parte.startsWith('**') && parte.endsWith('**')
              ? <strong key={k}>{parte.slice(2, -2)}</strong>
              : parte
          )}
        </span>
      ))}
    </p>
  ));
}

/**
 * DETALLE DE PROYECTO
 * Panel estilo publicación: las imágenes a la izquierda (o arriba en celular)
 * y a la derecha la descripción completa, las tecnologías y los enlaces.
 */
export default function ProyectoDetalle({ project, initialIndex = 0, lang, onClose }) {
  const media = (project.images && project.images.length > 0 ? project.images : [project.image]).filter(Boolean);
  const [indice, setIndice] = useState(Math.min(initialIndex, Math.max(media.length - 1, 0)));
  // Zoom de la imagen: ampliada o no, y el punto (en %) que queda en foco
  const [zoom, setZoom] = useState(false);
  const [origen, setOrigen] = useState('50% 50%');
  const cerrarRef = useRef(null);
  const mediaRef = useRef(null);
  const toqueInicio = useRef(null);
  const total = media.length;

  // Al cambiar de imagen se vuelve al tamaño normal
  const irA = (calcular) => {
    setZoom(false);
    setIndice(calcular);
  };
  const anterior = () => irA(i => (i - 1 + total) % total);
  const siguiente = () => irA(i => (i + 1) % total);

  const enfocar = (x, y) => {
    const caja = mediaRef.current?.getBoundingClientRect();
    if (!caja) return;
    const porcentaje = (valor, inicio, largo) => Math.min(100, Math.max(0, ((valor - inicio) / largo) * 100));
    setOrigen(`${porcentaje(x, caja.left, caja.width)}% ${porcentaje(y, caja.top, caja.height)}%`);
  };

  const alternarZoom = (e) => {
    if (!zoom) enfocar(e.clientX, e.clientY);
    setZoom(z => !z);
  };

  // Teclado: Esc cierra, flechas cambian de imagen. El fondo no se desplaza mientras está abierto.
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape') onClose();
      if (total > 1 && e.key === 'ArrowLeft') { setZoom(false); setIndice(i => (i - 1 + total) % total); }
      if (total > 1 && e.key === 'ArrowRight') { setZoom(false); setIndice(i => (i + 1) % total); }
    };
    document.addEventListener('keydown', alPresionar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose, total]);

  // Celular: deslizar cambia de imagen; con zoom, el dedo recorre la imagen ampliada
  const alTocar = (e) => { toqueInicio.current = e.touches[0].clientX; };
  const alMoverDedo = (e) => {
    if (zoom) enfocar(e.touches[0].clientX, e.touches[0].clientY);
  };
  const alSoltar = (e) => {
    if (zoom || toqueInicio.current === null || total < 2) return;
    const delta = e.changedTouches[0].clientX - toqueInicio.current;
    if (Math.abs(delta) > 40) (delta < 0 ? siguiente : anterior)();
    toqueInicio.current = null;
  };

  const titulo = lang === 'ES' ? project.title : (project.titleEN || project.title);
  const descripcion = lang === 'ES' ? project.description : (project.descriptionEN || project.description);
  const tecnologias = (project.technologies || []).map((url, i) => resolverTecnologia(url, project.technologyNames?.[i]));
  const actual = media[indice];

  return (
    <div
      className="detalle-fondo fixed inset-0 z-[500] flex items-center justify-center md:p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-proyecto-titulo"
    >
      <div className="detalle-panel w-full h-full md:w-[min(96vw,1680px)] md:h-[min(92vh,1000px)] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden animate-slideUp">

        {/* Imágenes */}
        <div
          ref={mediaRef}
          className={`detalle-media relative flex-shrink-0 md:flex-1 md:min-w-0 aspect-video md:aspect-auto flex items-center justify-center overflow-hidden ${zoom ? 'con-zoom' : ''}`}
          onTouchStart={alTocar}
          onTouchMove={alMoverDedo}
          onTouchEnd={alSoltar}
        >
          {actual && (esVideo(actual) ? (
            <video key={actual} src={actual} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <>
              <img
                key={actual}
                src={actual}
                alt={`${titulo} (${indice + 1} de ${total})`}
                className="detalle-imagen w-full h-full object-contain select-none"
                style={{ transform: zoom ? 'scale(2.5)' : 'none', transformOrigin: origen }}
                onClick={alternarZoom}
                onMouseMove={(e) => { if (zoom) enfocar(e.clientX, e.clientY); }}
                draggable={false}
              />
              <button
                type="button"
                onClick={() => { setOrigen('50% 50%'); setZoom(z => !z); }}
                className="detalle-boton-zoom"
                aria-label={zoom ? 'Reducir imagen' : 'Ampliar imagen'}
                aria-pressed={zoom}
              >
                {zoom
                  ? <IconZoomOut size={18} stroke={2} aria-hidden="true" />
                  : <IconZoomIn size={18} stroke={2} aria-hidden="true" />}
              </button>
            </>
          ))}

          {total > 1 && (
            <>
              <button type="button" onClick={anterior} className="detalle-flecha left-3" aria-label="Imagen anterior">
                <IconChevronLeft size={20} stroke={2} aria-hidden="true" />
              </button>
              <button type="button" onClick={siguiente} className="detalle-flecha right-3" aria-label="Imagen siguiente">
                <IconChevronRight size={20} stroke={2} aria-hidden="true" />
              </button>
              <span className="detalle-contador">{indice + 1} / {total}</span>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {media.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => irA(() => i)}
                    className={`detalle-punto ${i === indice ? 'activo' : ''}`}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={i === indice ? 'true' : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Información */}
        <aside className="detalle-info flex flex-col flex-1 md:flex-none md:w-[360px] xl:w-[400px] md:flex-shrink-0 md:min-h-0">
          <header className="detalle-cabecera flex items-start justify-between gap-4">
            <h3 id="detalle-proyecto-titulo" className="detalle-titulo">{titulo}</h3>
            <button ref={cerrarRef} type="button" onClick={onClose} className="detalle-cerrar" aria-label="Cerrar">
              <IconX size={18} stroke={2} aria-hidden="true" />
            </button>
          </header>

          {/* La descripción se desplaza sola; las tecnologías quedan siempre al pie */}
          <div className="detalle-cuerpo flex-1 md:min-h-0 md:overflow-y-auto">
            {descripcion && (
              <div className="detalle-descripcion">
                <TextoConFormato texto={descripcion} />
              </div>
            )}
          </div>

          {tecnologias.length > 0 && (
            <div className="detalle-tecnologias flex-shrink-0">
              <h4 className="detalle-etiqueta">{lang === 'ES' ? 'Tecnologías' : 'Technologies'}</h4>
              <ul className="flex flex-wrap gap-2">
                {tecnologias.map((tec, i) => (
                  <li key={i} className="detalle-tecnologia">
                    <img src={tec.icono} alt="" />
                    {tec.nombre && <span>{tec.nombre}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(project.demo || project.repo) && (
            <footer className="detalle-pie flex gap-2">
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="detalle-boton principal">
                  {lang === 'ES' ? 'Ver proyecto' : 'View project'}
                  <IconArrowRight size={16} stroke={2} aria-hidden="true" />
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="detalle-boton secundario">
                  <IconBrandGithub size={16} stroke={1.75} aria-hidden="true" />
                  {lang === 'ES' ? 'Ver código' : 'View code'}
                </a>
              )}
            </footer>
          )}
        </aside>
      </div>
    </div>
  );
}
