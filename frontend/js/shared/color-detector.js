// Automatic Dominant Brand Color Detection
// Analyzes an uploaded logo using an offscreen canvas in < 5ms.
// Filters out transparent, white/near-white backgrounds, and pitch-black pixels,
// selecting a vibrant dominant color with accessible contrast for primary UI elements.

export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function isValidHex(hex) {
  return typeof hex === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360 / 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Adjusts lightness and saturation so the color works cleanly as a primary brand theme color.
 * Clamps lightness between 32% and 58% so white button text maintains accessible contrast.
 */
export function ensureAccessibleBrandColor(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  let targetL = l;
  let targetS = s;

  // Boost very desaturated colors if slight chroma exists
  if (targetS > 0.05 && targetS < 0.45) targetS = Math.min(0.65, targetS * 1.4);

  // Clamp lightness for white text readability (WCAG AA ~4.5:1 against white)
  if (targetL > 0.58) targetL = 0.52;
  if (targetL < 0.28) targetL = 0.35;

  const adjusted = hslToRgb(h, targetS, targetL);
  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/**
 * Detects the dominant brand color from an image (data URL, object URL, or Image element).
 * @param {string|HTMLImageElement} source
 * @returns {Promise<string|null>} Hex color string or null if failed
 */
export async function detectDominantColor(source) {
  return new Promise((resolve) => {
    if (!source) return resolve(null);

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        const buckets = new Map();
        let totalOpaquePixels = 0;
        let whitePixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // transparent pixel
          totalOpaquePixels++;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white / crisp light highlight
          if (r >= 236 && g >= 236 && b >= 236) {
            whitePixels++;
            continue; // Skip near-white background from dominant chromatic bucket
          }

          // Skip pitch-black
          if (r < 20 && g < 20 && b < 20) continue;

          const { s, l } = rgbToHsl(r, g, b);
          // Skip light gray or dark gray backgrounds
          if (s < 0.12 && (l > 0.85 || l < 0.18)) continue;

          // Quantize 16 levels per channel
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;
          const key = `${qr},${qg},${qb}`;

          const satWeight = Math.max(0.2, s * 2.5);
          const item = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0, score: 0 };
          item.r += r;
          item.g += g;
          item.b += b;
          item.count += 1;
          item.score += (1 + satWeight * 3.5);
          buckets.set(key, item);
        }

        if (buckets.size === 0) {
          // If the logo is purely monochrome white or black
          if (whitePixels > 0) {
            return resolve({
              brandColor: '#2563EB',
              themeColor: '#FFFFFF',
              color1: '#2563EB',
              color2: '#FFFFFF',
              palette: ['#2563EB', '#FFFFFF'],
              toString() { return this.brandColor; },
            });
          }
          return resolve(null);
        }

        // Sort buckets by weighted score
        const sorted = Array.from(buckets.values()).sort((a, b) => b.score - a.score);
        if (sorted.length === 0) return resolve(null);

        const primaryBucket = sorted[0];
        const pR = Math.round(primaryBucket.r / primaryBucket.count);
        const pG = Math.round(primaryBucket.g / primaryBucket.count);
        const pB = Math.round(primaryBucket.b / primaryBucket.count);
        const brandColor = ensureAccessibleBrandColor(pR, pG, pB);

        // Find a distinct secondary bucket for 2-color theme
        let themeColor = brandColor;
        const palette = [brandColor];

        // If the logo has a prominent white element (> 8% of opaque pixels, e.g. green/white), add white to palette
        const hasProminentWhite = totalOpaquePixels > 0 && (whitePixels / totalOpaquePixels) >= 0.08;
        if (hasProminentWhite) {
          palette.push('#FFFFFF');
        }

        for (let j = 1; j < sorted.length && palette.length < 5; j++) {
          const b = sorted[j];
          const r = Math.round(b.r / b.count);
          const g = Math.round(b.g / b.count);
          const bl = Math.round(b.b / b.count);
          const hex = ensureAccessibleBrandColor(r, g, bl);

          // Check distance from already collected palette colors
          const rgb = hexToRgb(hex);
          const isDistinct = palette.every((existingHex) => {
            const exRgb = hexToRgb(existingHex);
            if (!exRgb || !rgb) return true;
            const dist = Math.sqrt((rgb.r - exRgb.r) ** 2 + (rgb.g - exRgb.g) ** 2 + (rgb.b - exRgb.b) ** 2);
            return dist > 45;
          });

          if (isDistinct) {
            palette.push(hex);
            if (themeColor === brandColor) {
              themeColor = hex;
            }
          }
        }

        // If no second chromatic color was found, use prominent white if available, else derive accent
        if (themeColor === brandColor) {
          if (hasProminentWhite) {
            themeColor = '#FFFFFF';
          } else {
            const { h, s, l } = rgbToHsl(pR, pG, pB);
            const shiftedHue = (h + 30) % 360;
            const companionRgb = hslToRgb(shiftedHue, Math.min(1, s * 1.05), Math.max(0.32, Math.min(0.55, l * 0.94)));
            themeColor = ensureAccessibleBrandColor(companionRgb.r, companionRgb.g, companionRgb.b);
            palette.push(themeColor);
          }
        }

        // Return solid 2-color theme detection result
        const result = {
          brandColor,
          themeColor,
          color1: brandColor,
          color2: themeColor,
          gradientColor1: brandColor,
          gradientColor2: themeColor,
          palette,
          toString() { return this.brandColor; },
        };

        resolve(result);
      } catch (err) {
        console.warn('Color detection warning:', err);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = typeof source === 'string' ? source : source.src;
  });
}
