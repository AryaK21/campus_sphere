const fs = require('fs');
const path = require('path');

// Determine root directory
const rootDir = fs.existsSync(path.join(process.cwd(), 'client'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..');

const clientDist = path.join(rootDir, 'client', 'dist');
const rootDist = path.join(rootDir, 'dist');

if (!fs.existsSync(clientDist)) {
  console.log('client/dist does not exist yet.');
  process.exit(0);
}

// Copy client/dist to root dist
fs.cpSync(clientDist, rootDist, { recursive: true, force: true });

const indexHtmlPath = path.join(rootDist, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('dist/index.html does not exist.');
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

// 404.html fallback for Vercel
fs.writeFileSync(path.join(rootDist, '404.html'), indexHtml);
fs.writeFileSync(path.join(clientDist, '404.html'), indexHtml);

// All SPA routes in the app
const routes = [
  'login',
  'dashboard',
  'auth',
  'auth/callback',
  'complete-profile',
  'resources',
  'simulations',
  'forum',
  'notices',
  'placements',
  'profile',
  'admin',
];

for (const route of routes) {
  const distDir = path.join(rootDist, route);
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

  const cDistDir = path.join(clientDist, route);
  fs.mkdirSync(cDistDir, { recursive: true });
  fs.writeFileSync(path.join(cDistDir, 'index.html'), indexHtml);

  // Also write route.html for flat static routing
  if (!route.includes('/')) {
    fs.writeFileSync(path.join(rootDist, `${route}.html`), indexHtml);
    fs.writeFileSync(path.join(clientDist, `${route}.html`), indexHtml);
  }
}

console.log('✅ Generated static route entrypoints and 404.html in dist/ and client/dist/');
