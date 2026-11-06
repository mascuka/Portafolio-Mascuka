import { TECNOLOGIAS, buscarTecnologia, iconoTecnologia } from './tecnologias';

/**
 * DATOS PENDIENTES DE LOS PROYECTOS
 * "Portfolio Platform" es este mismo código: se completan las tecnologías que
 * usa y que no estaban cargadas, y el enlace al repositorio. Es idempotente: si
 * ya está todo, devuelve null y el botón del panel de admin desaparece.
 */
const PENDIENTES = [
  {
    titulo: /portfolio platform/i,
    tecnologias: ['vercel', 'eslint', 'tabler'],
    repo: 'https://github.com/mascuka/Portafolio-Mascuka',
  },
];

export function calcularCambiosProyectos(lista) {
  const proyectos = JSON.parse(JSON.stringify(lista || []));
  const resumen = [];

  for (const pendiente of PENDIENTES) {
    const proyecto = proyectos.find(p => pendiente.titulo.test(p.title || ''));
    if (!proyecto) continue;
    proyecto.technologies = proyecto.technologies || [];
    proyecto.technologyNames = proyecto.technologyNames || [];
    // Los nombres se alinean con los íconos (pueden venir más cortos)
    while (proyecto.technologyNames.length < proyecto.technologies.length) proyecto.technologyNames.push('');

    const yaEstan = new Set(proyecto.technologyNames.map(n => buscarTecnologia(n)?.id).filter(Boolean));
    for (const id of pendiente.tecnologias) {
      if (yaEstan.has(id)) continue;
      const { nombre } = TECNOLOGIAS.find(t => t.id === id);
      proyecto.technologies.push(iconoTecnologia(id));
      proyecto.technologyNames.push(nombre);
      resumen.push(`Agregar ${nombre} a ${proyecto.title}`);
    }

    if (pendiente.repo && !proyecto.repo) {
      proyecto.repo = pendiente.repo;
      resumen.push(`Agregar el enlace al código de ${proyecto.title}`);
    }
  }

  return resumen.length ? { proyectos, resumen } : null;
}
