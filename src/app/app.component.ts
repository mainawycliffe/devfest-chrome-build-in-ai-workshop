import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalysisDisplayComponent } from './components/analysis-display/analysis-display.component';
import { ScreenshotUploadComponent } from './components/screenshot-upload/screenshot-upload.component';
import { ChromeAiService } from './services/chrome-ai.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScreenshotUploadComponent, AnalysisDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private chromeAi = inject(ChromeAiService);

  readonly isAiAvailable = this.chromeAi.isAvailable;
  readonly availability = this.chromeAi.availability;
  readonly isDownloading = this.chromeAi.isDownloading;
  readonly downloadProgress = this.chromeAi.downloadProgress;
  readonly analysisResult = signal<string>('');
  readonly isAnalyzing = signal<boolean>(false);
  readonly error = signal<string>('');

  async ngOnInit(): Promise<void> {
    await this.chromeAi.checkAvailability();
  }

  async downloadModel(): Promise<void> {
    try {
      await this.chromeAi.initializeSession();
      // Refresh availability after download
      await this.chromeAi.checkAvailability();
    } catch (err) {
      console.error('Failed to download model:', err);
      this.error.set('Failed to download the model. Please try again.');
    }
  }

  async onImageSelected(imageData: string): Promise<void> {
    this.error.set('');
    this.analysisResult.set('');
    this.isAnalyzing.set(true);

    console.log('🚀 Starting analysis...');

    try {
      let result = '';
      const stream = this.chromeAi.analyzeScreenshotStreaming(imageData);

      for await (const chunk of stream) {
        console.log('📝 Received chunk:', chunk);
        result += chunk;
        this.analysisResult.set(result);
      }

      console.log('✅ Analysis complete. Total length:', result.length);
      console.log('Final result:', result);

      if (!result || result.trim().length === 0) {
        console.warn('⚠️ Empty result received');
        this.error.set('No text was extracted from the image. The image might not contain readable text.');
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      
      // Parse error messages to provide better feedback
      let errorMessage = 'Failed to analyze screenshot. ';
      
      if (err?.message) {
        const msg = err.message.toLowerCase();
        
        if (msg.includes('too large') || msg.includes('input is too large')) {
          errorMessage = '⚠️ Image is too large for the AI model. Try cropping the image to focus on the text area, or use a smaller screenshot.';
        } else if (msg.includes('quota') || msg.includes('limit')) {
          errorMessage = '⚠️ Token limit exceeded. Try using a smaller or cropped image.';
        } else if (msg.includes('context') || msg.includes('length')) {
          errorMessage = '⚠️ Context length exceeded. The image has too much content. Try cropping to the relevant section.';
        } else if (msg.includes('token')) {
          errorMessage = '⚠️ Token limit reached. Please use a smaller image or crop it to show less content.';
        } else if (msg.includes('session') || msg.includes('destroyed')) {
          errorMessage = '⚠️ Session error. Please refresh the page and try again.';
        } else if (msg.includes('abort')) {
          errorMessage = 'Analysis was cancelled.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Please try again with a different image or refresh the page.';
      }
      
      this.error.set(errorMessage);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
