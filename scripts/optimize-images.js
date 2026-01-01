/**
 * Image Optimizer for Artist Photos
 *
 * Optimiza imágenes para R2:
 * - Resize a 500x500px (cuadradas)
 * - Comprime a 85% quality
 * - Convierte a JPG (más compatible que WebP)
 *
 * REQUISITOS:
 * npm install sharp
 *
 * USO:
 * node optimize-images.js ./original.jpg ./optimized/peso-pluma.jpg
 * node optimize-images.js --folder ./originals ./optimized
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGET_SIZE = 500;
const QUALITY = 85;

/**
 * Optimiza una imagen
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Archivo no encontrado: ${inputPath}`);
      return false;
    }

    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🖼️  Procesando: ${path.basename(inputPath)}...`);

    const metadata = await sharp(inputPath).metadata();
    const originalSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: QUALITY })
      .toFile(outputPath);

    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`✅ Optimizado: ${path.basename(outputPath)}`);
    console.log(`   Original:   ${metadata.width}x${metadata.height} (${(originalSize / 1024).toFixed(2)} KB)`);
    console.log(`   Optimizado: ${TARGET_SIZE}x${TARGET_SIZE} (${(optimizedSize / 1024).toFixed(2)} KB)`);
    console.log(`   Ahorro:     ${savings}%\n`);

    return true;
  } catch (error) {
    console.error(`❌ Error procesando ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Optimiza todas las imágenes de una carpeta
 */
async function optimizeFolder(inputFolder, outputFolder) {
  if (!fs.existsSync(inputFolder)) {
    console.error(`❌ Carpeta no encontrada: ${inputFolder}`);
    return;
  }

  // Crear carpeta de salida
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const files = fs.readdirSync(inputFolder)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

  if (files.length === 0) {
    console.log('⚠️  No se encontraron imágenes en la carpeta');
    return;
  }

  console.log(`📁 Encontradas ${files.length} imágenes\n`);

  let optimized = 0;
  let failed = 0;

  for (const file of files) {
    const inputPath = path.join(inputFolder, file);
    const outputName = path.basename(file, path.extname(file)) + '.jpg';
    const outputPath = path.join(outputFolder, outputName);

    const success = await optimizeImage(inputPath, outputPath);
    if (success) optimized++;
    else failed++;
  }

  console.log(`✅ Completado: ${optimized} optimizados, ${failed} fallidos`);
}

/**
 * Muestra ayuda
 */
function showHelp() {
  console.log(`
🖼️  Image Optimizer - Black Sheep Tabs

Optimiza imágenes de artistas para R2:
  - Resize: 500x500px (cuadradas)
  - Calidad: 85% JPEG
  - Formato: JPG

USO:
  node optimize-images.js <input> <output>
  node optimize-images.js --folder <input-folder> <output-folder>
  node optimize-images.js --help

EJEMPLOS:
  # Optimizar una imagen
  node optimize-images.js ./original.jpg ./optimized/peso-pluma.jpg

  # Optimizar carpeta completa
  node optimize-images.js --folder ./originals ./optimized

REQUISITOS:
  npm install sharp
`);
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--folder')) {
    const folderIndex = args.indexOf('--folder');
    const inputFolder = args[folderIndex + 1];
    const outputFolder = args[folderIndex + 2];

    if (!inputFolder || !outputFolder) {
      console.error('❌ Especifica carpetas de entrada y salida');
      console.log('   Uso: node optimize-images.js --folder <input> <output>');
      return;
    }

    await optimizeFolder(inputFolder, outputFolder);
    return;
  }

  // Single file
  const [inputPath, outputPath] = args;
  if (!inputPath || !outputPath) {
    console.error('❌ Uso: node optimize-images.js <input> <output>');
    return;
  }

  await optimizeImage(inputPath, outputPath);
}

main();