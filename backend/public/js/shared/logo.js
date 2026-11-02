// Global Logo Display & Background Handling Component
// Rules:
// 1. If a logo image has a transparent background:
//    - If the logo design/text is in white, the background defaults to black (#000000).
//    - Otherwise, the background defaults to solid white (#FFFFFF).
//    - If an explicit background color is chosen, it displays on that selected color.
// 2. If a logo already has a background color, display it as uploaded without adding another background.
// 3. Do not alter or overwrite the original uploaded image file.
// 4. Preserve aspect ratio, existing sizing, layout, spacing, borders, and responsive behavior.

import { esc } from './ui.js';

const analysisCache = new Map();

/**
 * Calculates perceived luminance of an RGB color (0 = black, 255 = white).
 */
export function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Analyzes an image to detect:
 * 1. Whether it has transparency (alpha < 240 in at least 4 pixels).
 * 2. Whether the visible artwork/text is predominantly white or very light.
 * 3. The recommended background color (#000000 for white artwork on transparent bg, #FFFFFF for colored/dark artwork on transparent bg, or 'transparent' for opaque images).
 *
 * @param {string|HTMLImageElement} source
 * @returns {Promise<{ hasTransparency: boolean, isWhiteArtwork: boolean, recommendedBg: string }>}
 */
export function analyzeLogo(source) {
  if (!source) {
    return Promise.resolve({ hasTransparency: false, isWhiteArtwork: false, recommendedBg: 'transparent' });
  }

  const srcStr = typeof source === 'string' ? source.trim() : (source.src || '').trim();
  if (!srcStr) {
    return Promise.resolve({ hasTransparency: false, isWhiteArtwork: false, recommendedBg: 'transparent' });
  }

  if (analysisCache.has(srcStr)) {
    const cached = analysisCache.get(srcStr);
    if (cached && typeof cached.then === 'function') return cached;
    return Promise.resolve(cached);
  }

  const lower = srcStr.toLowerCase();
  // Fast-path: JPEG files do not have an alpha channel
  if (lower.startsWith('data:image/jpeg') || lower.startsWith('data:image/jpg') || /\.jpe?g(\?.*)?$/i.test(lower)) {
    const result = { hasTransparency: false, isWhiteArtwork: false, recommendedBg: 'transparent' };
    analysisCache.set(srcStr, result);
    return Promise.resolve(result);
  }

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          const fallback = { hasTransparency: false, isWhiteArtwork: false, recommendedBg: 'transparent' };
          analysisCache.set(srcStr, fallback);
          return resolve(fallback);
        }

        // Sample up to 64x64 for maximum speed (<0.5ms) and accurate detection
        const w = Math.min(img.naturalWidth || 64, 64);
        const h = Math.min(img.naturalHeight || 64, 64);
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        let transparentCount = 0;
        let opaquePixels = 0;
        let whiteArtworkPixels = 0;
        let sumLuminance = 0;

        for (let i = 3; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 240) {
            transparentCount++;
            continue;
          }

          opaquePixels++;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = getLuminance(r, g, b);
          sumLuminance += lum;

          // Check if pixel is crisp white or near-white (with low saturation)
          if (r >= 210 && g >= 210 && b >= 210) {
            whiteArtworkPixels++;
          }
        }

        const hasTransparency = transparentCount > 4;
        let isWhiteArtwork = false;
        let recommendedBg = 'transparent';

        if (hasTransparency) {
          if (opaquePixels > 0) {
            const whiteRatio = whiteArtworkPixels / opaquePixels;
            const avgLum = sumLuminance / opaquePixels;
            // Artwork is white if > 50% of opaque pixels are near-white or average luminance is very high (>210)
            isWhiteArtwork = whiteRatio > 0.50 || avgLum > 210;
            // If the logo design/text is in white and without background, the bg should be black
            recommendedBg = isWhiteArtwork ? '#000000' : '#FFFFFF';
          } else {
            recommendedBg = '#FFFFFF';
          }
        } else {
          recommendedBg = 'transparent';
        }

        const result = { hasTransparency, isWhiteArtwork, recommendedBg };
        analysisCache.set(srcStr, result);
        resolve(result);
      } catch (err) {
        // Fallback: If SVG, default to transparent with white background
        const isSvg = lower.includes('.svg') || lower.startsWith('data:image/svg');
        const fallback = {
          hasTransparency: isSvg,
          isWhiteArtwork: false,
          recommendedBg: isSvg ? '#FFFFFF' : 'transparent',
        };
        analysisCache.set(srcStr, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      const fallback = { hasTransparency: false, isWhiteArtwork: false, recommendedBg: 'transparent' };
      analysisCache.set(srcStr, fallback);
      resolve(fallback);
    };

    img.src = srcStr;
  });

  analysisCache.set(srcStr, promise);
  return promise;
}

/**
 * Fast boolean check if image has transparency.
 */
export async function detectLogoTransparency(source) {
  const analysis = await analyzeLogo(source);
  return analysis.hasTransparency;
}

/**
 * Checks transparency with in-memory caching.
 */
export async function isTransparent(src) {
  const analysis = await analyzeLogo(src);
  return analysis.hasTransparency;
}

/**
 * Returns cached analysis if already evaluated, else null.
 */
export function getCachedAnalysis(src) {
  if (!src) return null;
  const key = typeof src === 'string' ? src.trim() : (src.src || '').trim();
  const val = analysisCache.get(key);
  if (val && typeof val.then !== 'function') return val;
  return null;
}

export function getCachedTransparency(src) {
  const cached = getCachedAnalysis(src);
  return cached ? cached.hasTransparency : null;
}

/**
 * Resolves the effective background color for a logo:
 * - If user explicitly selected a background color, uses that.
 * - Else if logo has transparent bg and white artwork, defaults to #000000.
 * - Else if logo has transparent bg and non-white artwork, defaults to #FFFFFF.
 * - Else (opaque logo with existing bg), defaults to 'transparent'.
 *
 * @param {string} src
 * @param {string} [explicitBg]
 * @returns {Promise<string>}
 */
export async function resolveLogoBg(src, explicitBg) {
  const analysis = await analyzeLogo(src);
  // If the logo already has a background color / opaque, keep it as it is
  if (!analysis.hasTransparency) {
    return 'transparent';
  }
  if (explicitBg && explicitBg !== 'auto') {
    return explicitBg;
  }
  return analysis.recommendedBg;
}

/**
 * Applies the logo background rule directly to any element (wrapper container or img element).
 *
 * @param {HTMLElement} target
 * @param {string} [src]
 * @param {string} [explicitBg] Optional user-selected background color
 */
export async function applyLogoBackground(target, src, explicitBg) {
  if (!target) return;
  const imgEl = target.tagName === 'IMG' ? target : target.querySelector('img');
  const actualSrc = src || (imgEl ? imgEl.src : null) || target.dataset?.logoSrc;

  if (!actualSrc) {
    target.classList.remove('logo-bg-white', 'logo-bg-black', 'logo-bg-dark', 'logo-bg-custom', 'logo-bg-as-uploaded');
    target.style.removeProperty('background');
    target.style.removeProperty('background-color');
    if (imgEl && imgEl !== target) {
      imgEl.classList.remove('logo-bg-white', 'logo-bg-black', 'logo-bg-dark', 'logo-bg-custom', 'logo-bg-as-uploaded');
      imgEl.style.removeProperty('background');
      imgEl.style.removeProperty('background-color');
    }
    return;
  }

  // Read explicit background from parameter, dataset, or branding state
  const chosenBg = explicitBg || target.dataset?.logoBg || (window.__BRANDING__?.logoBg) || null;
  const effectiveBg = await resolveLogoBg(actualSrc, chosenBg);

  const isTransparentBg = effectiveBg === 'transparent';
  const isBlackBg = effectiveBg === '#000000' || effectiveBg.toLowerCase() === 'black';
  const isWhiteBg = effectiveBg === '#FFFFFF' || effectiveBg.toLowerCase() === 'white';

  // Clean all previous state classes
  target.classList.remove('logo-bg-white', 'logo-bg-black', 'logo-bg-dark', 'logo-bg-custom', 'logo-bg-as-uploaded');
  if (imgEl && imgEl !== target) {
    imgEl.classList.remove('logo-bg-white', 'logo-bg-black', 'logo-bg-dark', 'logo-bg-custom', 'logo-bg-as-uploaded');
  }

  if (isTransparentBg) {
    target.classList.add('logo-bg-as-uploaded');
    target.style.setProperty('background', 'transparent', 'important');
    target.style.setProperty('background-color', 'transparent', 'important');
    if (imgEl && imgEl !== target) {
      imgEl.classList.add('logo-bg-as-uploaded');
      imgEl.style.setProperty('background', 'transparent', 'important');
      imgEl.style.setProperty('background-color', 'transparent', 'important');
    }
  } else if (isBlackBg) {
    target.classList.add('logo-bg-dark', 'logo-bg-black');
    target.style.setProperty('background', '#000000', 'important');
    target.style.setProperty('background-color', '#000000', 'important');
    if (imgEl && imgEl !== target) {
      imgEl.classList.add('logo-bg-dark', 'logo-bg-black');
      imgEl.style.setProperty('background', '#000000', 'important');
      imgEl.style.setProperty('background-color', '#000000', 'important');
    }
  } else if (isWhiteBg) {
    target.classList.add('logo-bg-white');
    target.style.setProperty('background', '#FFFFFF', 'important');
    target.style.setProperty('background-color', '#FFFFFF', 'important');
    if (imgEl && imgEl !== target) {
      imgEl.classList.add('logo-bg-white');
      imgEl.style.setProperty('background', '#FFFFFF', 'important');
      imgEl.style.setProperty('background-color', '#FFFFFF', 'important');
    }
  } else {
    // Custom color (e.g. brand color or hex choice)
    target.classList.add('logo-bg-custom');
    target.style.setProperty('background', effectiveBg, 'important');
    target.style.setProperty('background-color', effectiveBg, 'important');
    if (imgEl && imgEl !== target) {
      imgEl.classList.add('logo-bg-custom');
      imgEl.style.setProperty('background', effectiveBg, 'important');
      imgEl.style.setProperty('background-color', effectiveBg, 'important');
    }
  }
}

/**
 * Reusable Logo Component HTML Generator.
 *
 * @param {string} src
 * @param {object} options
 */
export function renderLogo(src, options = {}) {
  if (!src) return '';
  const {
    alt = 'Logo',
    className = '',
    boxClass = '',
    width = '',
    height = '',
    style = '',
    bg = null,
  } = options;

  const wAttr = width ? `width="${width}"` : '';
  const hAttr = height ? `height="${height}"` : '';
  const styleAttr = style ? `style="${style}"` : '';
  const bgAttr = bg ? `data-logo-bg="${esc(bg)}"` : '';

  const cached = getCachedAnalysis(src);
  let bgClass = '';
  if (cached) {
    const effective = bg || cached.recommendedBg;
    if (effective === 'transparent') bgClass = 'logo-bg-as-uploaded';
    else if (effective === '#000000' || effective === 'black') bgClass = 'logo-bg-dark logo-bg-black';
    else if (effective === '#FFFFFF' || effective === 'white') bgClass = 'logo-bg-white';
    else bgClass = 'logo-bg-custom';
  }

  if (boxClass) {
    return `<div class="crm-logo-box ${boxClass} ${bgClass}" data-crm-logo="true" data-logo-src="${esc(src)}" ${bgAttr} ${styleAttr}>
      <img src="${esc(src)}" alt="${esc(alt)}" class="crm-logo-img ${className}" ${wAttr} ${hAttr} loading="lazy" decoding="async">
    </div>`;
  }

  return `<img src="${esc(src)}" alt="${esc(alt)}" class="crm-logo-img ${className} ${bgClass}" data-crm-logo="true" data-logo-src="${esc(src)}" ${bgAttr} ${wAttr} ${hAttr} ${styleAttr} loading="lazy" decoding="async">`;
}

/**
 * Enhances all logos inside a DOM subtree.
 */
export function enhanceAllLogos(root = document, explicitBg = null) {
  if (!root || !root.querySelectorAll) return;

  const selectors = [
    '.brand-icon-box.has-custom-logo',
    '.st-brand-logo-thumb-box',
    '[data-crm-logo]',
    '.crm-logo-box',
    '.crm-logo-img',
    '.brand-logo-img',
    '.st-brand-logo-thumb',
  ];

  const elements = root.querySelectorAll(selectors.join(','));
  elements.forEach((el) => {
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    const src = el.dataset?.logoSrc || (img ? img.getAttribute('src') || img.src : null);
    const elBg = explicitBg || el.dataset?.logoBg;
    if (src) {
      applyLogoBackground(el, src, elBg);
    }
  });
}

/**
 * Global auto-enhancement observer: guarantees any logo rendered anywhere
 * conforms to background rules and user-selected background color.
 */
export function initLogoObserver() {
  if (typeof window === 'undefined') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhanceAllLogos());
  } else {
    enhanceAllLogos();
  }

  if (typeof MutationObserver !== 'undefined' && document.body) {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          enhanceAllLogos(document);
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('branding-changed', (e) => {
    if (e.detail?.logo) {
      enhanceAllLogos(document, e.detail.logoBg);
    }
  });

  window.addEventListener('layout-changed', () => {
    enhanceAllLogos();
  });
}

// Global registry for direct component access
if (typeof window !== 'undefined') {
  window.__CRM_LOGO__ = {
    analyzeLogo,
    detectLogoTransparency,
    isTransparent,
    resolveLogoBg,
    applyLogoBackground,
    renderLogo,
    enhanceAllLogos,
  };
}
