/**
 * build-theme-css.cjs
 * Concatenate each non-default theme's CSS sub-files into a single
 * self-contained CSS file in public/css/themes/ for lazy-loading.
 * Run this before `vite build`.
 */
const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.resolve(__dirname, 'css', 'themes');
const OUTPUT_DIR = path.resolve(__dirname, 'public', 'css', 'themes');

// Only build non-default themes (komik is bundled statically)
const LAZY_THEMES = ['cyberpunk', 'sunset', 'professional'];

function resolveImports(cssContent, baseDir) {
  return cssContent.replace(/@import\s+url\(['"]?([^'")\s]+)['"]?\)\s*;/g, (match, importPath) => {
    const resolvedPath = path.resolve(baseDir, importPath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`  ⚠️ Could not resolve: ${importPath} from ${baseDir}`);
      return `/* MISSING: ${importPath} */`;
    }
    const importedContent = fs.readFileSync(resolvedPath, 'utf-8');
    // Recursively resolve nested imports
    return resolveImports(importedContent, path.dirname(resolvedPath));
  });
}

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const theme of LAZY_THEMES) {
  const barrelPath = path.join(THEMES_DIR, `${theme}.css`);
  if (!fs.existsSync(barrelPath)) {
    console.warn(`  ⚠️ Barrel file not found: ${barrelPath}`);
    continue;
  }

  const barrelContent = fs.readFileSync(barrelPath, 'utf-8');
  const resolved = resolveImports(barrelContent, THEMES_DIR);

  const outputPath = path.join(OUTPUT_DIR, `${theme}.css`);
  fs.writeFileSync(outputPath, resolved, 'utf-8');

  const sizeKB = (Buffer.byteLength(resolved, 'utf-8') / 1024).toFixed(1);
  console.log(`  ✅ ${theme}.css → ${sizeKB}KB`);
}

console.log('\nTheme CSS files built to public/css/themes/');
