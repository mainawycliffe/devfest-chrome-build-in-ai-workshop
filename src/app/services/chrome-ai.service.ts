import { Injectable, signal } from '@angular/core';
import { AILanguageModel, AIAvailability } from '../types/chrome-ai.types';

@Injectable({
  providedIn: 'root'
})
export class ChromeAiService {
  private session = signal<AILanguageModel | null>(null);
  readonly isAvailable = signal<boolean>(false);
  readonly availability = signal<AIAvailability>('no');
  readonly downloadProgress = signal<number>(0);
  readonly isDownloading = signal<boolean>(false);

  async checkAvailability(): Promise<boolean> {
    if (typeof LanguageModel === 'undefined') {
      console.warn('❌ Chrome AI not available. Make sure you have:');
      console.warn('1. Chrome Canary/Dev 128+');
      console.warn('2. Enabled chrome://flags/#prompt-api-for-gemini-nano');
      console.warn('3. Enabled chrome://flags/#optimization-guide-on-device-model');
      console.warn('4. Restarted Chrome');
      this.isAvailable.set(false);
      this.availability.set('no');
      return false;
    }

    try {
      const status = await LanguageModel.availability();
      console.log('✅ Availability:', status);
      this.availability.set(status);
      this.isAvailable.set(status !== 'no');
      return status !== 'no';
    } catch (error) {
      console.error('❌ Failed to check AI availability:', error);
      this.isAvailable.set(false);
      this.availability.set('no');
      return false;
    }
  }

  async initializeSession(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Chrome AI is not available');
    }

    try {
      this.isDownloading.set(true);
      this.downloadProgress.set(0);

      const aiSession = await LanguageModel.create({
        systemPrompt: `You are a professional OCR (Optical Character Recognition) system powered by AI. Your primary function is to accurately extract and transcribe ALL visible text from images.
        
        CORE RESPONSIBILITIES:
        - Extract ALL text content from images with maximum accuracy
        - Preserve original formatting, line breaks, and text structure
        - Maintain proper spacing and paragraph organization
        - Handle multiple languages and special characters
        - Recognize text in various fonts, sizes, and styles
        
        EXTRACTION RULES:
        1. Output ONLY the extracted text - no descriptions, analysis, or commentary
        2. Preserve the reading order (top-to-bottom, left-to-right)
        3. Maintain original capitalization and punctuation
        4. Use proper line breaks to reflect the image layout
        5. For tables, preserve row/column structure using spacing
        6. For unclear text, use [unclear: approximate_text] notation
        7. If no text is found, respond: "No text detected in image."
        
        QUALITY STANDARDS:
        - Accuracy is paramount - transcribe exactly what you see
        - Be thorough - don't skip small text or watermarks
        - Be precise - don't infer or correct spelling errors
        - Be structured - maintain logical text flow`,
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            const progress = e.loaded * 100;
            console.log(`📥 Downloaded ${progress.toFixed(0)}%`);
            this.downloadProgress.set(progress);
          });
        }
      });
      
      this.session.set(aiSession);
      this.isDownloading.set(false);
      this.downloadProgress.set(100);
      console.log('✅ Session initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI session:', error);
      this.isDownloading.set(false);
      throw error;
    }
  }

  async analyzeScreenshot(imageData: string, customPrompt?: string): Promise<string> {
    const currentSession = this.session();
    
    if (!currentSession) {
      await this.initializeSession();
    }

    const prompt = customPrompt || 
      'Extract all text from this image. Output only the text, nothing else.';

    try {
      const response = await this.session()!.prompt(`${prompt}\n\nImage data: ${imageData}`);
      return response;
    } catch (error) {
      console.error('Failed to analyze screenshot:', error);
      throw error;
    }
  }

  async *analyzeScreenshotStreaming(imageData: string, customPrompt?: string): AsyncGenerator<string> {
    const currentSession = this.session();
    
    if (!currentSession) {
      await this.initializeSession();
    }

    const prompt = customPrompt || 
      'Extract all text from this image. Output only the text, nothing else.';

    try {
      // Check token limits before processing
      const fullPrompt = `${prompt}\n\nImage data: ${imageData}`;
      const session = this.session()!;
      
      // Log token information for debugging
      console.log('Token info:', {
        maxTokens: session.maxTokens,
        tokensSoFar: session.tokensSoFar,
        tokensLeft: session.tokensLeft
      });
      
      const stream = session.promptStreaming(fullPrompt);
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } catch (error: any) {
      console.error('Failed to analyze screenshot:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    }
  }

  async *analyzeText(prompt: string): AsyncGenerator<string> {
    const currentSession = this.session();
    
    if (!currentSession) {
      await this.initializeSession();
    }

    try {
      const session = this.session()!;
      const stream = session.promptStreaming(prompt);
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } catch (error: any) {
      console.error('Failed to analyze text:', error);
      throw error;
    }
  }

  destroySession(): void {
    const currentSession = this.session();
    if (currentSession) {
      currentSession.destroy();
      this.session.set(null);
    }
  }
}
