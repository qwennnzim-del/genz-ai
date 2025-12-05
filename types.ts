
export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
}

export type Language = 'id' | 'en' | 'jp';

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Hasil generate gambar dari Hugging Face
  attachment?: Attachment; // Untuk file yang diupload user (input User)
  isStreaming?: boolean;
  isSearching?: boolean; // Indikator visual sedang searching
  isGeneratingImage?: boolean; // Indikator sedang membuat gambar
  groundingMetadata?: any;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isNew?: boolean;
}

export enum GeminiModel {
  FLASH_2_5 = 'gemini-2.5-flash',
  FLASH_2_0 = 'gemini-2.0-flash',
  FLASH_LITE_2_0 = 'gemini-2.0-flash-lite-preview',
  IMAGE_GEN = 'sdxl-image-gen', // Model ID khusus frontend
}
