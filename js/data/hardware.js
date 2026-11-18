// hardware.js — peças conhecidas e uma pontuação relativa de desempenho.
// Valores aproximados para comparação entre si (não são benchmarks oficiais).

export const GPUS = {
  'Intel UHD Graphics 620': 8, 'Intel Iris Xe Graphics': 15, 'AMD Radeon Vega 8': 13, 'AMD Radeon 780M': 30,
  'NVIDIA GeForce GT 1030': 14, 'NVIDIA GeForce GTX 750 Ti': 17, 'NVIDIA GeForce GTX 950': 24, 'NVIDIA GeForce GTX 960': 28,
  'NVIDIA GeForce GTX 970': 38, 'NVIDIA GeForce GTX 1050': 26, 'NVIDIA GeForce GTX 1050 Ti': 32, 'NVIDIA GeForce GTX 1060 3GB': 44,
  'NVIDIA GeForce GTX 1060 6GB': 46, 'NVIDIA GeForce GTX 1070': 60, 'NVIDIA GeForce GTX 1080': 72, 'NVIDIA GeForce GTX 1650': 37,
  'NVIDIA GeForce GTX 1660': 52, 'NVIDIA GeForce GTX 1660 Super': 58, 'NVIDIA GeForce RTX 2060': 72, 'NVIDIA GeForce RTX 2070': 85,
  'NVIDIA GeForce RTX 2070 Super': 93, 'NVIDIA GeForce RTX 2080': 100, 'NVIDIA GeForce RTX 3050': 62, 'NVIDIA GeForce RTX 3060': 90,
  'NVIDIA GeForce RTX 3060 Ti': 113, 'NVIDIA GeForce RTX 3070': 128, 'NVIDIA GeForce RTX 3080': 165, 'NVIDIA GeForce RTX 4060': 105,
  'NVIDIA GeForce RTX 4060 Ti': 125, 'NVIDIA GeForce RTX 4070': 160, 'NVIDIA GeForce RTX 4070 Super': 185, 'NVIDIA GeForce RTX 4080': 240,
  'NVIDIA GeForce RTX 4090': 310, 'NVIDIA GeForce RTX 5060': 120, 'NVIDIA GeForce RTX 5070': 190,
  'AMD Radeon R9 280': 27, 'AMD Radeon R9 290': 40, 'AMD Radeon RX 470': 42, 'AMD Radeon RX 480': 46, 'AMD Radeon RX 570': 44,
  'AMD Radeon RX 580': 48, 'AMD Radeon RX 5500 XT': 52, 'AMD Radeon RX 5600 XT': 72, 'AMD Radeon RX 5700 XT': 92,
  'AMD Radeon RX 6500 XT': 40, 'AMD Radeon RX 6600': 88, 'AMD Radeon RX 6700 XT': 120, 'AMD Radeon RX 6800 XT': 170,
  'AMD Radeon RX 7600': 100, 'AMD Radeon RX 7800 XT': 175, 'AMD Radeon RX 7900 XTX': 250
};

export const CPUS = {
  'Intel Core i3-2100': 10, 'Intel Core i5-2500K': 18, 'Intel Core i5-3570K': 20, 'Intel Core i3-4130': 16, 'Intel Core i5-4460': 24,
  'Intel Core i5-4590': 25, 'Intel Core i7-4770K': 32, 'Intel Core i5-6600K': 33, 'Intel Core i7-6700K': 40, 'Intel Core i3-8100': 34,
  'Intel Core i5-8400': 48, 'Intel Core i7-8700K': 60, 'Intel Core i5-9600K': 55, 'Intel Core i3-10100': 45, 'Intel Core i5-10400': 58,
  'Intel Core i7-10700K': 75, 'Intel Core i5-11400': 66, 'Intel Core i5-12400': 80, 'Intel Core i7-12700K': 105, 'Intel Core i5-13600K': 115,
  'Intel Core i5-14400F': 92, 'Intel Core i7-13700K': 135, 'Intel Core i9-13900K': 150, 'Intel Core Ultra 7 155H': 85,
  'AMD FX-6300': 14, 'AMD FX-8350': 20, 'AMD Ryzen 3 1200': 26, 'AMD Ryzen 5 1600': 38, 'AMD Ryzen 3 3100': 42, 'AMD Ryzen 5 2600': 44,
  'AMD Ryzen 7 2700X': 52, 'AMD Ryzen 5 3600': 58, 'AMD Ryzen 7 3700X': 70, 'AMD Ryzen 5 5500': 64, 'AMD Ryzen 5 5600X': 80,
  'AMD Ryzen 7 5800X': 92, 'AMD Ryzen 7 5800X3D': 98, 'AMD Ryzen 5 7600X': 100, 'AMD Ryzen 7 7800X3D': 125, 'AMD Ryzen 9 7950X': 160
};
