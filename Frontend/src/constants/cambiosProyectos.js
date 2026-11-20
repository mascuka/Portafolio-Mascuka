import { TECNOLOGIAS, buscarTecnologia, iconoTecnologia } from './tecnologias';

/**
 * DATOS PENDIENTES DE LOS PROYECTOS
 * - "Portfolio Platform" es este mismo código: se completan las tecnologías
 *   que usa y que no estaban cargadas, y el enlace al repositorio.
 * - "Ramal": las tecnologías de su código (Next.js + Supabase en Vercel).
 * - "Mi Carrera UTN": las tecnologías de su código (SPA en JavaScript puro),
 *   con las más representativas primero (son las que se ven en la tarjeta).
 *   Cada tecnología es un id o [id, nombre a mostrar].
 * - Tipo, estado, resumen corto y proyecto destacado del diseño nuevo: solo se
 *   completan si el proyecto todavía no los tiene (lo que se edite desde el
 *   panel no se pisa).
 * - Nombres de tecnologías mal escritos (RENOMBRAR) y el subtítulo de la sección.
 * - Proyectos nuevos (NUEVOS), con su portada ya subida a Cloudinary.
 * Es idempotente: si ya está todo, devuelve null y el botón del panel de admin
 * desaparece.
 */
const PENDIENTES = [
  {
    titulo: /portfolio platform/i,
    tecnologias: ['vercel', 'eslint', 'tabler'],
    repo: 'https://github.com/mascuka/Portafolio-Mascuka',
    datos: {
      tipo: 'personal',
      resumen: 'Panel para editar este portafolio sin tocar código.',
      resumenEN: 'A panel to edit this portfolio without touching code.',
    },
  },
  {
    titulo: /mi carrera/i,
    tecnologias: [
      'javascript', 'pyodide', ['webassembly', 'WebAssembly + TeaVM'], 'pdfjs', ['html5', 'HTML5'],
      ['css3', 'CSS3'], 'githubpages', ['api', 'GitHub REST API'], 'jszip',
    ],
    datos: { tipo: 'personal' },
    destacado: true,
  },
  {
    titulo: /^ramal/i,
    tecnologias: [
      ['nextjs', 'Next.js 16'], 'supabase', 'postgresql', ['react', 'React 19'],
      ['leaflet', 'Leaflet + OpenStreetMap'], 'cssmodules', 'vercel',
    ],
    datos: {
      tipo: 'personal',
      estado: 'produccion',
      resumen: 'Reclamos y pedidos ciudadanos para Córdoba.',
      resumenEN: 'Citizen requests and complaints for Córdoba.',
      intro: 'Plataforma web de gestión ciudadana para Córdoba, con un espacio de trabajo para el personal municipal.',
      introEN: 'Citizen services web platform for Córdoba, with a workspace for municipal staff.',
      puntos: [
        'Solicitudes de retiro de poda',
        'Reclamos por alumbrado, calles y residuos',
        'Seguimiento de cada gestión en línea',
      ],
      puntosEN: [
        'Tree-pruning removal requests',
        'Complaints about lighting, streets and waste',
        'Online tracking of every request',
      ],
    },
  },
  {
    titulo: /psicope/i,
    datos: {
      tipo: 'cliente',
      resumen: 'Servicios y turnos para una psicopedagoga.',
      resumenEN: 'Services and appointments for an educational psychologist.',
    },
  },
  {
    titulo: /metanoia/i,
    datos: {
      tipo: 'colaborativo',
      resumen: 'Apoyo emocional y contacto con psicólogos.',
      resumenEN: 'Emotional support and contact with psychologists.',
    },
  },
];

/**
 * PROYECTOS NUEVOS
 * Se agregan una sola vez, al final de la fila 1; si ya existe uno con ese título
 * no se toca (lo que se edite desde el panel manda).
 */
const PORTADA_BIBLIOTECAS = 'https://res.cloudinary.com/driyx3op7/image/upload/v1795137878/portfolio/projects/fpbk0ftpyzwqcv2ylijz.png';
const NUEVOS = [
  {
    titulo: /biblioteca|interbibliotecari/i,
    tecnologias: [
      ['react', 'React 18'], 'vite', 'reactrouter', ['tanstackquery', 'TanStack Query'], 'reacthookform', 'zod',
      'cssmodules', ['jwt', 'JWT'], ['api', 'API REST propia'], 'vercel',
    ],
    datos: {
      id: '1795137878000',
      title: 'Red de Bibliotecas Públicas',
      titleEN: 'Public Library Network',
      description: 'Sistema de préstamos interbibliotecarios para una red de bibliotecas públicas. Los lectores consultan el catálogo de todas las sedes, piden cualquier libro y lo retiran en la sede que les quede más cerca. Reúne reservas, préstamos y el ranking de los títulos más pedidos de la red.',
      descriptionEN: 'Interlibrary loan system for a network of public libraries. Readers browse the catalog of every branch, request any book and pick it up at the branch closest to them. It brings together reservations, loans and a ranking of the most requested titles in the network.',
      demo: 'https://sistema-prestamos-interbibliotecari.vercel.app/',
      repo: '',
      images: [PORTADA_BIBLIOTECAS],
      imagePublicIds: ['portfolio/projects/fpbk0ftpyzwqcv2ylijz'],
      image: PORTADA_BIBLIOTECAS,
      imagePublicId: 'portfolio/projects/fpbk0ftpyzwqcv2ylijz',
      row: '1',
      tipo: 'academico',
      estado: 'produccion',
      destacado: false,
      resumen: 'Préstamos de libros entre las sedes de una red de bibliotecas.',
      resumenEN: 'Book loans between the branches of a library network.',
      intro: 'Sistema de préstamos interbibliotecarios para una red de bibliotecas públicas.',
      introEN: 'Interlibrary loan system for a network of public libraries.',
      puntos: ['Catálogo de todas las sedes', 'Reservas y préstamos', 'Retiro en la sede que elija'],
      puntosEN: ['Catalog of every branch', 'Reservations and loans', 'Pick-up at the branch of your choice'],
      color: '#3E8E8A',
      capturaLaptop: '',
    },
  },
];

// Nombres de tecnologías con errores de tipeo
const RENOMBRAR = { CCS3: 'CSS3' };

// Título y subtítulo nuevos: reemplazan a los anteriores solo si no se cambiaron a mano
const TITULO = { anterior: /^Proyectos seleccionados$/i, title: 'Proyectos', titleEN: 'Projects' };
const SUBTITULO = {
  anterior: /^(Selecci[oó]n de proyectos propios y colaborativos|Proyectos propios,? (colaborativos )?y para clientes[,:] de la idea al deploy\.?$)/i,
  description: 'Sitios y aplicaciones en los que trabajé, todos en línea para que los pruebes.',
  descriptionEN: "Websites and apps I've worked on, all live for you to try.",
};

const ETIQUETAS = {
  personal: 'Personal', cliente: 'Cliente', colaborativo: 'Colaborativo', academico: 'Académico',
  produccion: 'En producción', desarrollo: 'En desarrollo',
};

const CAMPOS = { tipo: 'tipo', estado: 'estado', resumen: 'resumen corto', intro: 'introducción', puntos: 'puntos clave' };

export function calcularCambiosProyectos(lista, encabezado = {}) {
  const proyectos = JSON.parse(JSON.stringify(lista || []));
  const header = JSON.parse(JSON.stringify(encabezado || {}));
  const resumen = [];
  // Si alguno ya pasó por el formulario nuevo, el destacado lo elige el admin
  const destacadoElegido = proyectos.some(p => p.destacado !== undefined);

  for (const pendiente of PENDIENTES) {
    const proyecto = proyectos.find(p => pendiente.titulo.test(p.title || ''));
    if (!proyecto) continue;

    if (pendiente.tecnologias) {
      proyecto.technologies = proyecto.technologies || [];
      proyecto.technologyNames = proyecto.technologyNames || [];
      // Los nombres se alinean con los íconos (pueden venir más cortos)
      while (proyecto.technologyNames.length < proyecto.technologies.length) proyecto.technologyNames.push('');

      const yaEstan = new Set(proyecto.technologyNames.map(n => buscarTecnologia(n)?.id).filter(Boolean));
      for (const item of pendiente.tecnologias) {
        const [id, nombrePropio] = Array.isArray(item) ? item : [item];
        if (yaEstan.has(id)) continue;
        const nombre = nombrePropio || TECNOLOGIAS.find(t => t.id === id).nombre;
        proyecto.technologies.push(iconoTecnologia(id));
        proyecto.technologyNames.push(nombre);
        resumen.push(`Agregar ${nombre} a ${proyecto.title}`);
      }
    }

    if (pendiente.repo && !proyecto.repo) {
      proyecto.repo = pendiente.repo;
      resumen.push(`Agregar el enlace al código de ${proyecto.title}`);
    }

    for (const [campo, valor] of Object.entries(pendiente.datos || {})) {
      // Las traducciones acompañan al campo en español
      if (campo.endsWith('EN')) continue;
      if (proyecto[campo] !== undefined && proyecto[campo] !== '') continue;
      proyecto[campo] = valor;
      if (pendiente.datos[`${campo}EN`]) proyecto[`${campo}EN`] = pendiente.datos[`${campo}EN`];
      const texto = Array.isArray(valor) ? valor.join(' / ') : (ETIQUETAS[valor] || valor);
      resumen.push(`${proyecto.title}: ${CAMPOS[campo] || campo} "${texto}"`);
    }

    if (pendiente.destacado && !destacadoElegido) {
      for (const p of proyectos) p.destacado = p === proyecto;
      resumen.push(`${proyecto.title}: proyecto destacado`);
    }
  }

  for (const nuevo of NUEVOS) {
    if (proyectos.some(p => nuevo.titulo.test(p.title || ''))) continue;
    const enFila = proyectos.filter(p => String(p.row || 1) === String(nuevo.datos.row));
    const ultimo = Math.max(0, ...enFila.map(p => parseInt(p.order, 10)).filter(n => !Number.isNaN(n)));
    const tecnologias = nuevo.tecnologias.map(item => (Array.isArray(item) ? item : [item]));
    proyectos.push({
      ...nuevo.datos,
      order: ultimo + 1,
      technologies: tecnologias.map(([id]) => iconoTecnologia(id)),
      technologyNames: tecnologias.map(([id, nombre]) => nombre || TECNOLOGIAS.find(t => t.id === id).nombre),
    });
    resumen.push(`Agregar el proyecto "${nuevo.datos.title}" (posición ${ultimo + 1})`);
  }

  for (const proyecto of proyectos) {
    (proyecto.technologyNames || []).forEach((nombre, i) => {
      if (!RENOMBRAR[nombre]) return;
      proyecto.technologyNames[i] = RENOMBRAR[nombre];
      resumen.push(`${proyecto.title}: "${nombre}" → "${RENOMBRAR[nombre]}"`);
    });
  }

  if (TITULO.anterior.test((header.title || '').trim())) {
    header.title = TITULO.title;
    header.titleEN = TITULO.titleEN;
    resumen.push(`Título: "${TITULO.title}"`);
  }

  if (SUBTITULO.anterior.test(header.description || '')) {
    header.description = SUBTITULO.description;
    header.descriptionEN = SUBTITULO.descriptionEN;
    resumen.push(`Subtítulo: "${SUBTITULO.description}"`);
  }

  return resumen.length ? { proyectos, header, resumen } : null;
}
