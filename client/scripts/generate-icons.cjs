const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

// Обычная иконка: синий закруглённый квадрат с белой буквой S
const regularSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4361ee"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="white" stroke-width="24"/>
  <text x="256" y="326" font-family="Arial, sans-serif" font-size="220" font-weight="bold" fill="white" text-anchor="middle">S</text>
</svg>`;

// Maskable-иконка: фон без скруглений + уменьшенный символ,
// чтобы влезал в safe zone (80% от размера) на Android
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4361ee"/>
  <circle cx="256" cy="256" r="110" fill="none" stroke="white" stroke-width="20"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="white" text-anchor="middle">S</text>
</svg>`;

async function generate() {
  const sizes = [192, 512];

  for (const size of sizes) {
    await sharp(Buffer.from(regularSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));

    await sharp(Buffer.from(maskableSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}-maskable.png`));
  }

  // Маленькая иконка для favicon
  await sharp(Buffer.from(regularSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'icon-32x32.png'));

  console.log('✅ Иконки сгенерированы в client/public/icons/');
  console.log(fs.readdirSync(outDir));
}

generate().catch((err) => {
  console.error('❌ Ошибка генерации:', err);
  process.exit(1);
});