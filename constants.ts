
import { GeminiModel, ModelOption } from './types';

export const MODELS: ModelOption[] = [
  {
    id: GeminiModel.FLASH_2_5,
    name: 'Genz 2.5 Pro',
    description: 'Penalaran Mendalam & Pencarian Real-time.',
    isNew: true,
  },
  {
    id: GeminiModel.FLASH_2_0,
    name: 'Genz 2.0 Flash',
    description: 'Kemampuan reasoning tingkat lanjut untuk tugas kompleks.',
  },
  {
    id: GeminiModel.FLASH_LITE_2_0,
    name: 'Genz 2.0 Lite',
    description: 'Versi paling ringan untuk kecepatan respons maksimal.',
  },
  {
    id: GeminiModel.IMAGE_GEN,
    name: 'Genz Art (SDXL)',
    description: 'Buat gambar artistik HD menggunakan Stable Diffusion XL.',
    isNew: true,
  },
];

export const SUGGESTIONS = [
  "Jelaskan teori relativitas",
  "Buatkan puisi senja",
  "Gambarkan suasana kota cyberpunk",
  "Tips produktivitas kerja"
];
