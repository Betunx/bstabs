/**
 * R2 Image Upload Script
 *
 * Sube imágenes de artistas a Cloudflare R2 bucket
 *
 * REQUISITOS:
 * - npm install @aws-sdk/client-s3
 * - Variables de entorno: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID
 *
 * USO:
 * node r2-upload-images.js ./photos/peso-pluma.jpg peso-pluma
 * node r2-upload-images.js --folder ./photos  (sube todas las imágenes)
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configuración
const BUCKET_NAME = 'bstabs-artist-images';
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';

// Validar variables de entorno
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !ACCOUNT_ID) {
  console.error('❌ ERROR: Faltan variables de entorno');
  console.log('\nConfigura las siguientes variables:');
  console.log('  R2_ACCOUNT_ID        - Tu Cloudflare Account ID');
  console.log('  R2_ACCESS_KEY_ID     - R2 API Token Access Key ID');
  console.log('  R2_SECRET_ACCESS_KEY - R2 API Token Secret Access Key');
  console.log('\nPara obtener las credenciales:');
  console.log('  1. Ve a Cloudflare Dashboard → R2');
  console.log('  2. Click "Manage R2 API Tokens"');
  console.log('  3. Crea un nuevo API Token con permisos de lectura/escritura');
  process.exit(1);
}

// Cliente S3 (R2 es compatible con S3)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Sube una imagen al bucket R2
 */
async function uploadImage(filepath, artistSlug) {
  try {
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Archivo no encontrado: ${filepath}`);
      return false;
    }

    const fileContent = fs.readFileSync(filepath);
    const ext = path.extname(filepath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const key = `${artistSlug}${ext}`;

    console.log(`📤 Subiendo: ${key}...`);

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    }));

    console.log(`✅ Subido: ${key} (${(fileContent.length / 1024).toFixed(2)} KB)`);
    return true;
  } catch (error) {
    console.error(`❌ Error subiendo ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Sube todas las imágenes de una carpeta
 */
async function uploadFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Carpeta no encontrada: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

  if (files.length === 0) {
    console.log('⚠️  No se encontraron imágenes en la carpeta');
    return;
  }

  console.log(`📁 Encontradas ${files.length} imágenes\n`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const filepath = path.join(folderPath, file);
    const artistSlug = path.basename(file, path.extname(file));

    const success = await uploadImage(filepath, artistSlug);
    if (success) uploaded++;
    else failed++;

    // Rate limiting: esperar 100ms entre uploads
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Completado: ${uploaded} exitosos, ${failed} fallidos`);
}

/**
 * Lista todas las imágenes en el bucket
 */
async function listImages() {
  try {
    console.log('📋 Listando imágenes en el bucket...\n');

    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    }));

    if (!response.Contents || response.Contents.length === 0) {
      console.log('⚠️  El bucket está vacío');
      return;
    }

    console.log(`Total: ${response.Contents.length} imágenes\n`);

    response.Contents.forEach(item => {
      const size = (item.Size / 1024).toFixed(2);
      console.log(`  ${item.Key.padEnd(30)} ${size.padStart(8)} KB`);
    });

  } catch (error) {
    console.error('❌ Error listando imágenes:', error.message);
  }
}

/**
 * Muestra ayuda
 */
function showHelp() {
  console.log(`
📸 R2 Image Upload Script - Black Sheep Tabs

USO:
  node r2-upload-images.js <archivo> <slug>     Subir una imagen
  node r2-upload-images.js --folder <carpeta>   Subir carpeta completa
  node r2-upload-images.js --list               Listar imágenes en R2
  node r2-upload-images.js --help               Mostrar esta ayuda

EJEMPLOS:
  node r2-upload-images.js ./peso-pluma.jpg peso-pluma
  node r2-upload-images.js --folder ./artist-photos
  node r2-upload-images.js --list

REQUISITOS:
  npm install @aws-sdk/client-s3

VARIABLES DE ENTORNO:
  R2_ACCOUNT_ID        - Tu Cloudflare Account ID
  R2_ACCESS_KEY_ID     - R2 API Token Access Key ID
  R2_SECRET_ACCESS_KEY - R2 API Token Secret Access Key
`);
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--list')) {
    await listImages();
    return;
  }

  if (args.includes('--folder')) {
    const folderIndex = args.indexOf('--folder');
    const folderPath = args[folderIndex + 1];
    if (!folderPath) {
      console.error('❌ Especifica la ruta de la carpeta');
      return;
    }
    await uploadFolder(folderPath);
    return;
  }

  // Upload single file
  const [filepath, artistSlug] = args;
  if (!filepath || !artistSlug) {
    console.error('❌ Uso: node r2-upload-images.js <archivo> <slug>');
    console.log('   Ejemplo: node r2-upload-images.js ./peso-pluma.jpg peso-pluma');
    return;
  }

  await uploadImage(filepath, artistSlug);
}

main();