// detect.js — o que o navegador revela sobre o computador (estimativa).
import { encontrarGpu } from './logic.js';

export function detectar() {
  let textoGpu = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      textoGpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    }
  } catch { /* navegador sem WebGL */ }
  return {
    textoGpu: String(textoGpu || ''),
    gpu: encontrarGpu(textoGpu),
    nucleos: navigator.hardwareConcurrency || null,
    ramAprox: navigator.deviceMemory || null // o navegador limita a 8 GB
  };
}
