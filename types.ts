export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';
  message?: string;
  data?: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}

export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
}