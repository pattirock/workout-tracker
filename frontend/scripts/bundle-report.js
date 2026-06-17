const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const maxBundleKb = 350;

if (!fs.existsSync(distDir)) {
  console.error('No se encontró frontend/dist. Ejecuta primero: npm run build:frontend');
  process.exit(1);
}

const files = fs.readdirSync(distDir).filter((file) => file.endsWith('.js'));

if (files.length === 0) {
  console.error('No se encontraron bundles JS en frontend/dist');
  process.exit(1);
}

let hasOversizedBundle = false;

for (const file of files) {
  const fullPath = path.join(distDir, file);
  const sizeBytes = fs.statSync(fullPath).size;
  const sizeKb = sizeBytes / 1024;

  console.log(`${file}: ${sizeKb.toFixed(2)} KB`);

  if (sizeKb > maxBundleKb) {
    hasOversizedBundle = true;
  }
}

if (hasOversizedBundle) {
  console.error(`Bundle supera el límite de ${maxBundleKb} KB.`);
  process.exit(1);
}

console.log(`Bundle dentro del límite (${maxBundleKb} KB).`);
