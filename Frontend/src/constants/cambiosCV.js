import { TECNOLOGIAS, buscarTecnologia, iconoTecnologia } from './tecnologias';

/**
 * HABILIDADES DEL CV QUE FALTAN EN EL PORTFOLIO
 * Calcula los cambios a aplicar sobre las secciones de Habilidades para que
 * coincidan con el CV. Es idempotente: si ya está todo, devuelve null y el
 * botón "Aplicar CV" del panel de admin desaparece.
 */
const AGREGAR = [
  { seccion: /front/i, habilidades: [['nextjs']] },
  { seccion: /back/i, habilidades: [['sql'], ['supabase']] },
  { seccion: /herramientas|devops/i, habilidades: [['vercel']] },
];

// Habilidades "en formación" que se agregaron antes y se decidió no mostrar
const QUITAR_EN_FORMACION = ['spring', 'junit', 'pytest'];

const ACADEMICOS = ['haskell', 'smalltalk', 'prolog'];

const nuevaHabilidad = (id, enFormacion = false) => ({
  name: TECNOLOGIAS.find(t => t.id === id).nombre,
  icon: iconoTecnologia(id),
  iconPublicId: '',
  iconType: 'url',
  enFormacion,
  hasCertificate: false,
  certTitle: '', certImage: '', certPublicId: '',
  certImages: [], certPublicIds: [], certTitles: [],
});

const tieneHabilidad = (seccion, id) =>
  (seccion.skills || []).some(s => buscarTecnologia(s.name)?.id === id);

export function calcularCambiosCV(sections) {
  const secciones = JSON.parse(JSON.stringify(sections || []));
  const resumen = [];

  for (const { seccion: patron, habilidades } of AGREGAR) {
    const seccion = secciones.find(s => patron.test(s.title || ''));
    if (!seccion) continue;
    seccion.skills = seccion.skills || [];
    for (const [id, enFormacion] of habilidades) {
      if (tieneHabilidad(seccion, id)) continue;
      seccion.skills.push(nuevaHabilidad(id, enFormacion));
      resumen.push(`Agregar ${nuevaHabilidad(id).name}${enFormacion ? ' (en formación)' : ''} en ${seccion.title}`);
    }
  }

  for (const seccion of secciones) {
    const antes = seccion.skills || [];
    const quedan = antes.filter(s => !(s.enFormacion && QUITAR_EN_FORMACION.includes(buscarTecnologia(s.name)?.id)));
    for (const quitada of antes.filter(s => !quedan.includes(s))) {
      resumen.push(`Quitar ${quitada.name} (en formación) de ${seccion.title}`);
    }
    seccion.skills = quedan;
  }

  let academicos = secciones.find(s => /acad/i.test(s.title || ''));
  if (!academicos) {
    // Va al lado de "Testing y QA" si esa tarjeta ocupa media fila; si no, en una fila nueva
    const testing = secciones.find(s => /testing|qa/i.test(s.title || ''));
    const ultimaFila = Math.max(0, ...secciones.map(s => (s.gridRow || 1) + (s.rows || 1) - 1));
    academicos = { title: 'Académicos', titleEN: 'Academic', rows: 1, width: '100%', gridRow: ultimaFila + 1, gridColumn: 1, skills: [] };
    if (testing && testing.width === '50%') {
      testing.gridColumn = 1;
      Object.assign(academicos, { width: '50%', gridRow: testing.gridRow || 1, gridColumn: 7 });
    }
    secciones.push(academicos);
    resumen.push('Crear la sección "Académicos"');
  }
  academicos.skills = academicos.skills || [];

  for (const id of ACADEMICOS) {
    if (tieneHabilidad(academicos, id)) continue;
    // Si ya está en otra sección (Haskell en Backend), se mueve con su ícono y certificados
    const origen = secciones.find(s => s !== academicos && tieneHabilidad(s, id));
    if (origen) {
      const indice = origen.skills.findIndex(s => buscarTecnologia(s.name)?.id === id);
      const [habilidad] = origen.skills.splice(indice, 1);
      academicos.skills.push(habilidad);
      resumen.push(`Mover ${habilidad.name} de ${origen.title} a Académicos`);
    } else {
      academicos.skills.push(nuevaHabilidad(id));
      resumen.push(`Agregar ${nuevaHabilidad(id).name} en Académicos`);
    }
  }

  return resumen.length ? { secciones, resumen } : null;
}
