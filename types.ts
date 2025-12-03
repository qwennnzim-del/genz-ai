
export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Untuk menampilkan gambar hasil generate (output AI)
  attachment?: Attachment; // Untuk file yang diupload user (input User)
  isStreaming?: boolean;
  isGeneratingImage?: boolean;
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
  FLASH_IMAGE_2_5 = 'gemini-2.5-flash-image',
}
