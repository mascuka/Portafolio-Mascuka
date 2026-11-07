/**
 * ÍCONOS DE TECNOLOGÍAS GUARDADOS EN EL PORTFOLIO
 * Los archivos viven en public/iconos/tecnologias/<id>.svg: los logos son de
 * Devicon (licencia MIT), los de Cloudinary y Leaflet de Simple Icons (CC0) y sql,
 * smalltalk, api, emailjs, tabler, lean, githubpages, pyodide, pdfjs, jszip, cssmodules y los de
 * fundamentos son propios; WebAssembly es de Devicon.
 * `alias` permite reconocer nombres ya cargados con otra escritura
 * (por ejemplo "HTML 5", "Javascript" o "Node").
 */
export const TECNOLOGIAS = [
  { id: 'html5', nombre: 'HTML 5', alias: ['html'] },
  { id: 'css3', nombre: 'CSS', alias: ['css3', 'ccs3'] },
  { id: 'javascript', nombre: 'JavaScript', alias: ['js'] },
  { id: 'typescript', nombre: 'TypeScript', alias: ['ts'] },
  { id: 'react', nombre: 'React', alias: ['reactjs'] },
  { id: 'nextjs', nombre: 'Next.js', alias: ['next'] },
  { id: 'bootstrap', nombre: 'Bootstrap' },
  { id: 'tailwindcss', nombre: 'Tailwind CSS', alias: ['tailwind'] },
  { id: 'vite', nombre: 'Vite', alias: ['vitejs'] },
  { id: 'nodejs', nombre: 'Node.js', alias: ['node'] },
  { id: 'express', nombre: 'Express', alias: ['expressjs'] },
  { id: 'axios', nombre: 'Axios' },
  { id: 'socketio', nombre: 'Socket.io', alias: ['socketioclient', 'socket'] },
  { id: 'puppeteer', nombre: 'Puppeteer' },
  { id: 'python', nombre: 'Python' },
  { id: 'java', nombre: 'Java' },
  { id: 'spring', nombre: 'Spring', alias: ['springboot'] },
  { id: 'sql', nombre: 'SQL' },
  { id: 'mysql', nombre: 'MySQL' },
  { id: 'postgresql', nombre: 'PostgreSQL', alias: ['postgres'] },
  { id: 'sqlite', nombre: 'SQLite' },
  { id: 'mongodb', nombre: 'MongoDB', alias: ['mongo'] },
  { id: 'prisma', nombre: 'Prisma', alias: ['prismaorm'] },
  { id: 'supabase', nombre: 'Supabase' },
  { id: 'firebase', nombre: 'Firebase' },
  { id: 'cloudinary', nombre: 'Cloudinary' },
  { id: 'emailjs', nombre: 'EmailJS' },
  { id: 'vercel', nombre: 'Vercel' },
  { id: 'eslint', nombre: 'ESLint' },
  { id: 'tabler', nombre: 'Tabler Icons', alias: ['tablericons', 'tablericonsreact'] },
  { id: 'api', nombre: 'API REST', alias: ['api', 'rest', 'restapi', 'githubrestapi', 'githubapi'] },
  { id: 'junit', nombre: 'JUnit' },
  { id: 'pytest', nombre: 'pytest' },
  { id: 'postman', nombre: 'Postman' },
  { id: 'haskell', nombre: 'Haskell' },
  { id: 'prolog', nombre: 'Prolog' },
  { id: 'smalltalk', nombre: 'Smalltalk' },
  { id: 'git', nombre: 'Git' },
  { id: 'github', nombre: 'GitHub' },
  { id: 'githubpages', nombre: 'GitHub Pages', alias: ['ghpages'] },
  { id: 'webassembly', nombre: 'WebAssembly', alias: ['wasm', 'webassemblyteavm', 'teavm'] },
  { id: 'pyodide', nombre: 'Pyodide' },
  { id: 'pdfjs', nombre: 'PDF.js', alias: ['pdfjsdist'] },
  { id: 'jszip', nombre: 'JSZip' },
  { id: 'leaflet', nombre: 'Leaflet', alias: ['leafletopenstreetmap', 'leafletjs', 'openstreetmap'] },
  { id: 'cssmodules', nombre: 'CSS Modules', alias: ['cssmodule'] },
  { id: 'gitlab', nombre: 'GitLab' },
  { id: 'linux', nombre: 'Linux' },
  { id: 'windows', nombre: 'Windows' },
  { id: 'jira', nombre: 'Jira' },
  { id: 'trello', nombre: 'Trello' },
  { id: 'figma', nombre: 'Figma' },
  { id: 'vscode', nombre: 'VS Code', alias: ['visualstudiocode'] },
  { id: 'lean', nombre: 'Lean' },
  // Fundamentos (conceptos, con íconos propios)
  { id: 'poo', nombre: 'POO', alias: ['programacionorientadaaobjetos', 'oop'] },
  { id: 'algoritmos', nombre: 'Algoritmos y estructuras de datos', alias: ['algoritmosyestructurasdedatos', 'estructurasdedatos'] },
  { id: 'testing', nombre: 'Testing y QA', alias: ['testingqa', 'qa', 'pruebasdesoftware'] },
  { id: 'redes', nombre: 'Redes/CCNA', alias: ['redes', 'networking', 'ccna'] },
];

export const iconoTecnologia = (id) => `/iconos/tecnologias/${id}.svg`;

export const normalizar = (texto) => (texto || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const coincide = (t, clave) =>
  normalizar(t.nombre) === clave || t.id === clave || (t.alias || []).includes(clave);

/**
 * Busca una tecnología por nombre (sin importar mayúsculas, espacios ni puntos).
 * Si no la encuentra, prueba sin el número de versión del final ("Vite 7").
 */
export function buscarTecnologia(nombre) {
  const clave = normalizar(nombre);
  if (!clave) return null;
  const sinVersion = clave.replace(/\d+$/, '');
  return TECNOLOGIAS.find(t => coincide(t, clave))
    || (sinVersion && sinVersion !== clave ? TECNOLOGIAS.find(t => coincide(t, sinVersion)) : null)
    || null;
}

/** Busca una tecnología por la ruta de su ícono local. */
export function tecnologiaPorIcono(url) {
  const coincidencia = /\/iconos\/tecnologias\/([a-z0-9]+)\.svg$/.exec(url || '');
  return coincidencia ? TECNOLOGIAS.find(t => t.id === coincidencia[1]) || null : null;
}

/**
 * Ícono y nombre a mostrar para una tecnología guardada en un proyecto
 * (`url` del ícono cargado + `nombre` opcional). Si la tecnología está en el
 * portfolio se usa el ícono local; si no, el que se cargó.
 */
export function resolverTecnologia(url, nombre) {
  const conocida = buscarTecnologia(nombre) || tecnologiaPorIcono(url);
  return {
    icono: conocida ? iconoTecnologia(conocida.id) : url,
    nombre: nombre || conocida?.nombre || '',
  };
}
