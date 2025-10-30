import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ChromeAiService } from '../../services/chrome-ai.service';
import { StorageService } from '../../services/storage.service';
import { TextImprovementService } from '../../services/text-improvement.service';
import type {
  ImprovementType,
  TextSuggestion,
  SocialPlatform,
} from '../../models/text-improvement.models';
import { PLATFORMS, ENHANCEMENT_OPTIONS } from '../../models/text-improvement.models';

@Component({
  selector: 'app-root',
  imports: [FormsModule, KeyValuePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-improver.component.html',
  styleUrl: './text-improver.component.css',
})
export class TextImproverComponent implements OnInit, OnDestroy {
  private textService = inject(TextImprovementService);
  private chromeAi = inject(ChromeAiService);
  private sanitizer = inject(DomSanitizer);
  private storage = inject(StorageService);
  
  readonly Math = Math;
  private autoSaveTimeout: any;

  readonly originalText = signal<string>('');
  readonly suggestions = signal<TextSuggestion[]>([]);
  readonly hashtags = signal<string[]>([]);
  readonly error = signal<string>('');
  readonly showSuggestions = signal<boolean>(false);
  readonly selectedPlatform = signal<SocialPlatform>('twitter');

  readonly isChrome = signal<boolean>(false);
  readonly isAiAvailable = this.chromeAi.isAvailable;
  readonly availability = this.chromeAi.availability;
  readonly isDownloading = this.chromeAi.isDownloading;
  readonly downloadProgress = this.chromeAi.downloadProgress;

  readonly isProcessing = this.textService.isProcessing;
  readonly currentOperation = this.textService.currentOperation;

  readonly platforms = PLATFORMS;

  readonly characterCount = computed(() => this.originalText().length);
  readonly wordCount = computed(() => {
    const text = this.originalText().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  readonly characterLimit = computed(
    () => this.platforms[this.selectedPlatform()].charLimit
  );
  readonly isOverLimit = computed(
    () => this.characterCount() > this.characterLimit()
  );
  readonly remainingChars = computed(
    () => this.characterLimit() - this.characterCount()
  );

  async ngOnInit(): Promise<void> {
    this.detectBrowser();
    if (this.isChrome()) {
      await this.chromeAi.checkAvailability();
    }
    
    // Initialize storage
    await this.storage.initDB();
    
    // Load draft if exists
    const draft = this.storage.loadDraft();
    if (draft) {
      this.originalText.set(draft);
    }
  }

  private detectBrowser(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    // Check if Chrome (but not Edge which also contains 'chrome')
    const isChromeBrowser =
      userAgent.includes('chrome') &&
      !userAgent.includes('edg') &&
      !userAgent.includes('opr');
    this.isChrome.set(isChromeBrowser);
  }

  async downloadModel(): Promise<void> {
    try {
      await this.chromeAi.initializeSession();
      await this.chromeAi.checkAvailability();
    } catch (err) {
      console.error('Failed to download model:', err);
      this.error.set('Failed to download the model. Please try again.');
    }
  }

  readonly enhancementOptions = ENHANCEMENT_OPTIONS;

  onTextChange(): void {
    // Auto-save draft with debounce
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.storage.saveDraft(this.originalText());
    }, 1000);
  }

  async applyImprovement(type: ImprovementType): Promise<void> {
    this.error.set('');

    if (!this.originalText().trim()) {
      this.error.set('Please enter some text first');
      return;
    }

    try {
      const result = await this.textService.improveText(
        this.originalText(),
        type,
        this.selectedPlatform()
      );
      this.suggestions.set(result);
      this.showSuggestions.set(true);
    } catch (err) {
      const error = err as Error;
      this.error.set(error.message || 'Failed to improve text');
      console.error('Improvement failed:', error);
    }
  }

  selectSuggestion(id: string): void {
    // Only one suggestion can be selected at a time
    const updated = this.suggestions().map((s) => ({
      ...s,
      selected: s.id === id,
    }));
    this.suggestions.set(updated);
  }

  renderMarkdown(text: string): SafeHtml {
    const html = marked.parse(text, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  async generateHashtags(): Promise<void> {
    this.error.set('');

    if (!this.originalText().trim()) {
      this.error.set('Please enter some text first');
      return;
    }

    try {
      const tags = await this.textService.generateHashtags(
        this.originalText(),
        this.selectedPlatform()
      );
      this.hashtags.set(tags);
    } catch (err) {
      const error = err as Error;
      this.error.set(error.message || 'Failed to generate hashtags');
      console.error('Hashtag generation failed:', error);
    }
  }

  async saveToHistory(): Promise<void> {
    if (this.originalText().trim()) {
      await this.storage.saveText(
        this.originalText(),
        this.selectedPlatform()
      );
    }
  }

  useSelectedSuggestion(): void {
    const selected = this.suggestions().find((s) => s.selected);

    if (selected) {
      this.originalText.set(selected.text);
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
  }

  discardSuggestions(): void {
    this.suggestions.set([]);
    this.showSuggestions.set(false);
  }

  copySelectedSuggestion(): void {
    const selected = this.suggestions().find((s) => s.selected);

    if (selected) {
      this.copyToClipboard(selected.text);
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  copyHashtags(): void {
    const hashtagText = this.hashtags().join(' ');
    this.copyToClipboard(hashtagText);
  }

  appendHashtags(): void {
    if (this.hashtags().length === 0) {
      return;
    }

    const currentText = this.originalText();
    const hashtagText = this.hashtags().join(' ');
    const newText = currentText + (currentText ? '\n\n' : '') + hashtagText;
    this.originalText.set(newText);
  }

  selectPlatform(platform: SocialPlatform): void {
    this.selectedPlatform.set(platform);
  }

  selectPlatformFromKey(key: string): void {
    this.selectedPlatform.set(key as SocialPlatform);
  }

  clearAll(): void {
    this.originalText.set('');
    this.suggestions.set([]);
    this.hashtags.set([]);
    this.error.set('');
    this.showSuggestions.set(false);
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
  }
}
