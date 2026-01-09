
export interface EditOptions {
  additionalPrompt: string;
  imageCount: number;
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'generating' | 'success' | 'error';
  message: string;
}
