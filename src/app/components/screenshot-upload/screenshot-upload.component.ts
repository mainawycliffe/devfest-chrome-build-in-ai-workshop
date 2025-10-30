
import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';

@Component({
    selector: 'app-screenshot-upload',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="upload-container">
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        @if (previewUrl()) {
        <div class="preview">
          <img [src]="previewUrl()" alt="Screenshot preview" />
          <button class="clear-btn" (click)="clearImage($event)">✕</button>
          @if (isCompressing()) {
          <div class="compressing-badge">
            <span class="compress-spinner"></span>
            Optimizing image...
          </div>
          }
        </div>
        } @else {
        <div class="placeholder">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p class="upload-title">Upload Your Image</p>
          <p class="upload-description">Drag & drop, click to browse, or press <kbd>Cmd/Ctrl + V</kbd> to paste</p>
          <span class="hint">Supports: PNG, JPG, WebP • Max 10MB • Auto-optimized for AI</span>
        </div>
        }
      </div>

      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="onFileSelect($event)"
        style="display: none;"
      />
    </div>
  `,
    styles: [
        `
      .upload-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        animation: fadeIn 1s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .drop-zone {
        border: 3px dashed rgba(255, 255, 255, 0.4);
        border-radius: 20px;
        padding: 4rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        min-height: 350px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        position: relative;
        overflow: hidden;
      }

      .drop-zone::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .drop-zone:hover::before {
        opacity: 1;
      }

      .drop-zone:hover {
        border-color: rgba(102, 126, 234, 0.6);
        transform: translateY(-4px);
        box-shadow: 0 25px 70px rgba(102, 126, 234, 0.3);
      }

      .drop-zone.drag-over {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
        transform: scale(1.02);
        box-shadow: 0 30px 80px rgba(102, 126, 234, 0.4);
      }

      .drop-zone.drag-over::before {
        opacity: 1;
      }

      .placeholder {
        color: #4a5568;
        position: relative;
        z-index: 1;
      }

      .placeholder svg {
        margin: 0 auto 1.5rem;
        color: #667eea;
        stroke-width: 2.5;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .upload-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.75rem;
        color: #2d3748;
      }

      .upload-description {
        font-size: 1rem;
        font-weight: 400;
        margin: 0 0 1.5rem;
        color: #718096;
        line-height: 1.6;
      }

      kbd {
        background: #f7fafc;
        border: 1px solid #cbd5e0;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .hint {
        font-size: 0.875rem;
        color: #a0aec0;
        font-weight: 500;
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #f7fafc;
        border-radius: 20px;
        margin-top: 1rem;
      }

      .preview {
        position: relative;
        width: 100%;
        max-width: 500px;
      }

      .preview img {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .clear-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;
      }

      .clear-btn:hover {
        transform: scale(1.1);
        background: #dc2626;
      }

      .compressing-badge {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.95);
        backdrop-filter: blur(10px);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        animation: slideInUp 0.3s ease;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      .compress-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
    ]
})
export class ScreenshotUploadComponent {
  readonly imageSelected = output<string>();
  readonly previewUrl = signal<string | null>(null);
  readonly isDragOver = signal(false);
  readonly isCompressing = signal(false);

  constructor() {
    // Add global paste event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', this.onPaste.bind(this));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      this.previewUrl.set(result);
      
      // Compress image before sending to AI with adaptive compression
      this.isCompressing.set(true);
      try {
        const compressed = await this.adaptiveCompress(result);
        this.imageSelected.emit(compressed);
      } finally {
        this.isCompressing.set(false);
      }
    };
    reader.readAsDataURL(file);
  }

  private async adaptiveCompress(dataUrl: string): Promise<string> {
    // Target size: ~80KB for data URL (more conservative for Chrome AI)
    const targetSizeKB = 80;
    const currentSizeKB = dataUrl.length / 1024;

    console.log(`📊 Original size: ${currentSizeKB.toFixed(1)}KB`);

    // If already small enough, return as-is
    if (currentSizeKB <= targetSizeKB) {
      console.log('✅ Image already optimized');
      return dataUrl;
    }

    // Try progressive compression levels - more aggressive sizing
    const compressionLevels = [
      { maxWidth: 800, maxHeight: 800, quality: 0.6 },
      { maxWidth: 600, maxHeight: 600, quality: 0.55 },
      { maxWidth: 512, maxHeight: 512, quality: 0.5 },
      { maxWidth: 400, maxHeight: 400, quality: 0.45 },
      { maxWidth: 350, maxHeight: 350, quality: 0.4 },
    ];

    for (const level of compressionLevels) {
      const compressed = await this.compressImage(dataUrl, level.maxWidth, level.maxHeight, level.quality);
      const compressedSizeKB = compressed.length / 1024;

      console.log(`🔧 Trying ${level.maxWidth}x${level.maxHeight} @ ${(level.quality * 100).toFixed(0)}% quality: ${compressedSizeKB.toFixed(1)}KB`);

      if (compressedSizeKB <= targetSizeKB * 1.15) { // Allow 15% over target
        console.log(`✅ Compression successful: ${compressedSizeKB.toFixed(1)}KB`);
        return compressed;
      }
    }

    // If still too large, return the most compressed version
    const finalLevel = compressionLevels[compressionLevels.length - 1];
    const result = await this.compressImage(dataUrl, finalLevel.maxWidth, finalLevel.maxHeight, finalLevel.quality);
    console.log(`⚠️ Using maximum compression: ${(result.length / 1024).toFixed(1)}KB`);
    return result;
  }

  private async compressImage(dataUrl: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const originalWidth = width;
        const originalHeight = height;

        // Always resize if dimensions exceed max, maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        console.log(`  📐 Resizing: ${originalWidth}x${originalHeight} → ${width}x${height}`);
        

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Return original if canvas fails
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression
        const compressed = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressed);
      };
      
      img.onerror = () => {
        console.warn('Failed to load image for compression, using original');
        resolve(dataUrl);
      };
      
      img.src = dataUrl;
    });
  }

  clearImage(event: Event): void {
    event.stopPropagation();
    this.previewUrl.set(null);
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if clipboard contains an image
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          this.processFile(file);
        }
        break;
      }
    }
  }
}
