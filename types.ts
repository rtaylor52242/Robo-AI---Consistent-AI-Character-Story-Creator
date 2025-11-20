export interface Character {
  id: string;
  name: string;
  file: File | null;
  previewUrl: string | null;
  isSelected: boolean;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  timestamp: Date;
  index: number; // For ordering 001, 002, etc.
}

export enum AspectRatio {
  RATIO_16_9 = '16:9',
  RATIO_9_16 = '9:16',
  RATIO_1_1 = '1:1',
  RATIO_4_3 = '4:3',
  CUSTOM = 'Custom'
}

export interface AppState {
  characters: Character[];
  aspectRatio: AspectRatio;
  customAspectRatio: string; // Stores manual input like "21:9"
  prompts: string[];
  results: GeneratedImage[];
  isGenerating: boolean;
  apiKeyChecked: boolean;
}

export const MAX_PROMPTS = 10;