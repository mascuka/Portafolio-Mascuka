import {
  IconBrandPython, IconBrandJavascript, IconBrandTypescript, IconCoffee, IconDatabase,
  IconBrandHtml5, IconBrandCss3, IconBrandReact, IconLetterN, IconBrandNodejs,
  IconBrandBootstrap, IconBrandTailwind, IconBrandVite, IconBolt, IconFlame,
  IconBrandMongodb, IconBrandMysql, IconBrandPrisma, IconBrandGit, IconBrandGithub,
  IconBrandGitlab, IconTriangleFilled, IconApi, IconTerminal2, IconTicket, IconBrandTrello,
} from '@tabler/icons-react';

/**
 * ÍCONOS DE LÍNEA PARA HABILIDADES (estilo 'linea')
 * Íconos de Tabler pintados con el color de cada marca. La clave es el id de
 * src/constants/tecnologias.js. color null = usa el color del texto (marcas
 * negras como GitHub o Vercel, que así se ven bien en los dos modos).
 * Las habilidades que no estén acá se muestran con su logo de siempre.
 */
export const ICONOS_LINEA = {
  python: [IconBrandPython, '#3776AB'],
  javascript: [IconBrandJavascript, '#D9A900'],
  typescript: [IconBrandTypescript, '#3178C6'],
  java: [IconCoffee, '#E76F00'],
  sql: [IconDatabase, '#336791'],
  html5: [IconBrandHtml5, '#E34F26'],
  css3: [IconBrandCss3, '#1572B6'],
  react: [IconBrandReact, '#149ECA'],
  nextjs: [IconLetterN, null],
  nodejs: [IconBrandNodejs, '#5FA04E'],
  bootstrap: [IconBrandBootstrap, '#7952B3'],
  tailwindcss: [IconBrandTailwind, '#06B6D4'],
  vite: [IconBrandVite, '#646CFF'],
  postgresql: [IconDatabase, '#336791'],
  mysql: [IconBrandMysql, '#00758F'],
  mongodb: [IconBrandMongodb, '#47A248'],
  prisma: [IconBrandPrisma, null],
  supabase: [IconBolt, '#2DB37A'],
  firebase: [IconFlame, '#F5A623'],
  git: [IconBrandGit, '#F05032'],
  github: [IconBrandGithub, null],
  gitlab: [IconBrandGitlab, '#FC6D26'],
  vercel: [IconTriangleFilled, null],
  postman: [IconApi, '#FF6C37'],
  linux: [IconTerminal2, null],
  jira: [IconTicket, '#0052CC'],
  trello: [IconBrandTrello, '#0079BF'],
};
