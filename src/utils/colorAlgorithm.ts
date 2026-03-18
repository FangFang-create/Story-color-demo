import { oklch, formatCss, converter, Color } from 'culori';

export interface GradientResult {
  top: string;
  bottom: string;
  topOklch: { l: number; c: number; h: number };
  bottomOklch: { l: number; c: number; h: number };
  extracted: {
    l: number;
    c: number;
    h: number;
  };
}

const toOklch = converter('oklch');

export function extractDominantColor(canvas: HTMLCanvasElement): { r: number; g: number; b: number } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { r: 0, g: 0, b: 0 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const colorCounts: Record<string, { r: number; g: number; b: number; count: number }> = {};
  
  // mergingTolerance: 24
  const tolerance = 24;

  for (let i = 0; i < imageData.length; i += 40) { // Sample every 10th pixel for performance
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a < 128) continue; // Skip transparent

    // Quantize based on tolerance
    const qr = Math.round(r / tolerance) * tolerance;
    const qg = Math.round(g / tolerance) * tolerance;
    const qb = Math.round(b / tolerance) * tolerance;
    const key = `${qr},${qg},${qb}`;

    if (!colorCounts[key]) {
      colorCounts[key] = { r, g, b, count: 1 };
    } else {
      colorCounts[key].count++;
    }
  }

  let maxCount = 0;
  let dominant = { r: 0, g: 0, b: 0 };

  for (const key in colorCounts) {
    if (colorCounts[key].count > maxCount) {
      maxCount = colorCounts[key].count;
      dominant = colorCounts[key];
    }
  }

  return dominant;
}

export function extractTwoToneColors(canvas: HTMLCanvasElement): { top: { r: number; g: number; b: number }, bottom: { r: number; g: number; b: number } } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { top: { r: 0, g: 0, b: 0 }, bottom: { r: 0, g: 0, b: 0 } };

  const width = canvas.width;
  const height = canvas.height;
  const topHeight = Math.floor(height * 0.3);
  const bottomStart = Math.floor(height * 0.7);

  const getDominant = (startY: number, endY: number) => {
    const imageData = ctx.getImageData(0, startY, width, endY - startY).data;
    const colorCounts: Record<string, { r: number; g: number; b: number; count: number }> = {};
    const tolerance = 22; // mergingTolerance: 22

    for (let i = 0; i < imageData.length; i += 40) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      if (a < 128) continue;

      const qr = Math.round(r / tolerance) * tolerance;
      const qg = Math.round(g / tolerance) * tolerance;
      const qb = Math.round(b / tolerance) * tolerance;
      const key = `${qr},${qg},${qb}`;

      if (!colorCounts[key]) {
        colorCounts[key] = { r, g, b, count: 1 };
      } else {
        colorCounts[key].count++;
      }
    }

    let maxCount = 0;
    let dominant = { r: 0, g: 0, b: 0 };
    for (const key in colorCounts) {
      if (colorCounts[key].count > maxCount) {
        maxCount = colorCounts[key].count;
        dominant = colorCounts[key];
      }
    }
    return dominant;
  };

  return {
    top: getDominant(0, topHeight),
    bottom: getDominant(bottomStart, height)
  };
}

export function generateDualGradient(
  topRgb: { r: number; g: number; b: number }, 
  bottomRgb: { r: number; g: number; b: number }
): GradientResult {
  const topOklch = toOklch({ mode: 'rgb', r: topRgb.r / 255, g: topRgb.g / 255, b: topRgb.b / 255 });
  const bottomOklch = toOklch({ mode: 'rgb', r: bottomRgb.r / 255, g: bottomRgb.g / 255, b: bottomRgb.b / 255 });

  let L1 = (topOklch.l || 0) * 100;
  let C1 = topOklch.c || 0;
  let H1 = topOklch.h || 0;

  let L2 = (bottomOklch.l || 0) * 100;
  let C2 = bottomOklch.c || 0;
  let H2 = bottomOklch.h || 0;

  // --- 规避色差过大的新逻辑：Chroma Damping (色度衰减) ---
  // 不改变原始色相(Hue)，而是通过降低感官冲突最强的“鲜艳度”来解决冲突
  let hDiff = Math.abs(H1 - H2);
  if (hDiff > 180) hDiff = 360 - hDiff;
  
  // 如果色相差超过 60 度，开始线性衰减 Chroma
  // 色相差越大，颜色越往“灰/深”靠拢，从而在视觉上更和谐
  if (hDiff > 60) {
    const dampingFactor = Math.max(0.3, 1 - (hDiff - 60) / 120); // 最多衰减到 30% 的原始色度
    C1 *= dampingFactor;
    C2 *= dampingFactor;
  }

  // --- 亮度平滑 (Luminance Smoothing) ---
  // 避免上下亮度差过大导致的视觉割裂感
  const lDiff = Math.abs(L1 - L2);
  if (lDiff > 20) {
    const midL = (L1 + L2) / 2;
    L1 = L1 * 0.7 + midL * 0.3;
    L2 = L2 * 0.7 + midL * 0.3;
  }

  // 最终亮度钳制，确保作为背景的稳重感
  L1 = Math.min(Math.max(L1, 15), 80);
  L2 = Math.min(Math.max(L2, 15), 80);

  // Chroma 限制 (cLeft: 0.000, cRight: 0.400)
  C1 = Math.max(0, Math.min(C1, 0.15)); 
  C2 = Math.max(0, Math.min(C2, 0.15));

  const topColor: Color = { mode: 'oklch', l: L1 / 100, c: C1, h: H1 };
  const bottomColor: Color = { mode: 'oklch', l: L2 / 100, c: C2, h: H2 };

  return {
    top: formatCss(topColor) || '#000',
    bottom: formatCss(bottomColor) || '#000',
    topOklch: { l: L1, c: C1, h: H1 },
    bottomOklch: { l: L2, c: C2, h: H2 },
    extracted: { l: (L1 + L2) / 2, c: (C1 + C2) / 2, h: H1 }
  };
}

export function generateStoryGradient(r: number, g: number, b: number): GradientResult {
  const initialColor = toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
  
  let L = (initialColor.l || 0) * 100;
  let C = initialColor.c || 0;
  let H = initialColor.h || 0;

  // 3️⃣ Chroma 限制
  C = Math.min(C, 0.18);

  // 5️⃣ 渐变亮度差计算
  // delta = clamp(L * 0.12, 6, 12)
  const delta = Math.min(Math.max(L * 0.12, 6), 12);

  let L_light = L;
  let L_dark = L;

  // 6️⃣ 渐变颜色生成
  if (L >= 80) {
    // 亮色 - 降低最大亮度上限
    L_light = Math.min(L, 85);
    L_dark = L - delta;
  } else if (L > 25) {
    // 正常 - 降低上限，加深下限
    L_light = Math.min(L + delta * 0.8, 82);
    L_dark = Math.max(L - delta * 1.2, 15);
  } else {
    // 暗色 - 保持深邃
    L_light = L + delta;
    L_dark = Math.max(L - delta, 10);
  }

  // 7️⃣ 深色端 Chroma 衰减
  const C_dark = C * 0.9;

  const topColor: Color = {
    mode: 'oklch',
    l: L_light / 100,
    c: C,
    h: H
  };

  const bottomColor: Color = {
    mode: 'oklch',
    l: L_dark / 100,
    c: C_dark,
    h: H
  };

  return {
    top: formatCss(topColor) || '#000',
    bottom: formatCss(bottomColor) || '#000',
    topOklch: { l: L_light, c: C, h: H },
    bottomOklch: { l: L_dark, c: C_dark, h: H },
    extracted: { l: L, c: C, h: H }
  };
}

export function generateOriginalGradient(r: number, g: number, b: number): GradientResult {
  const initialColor = toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
  
  const L = (initialColor.l || 0) * 100;
  const C = initialColor.c || 0;
  const H = initialColor.h || 0;

  return {
    top: `rgba(${r}, ${g}, ${b}, 0.8)`,
    bottom: `rgba(${r}, ${g}, ${b}, 0.4)`,
    topOklch: { l: L, c: C, h: H },
    bottomOklch: { l: L, c: C, h: H },
    extracted: { l: L, c: C, h: H }
  };
}
