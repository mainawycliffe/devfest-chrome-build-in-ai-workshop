
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-analysis-display',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="analysis-container">
      @if (isAnalyzing()) {
      <div class="analyzing">
        <div class="spinner"></div>
        <p>Extracting text...</p>
      </div>
      } @else if (result() && !isAnalyzing()) {
      <div class="result">
        <div class="result-header">
          <h3>Extracted Text</h3>
          <button class="copy-btn" (click)="copyToClipboard()">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              ></path>
            </svg>
            Copy
          </button>
        </div>
        <div class="result-content">{{ result() }}</div>
      </div>
      } @else if (error()) {
      <div class="error">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error() }}</p>
      </div>
      }
    </div>
  `,
    styles: [
        `
      .analysis-container {
        width: 100%;
        max-width: 900px;
        margin: 2rem auto;
        animation: slideUp 0.6s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .analyzing {
        text-align: center;
        padding: 4rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      }

      .spinner {
        width: 60px;
        height: 60px;
        border: 5px solid rgba(102, 126, 234, 0.2);
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        margin: 0 auto 1.5rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .analyzing p {
        color: #4a5568;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .result {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2.5rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.5);
        animation: resultAppear 0.6s ease;
      }

      @keyframes resultAppear {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1.25rem;
        border-bottom: 2px solid rgba(102, 126, 234, 0.2);
      }

      .result-header h3 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .copy-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .copy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      .copy-btn:active {
        transform: translateY(0);
      }

      .copy-btn svg {
        stroke-width: 2.5;
      }

      .result-content {
        color: #2d3748;
        line-height: 1.9;
        white-space: pre-wrap;
        font-size: 1.0625rem;
        font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', monospace;
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        max-height: 600px;
        overflow-y: auto;
      }

      .result-content::-webkit-scrollbar {
        width: 8px;
      }

      .result-content::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }

      .result-content::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 4px;
      }

      .result-content::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }

      .error {
        background: #fff5f5;
        border: 1px solid #feb2b2;
        border-radius: 12px;
        padding: 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #c53030;
      }

      .error svg {
        flex-shrink: 0;
        stroke-width: 2;
      }

      .error p {
        margin: 0;
        font-size: 1rem;
      }
    `,
    ]
})
export class AnalysisDisplayComponent {
  readonly result = input<string>('');
  readonly isAnalyzing = input<boolean>(false);
  readonly error = input<string>('');

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.result());
      // Could add a toast notification here
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
