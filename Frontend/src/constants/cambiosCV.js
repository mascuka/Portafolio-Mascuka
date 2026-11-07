import { TECNOLOGIAS, buscarTecnologia, iconoTecnologia, normalizar } from './tecnologias';

/**
 * ESTRUCTURA DE HABILIDADES SEGÚN EL CV
 * Arma las secciones de Habilidades con estas filas y este orden. Reutiliza
 * las habilidades ya cargadas (con su ícono y certificados) y crea las que
 * faltan con los íconos del portfolio. Cada ítem es el id de una tecnología
 * conocida o, si empieza con "=", un texto literal sin ícono.
 * Las de QUITAR se eliminan; cualquier otra que no figure acá se conserva en
 * Herramientas. Es idempotente: si ya está todo, devuelve null y el botón
 * "Aplicar CV" del panel de admin desaparece.
 */
const ESTRUCTURA = [
  { title: 'Lenguajes', titleEN: 'Languages', items: ['python', 'javascript', 'java', 'html5', 'css3', 'haskell', 'smalltalk', 'prolog'] },
  { title: 'Frameworks', titleEN: 'Frameworks', items: ['react', 'nextjs', 'nodejs', 'bootstrap'] },
  { title: 'Bases de datos', titleEN: 'Databases', items: ['sql', 'supabase', 'firebase'] },
  { title: 'Herramientas', titleEN: 'Tools', items: ['git', 'github', 'gitlab', 'vercel', 'postman', 'linux', 'windows', 'jira', 'trello'] },
  { title: 'Metodologías', titleEN: 'Methodologies', soloTexto: true, items: ['scrum', 'kanban', 'lean'] },
  { title: 'Fundamentos', titleEN: 'Fundamentals', soloTexto: true, items: ['poo', 'testing', 'redes', '=IT Essentials v7'] },
];

// Se sacan del portfolio
const QUITAR = ['asana', 'algoritmos'];

// Se renombran con el nombre del portfolio aunque estén cargadas de otra forma
const RENOMBRAR = ['redes'];

const FILA_SOBRANTES = 'Herramientas';

// Identifica una habilidad por su tecnología conocida o, si no está, por su nombre
const clave = (habilidad) => buscarTecnologia(habilidad.name)?.id || normalizar(habilidad.name);
const claveItem = (item) => (item.startsWith('=') ? normalizar(item.slice(1)) : item);

const nuevaHabilidad = (item) => {
  const literal = item.startsWith('=');
  return {
    name: literal ? item.slice(1) : TECNOLOGIAS.find(t => t.id === item).nombre,
    icon: literal ? '' : iconoTecnologia(item),
    iconPublicId: '',
    iconType: 'url',
    hasCertificate: false,
    certTitle: '', certImage: '', certPublicId: '',
    certImages: [], certPublicIds: [], certTitles: [],
  };
};

export function calcularCambiosCV(sections) {
  const actuales = JSON.parse(JSON.stringify(sections || []));

  // Todas las habilidades cargadas, con la sección donde están hoy
  const disponibles = new Map();
  for (const seccion of actuales) {
    for (const habilidad of seccion.skills || []) {
      const k = clave(habilidad);
      if (!disponibles.has(k)) disponibles.set(k, { habilidad, origen: seccion.title });
    }
  }

  const resumen = [];
  const nuevas = [];
  const usadas = new Set();
  const secciones = ESTRUCTURA.map((fila, posicion) => {
    const skills = [];
    for (const item of fila.items) {
      const k = claveItem(item);
      const existente = disponibles.get(k);
      if (existente) {
        // Corrige mayúsculas mal escritas ("Javascript" → "JavaScript") y los de RENOMBRAR ("Redes" → "Redes/CCNA")
        const oficial = TECNOLOGIAS.find(t => t.id === item)?.nombre;
        if (oficial && oficial !== existente.habilidad.name
          && (RENOMBRAR.includes(item) || oficial.toLowerCase() === existente.habilidad.name.toLowerCase())) {
          existente.habilidad.name = oficial;
        }
        skills.push(existente.habilidad);
      } else if (item.startsWith('=') || TECNOLOGIAS.some(t => t.id === item)) {
        const nueva = nuevaHabilidad(item);
        skills.push(nueva);
        nuevas.push(nueva.name);
      } else {
        continue;
      }
      usadas.add(k);
    }
    return {
      title: fila.title, titleEN: fila.titleEN, rows: 1, width: '100%',
      gridRow: posicion + 1, gridColumn: 1, orden: posicion,
      soloTexto: !!fila.soloTexto, skills,
    };
  });

  // Las que no están en la estructura: se quitan las de QUITAR y el resto va a Herramientas
  const quitadas = [];
  const destino = secciones.find(s => s.title === FILA_SOBRANTES);
  for (const [k, { habilidad, origen }] of disponibles) {
    if (usadas.has(k)) continue;
    if (QUITAR.includes(k)) {
      quitadas.push(habilidad.name);
      continue;
    }
    destino.skills.push(habilidad);
    resumen.push(`${habilidad.name} no figura en el CV: se conserva en ${FILA_SOBRANTES} (venía de ${origen})`);
  }

  // Si las filas y su contenido ya coinciden, no hay nada que aplicar
  const firma = (lista) => JSON.stringify(lista.map(s => [s.title, !!s.soloTexto, (s.skills || []).map(k => [clave(k), k.name])]));
  const ordenActual = [...actuales].sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
  if (firma(ordenActual) === firma(secciones)) return null;

  // Resumen para la confirmación: cómo quedan las filas, qué se agrega y qué se quita
  return {
    secciones,
    resumen: [
      ...secciones.map(s => `${s.title}${s.soloTexto ? ' (solo texto)' : ''}: ${s.skills.map(k => k.name).join(', ')}`),
      ...(nuevas.length ? [`Nuevas: ${nuevas.join(', ')}`] : []),
      ...(quitadas.length ? [`Quitar: ${quitadas.join(', ')}`] : []),
      ...resumen,
    ],
  };
}
