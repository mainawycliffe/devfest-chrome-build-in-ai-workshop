export type AIAvailability = 'readily' | 'available' | 'after-download' | 'downloadable' | 'downloading' | 'no';

export interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  systemPrompt?: string;
  initialPrompts?: AILanguageModelPrompt[];
  topK?: number;
  temperature?: number;
  monitor?: (monitor: AICreateMonitor) => void;
}

export interface AICreateMonitor {
  addEventListener(type: 'downloadprogress', listener: (e: DownloadProgressEvent) => void): void;
}

export interface DownloadProgressEvent {
  loaded: number; // Progress from 0 to 1
}

export interface AILanguageModelPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
  prefix?: boolean;
}

export interface AILanguageModel {
  prompt(input: string | AILanguageModelPrompt[]): Promise<string>;
  promptStreaming(input: string | AILanguageModelPrompt[]): ReadableStream<string>;
  countPromptTokens(input: string): Promise<number>;
  maxTokens: number;
  tokensSoFar: number;
  tokensLeft: number;
  clone(): Promise<AILanguageModel>;
  destroy(): void;
}

export interface AILanguageModelParams {
  defaultTopK: number;
  maxTopK: number;
  defaultTemperature: number;
  maxTemperature: number;
}

export interface LanguageModelAPI {
  availability(): Promise<AIAvailability>;
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
  params(): Promise<AILanguageModelParams>;
}

declare global {
  const LanguageModel: LanguageModelAPI;
}
