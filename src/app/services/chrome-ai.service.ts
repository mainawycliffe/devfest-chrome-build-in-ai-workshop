import { Injectable, signal } from '@angular/core';
// TODO: Workshop Step 2 - Import types after you create them
// import { AILanguageModel, AIAvailability } from '../types/chrome-ai.types';

@Injectable({
  providedIn: 'root'
})
export class ChromeAiService {
  // TODO: Workshop Step 3 - Add Service Properties
  // You will add signals to track AI session state here
  // Hint: You need signals for: session, isAvailable, availability, downloadProgress, isDownloading
  
  // Temporary placeholders until you implement them
  readonly isAvailable = signal<boolean>(false);
  readonly availability = signal<'readily' | 'available' | 'after-download' | 'downloadable' | 'downloading' | 'no'>('no');
  readonly isDownloading = signal<boolean>(false);
  readonly downloadProgress = signal<number>(0);

  // TODO: Workshop Step 3.1 - Implement checkAvailability()
  // This method checks if Chrome AI is available in the browser
  // Steps:
  // 1. Check if 'LanguageModel' exists globally
  // 2. Call LanguageModel.availability()
  // 3. Update signals based on the result
  // 4. Return boolean indicating if AI is available
  async checkAvailability(): Promise<boolean> {
    // Your code here
    console.warn('⚠️ checkAvailability() not implemented yet');
    return false;
  }

  // TODO: Workshop Step 3.2 - Implement initializeSession()
  // This method creates an AI session with a system prompt
  // Steps:
  // 1. Check if AI is available, throw error if not
  // 2. Set isDownloading signal to true
  // 3. Call LanguageModel.create() with systemPrompt and monitor
  // 4. Store the session in the signal
  // 5. Update download progress using the monitor callback
  async initializeSession(): Promise<void> {
    // Your code here
    console.warn('⚠️ initializeSession() not implemented yet');
    throw new Error('Not implemented');
  }

  // TODO: Workshop Step 4 - Implement analyzeScreenshotStreaming()
  // This method sends an image to the AI and streams back the response
  // Steps:
  // 1. Check if session exists, initialize if not
  // 2. Create a prompt with the image data
  // 3. Call session.promptStreaming() to get a ReadableStream
  // 4. Use a reader to read chunks and yield them
  // 5. Handle errors appropriately
  async *analyzeScreenshotStreaming(imageData: string, customPrompt?: string): AsyncGenerator<string> {
    // Your code here
    console.warn('⚠️ analyzeScreenshotStreaming() not implemented yet');
    yield 'Not implemented yet';
  }

  // TODO: Workshop Step 3.3 - Implement destroySession()
  // This method cleans up the AI session
  // Steps:
  // 1. Get the current session
  // 2. Call destroy() on it if it exists
  // 3. Set session signal to null
  destroySession(): void {
    // Your code here
    console.warn('⚠️ destroySession() not implemented yet');
  }

  // Additional method for text improvement feature (not part of workshop)
  async *analyzeText(prompt: string): AsyncGenerator<string> {
    console.warn('⚠️ analyzeText() not implemented yet');
    yield 'Not implemented yet';
  }
}
