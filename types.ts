export interface AnalysisResult {
  originalDescription: string;
  editions: EditionResult[];
}

export interface EditionResult {
  id: string;
  instructions: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}