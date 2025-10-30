import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AnalysisDisplayComponent } from '../../components/analysis-display/analysis-display.component';
import { ScreenshotUploadComponent } from '../../components/screenshot-upload/screenshot-upload.component';
import { ChromeAiService } from '../../services/chrome-ai.service';

@Component({
  selector: 'app-screenshot-analyzer',
  imports: [ScreenshotUploadComponent, AnalysisDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screenshot-analyzer.component.html',
  styleUrl: './screenshot-analyzer.component.css',
})
export class ScreenshotAnalyzerComponent implements OnInit {
  private chromeAi = inject(ChromeAiService);

  // TODO: Workshop Step 5 - Wire up AI service signals
  // Uncomment these after implementing the service
  // readonly isAiAvailable = this.chromeAi.isAvailable;
  // readonly availability = this.chromeAi.availability;
  // readonly isDownloading = this.chromeAi.isDownloading;
  // readonly downloadProgress = this.chromeAi.downloadProgress;
  
  // Temporary placeholders for workshop
  readonly isAiAvailable = signal<boolean>(false);
  readonly availability = signal<'readily' | 'available' | 'after-download' | 'downloadable' | 'downloading' | 'no'>('no');
  readonly isDownloading = signal<boolean>(false);
  readonly downloadProgress = signal<number>(0);
  
  readonly analysisResult = signal<string>('');
  readonly isAnalyzing = signal<boolean>(false);
  readonly error = signal<string>('');

  async ngOnInit(): Promise<void> {
    // TODO: Workshop Step 5.1 - Check AI availability on component init
    // await this.chromeAi.checkAvailability();
  }

  async downloadModel(): Promise<void> {
    // TODO: Workshop Step 5.2 - Implement model download
    // Call chromeAi.initializeSession() and handle errors
    try {
      // await this.chromeAi.initializeSession();
      // await this.chromeAi.checkAvailability();
      console.warn('⚠️ downloadModel() not implemented yet');
    } catch (err) {
      console.error('Failed to download model:', err);
      this.error.set('Failed to download the model. Please try again.');
    }
  }

  async onImageSelected(imageData: string): Promise<void> {
    // TODO: Workshop Step 5.3 - Implement image analysis
    // Use chromeAi.analyzeScreenshotStreaming() to get streaming results
    this.error.set('');
    this.analysisResult.set('');
    this.isAnalyzing.set(true);

    try {
      // let result = '';
      // const stream = this.chromeAi.analyzeScreenshotStreaming(imageData);

      // for await (const chunk of stream) {
      //   result += chunk;
      //   this.analysisResult.set(result);
      // }

      // if (!result || result.trim().length === 0) {
      //   this.error.set('No text was extracted from the image.');
      // }
      
      console.warn('⚠️ onImageSelected() not fully implemented yet');
      this.error.set('AI analysis not implemented yet. Complete Workshop Steps 2-4 first.');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      
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
