# 🚀 Chrome AI Service Codelab

A step-by-step guide to building an Angular service that leverages Chrome's built-in AI (Gemini Nano) for on-device text processing and OCR capabilities.

## 📋 What You'll Build

By the end of this codelab, you'll have created a fully functional Chrome AI service that can:
- Check AI availability in the browser
- Initialize AI sessions with custom system prompts
- Stream AI responses in real-time
- Process images for OCR (Optical Character Recognition)
- Improve text with grammar checking, polishing, and more

## 🎯 Learning Objectives

- Understanding Chrome's built-in AI API
- Working with Angular signals for reactive state management
- Implementing streaming responses with AsyncGenerators
- Handling AI model downloads and progress tracking
- Building type-safe AI integrations

---

## 🛠️ Prerequisites

### Required Software
- **Chrome Canary** or **Chrome Dev** version 128 or higher
- **Node.js** 18+ and npm
- **Git** for cloning the repository
- A code editor (VS Code recommended)

### Browser Setup (Critical!)

1. **Download Chrome Canary** (if not already installed):
   - Visit: https://www.google.com/chrome/canary/
   - Install for your operating system

2. **Enable Required Flags**:
   - Open Chrome Canary
   - Navigate to `chrome://flags`
   - Enable these flags:
     - `#prompt-api-for-gemini-nano`
     - `#optimization-guide-on-device-model`
   - Click "Relaunch" button

3. **Verify Setup**:
   - Open DevTools Console (F12)
   - Type: `typeof LanguageModel`
   - Should return: `"object"` (not `"undefined"`)

---

## 📦 Step 1: Clone and Setup the Project

### Option A: Using Firebase Studio Online Editor (Recommended)

1. **Fork the Repository**:
   - Visit: https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop
   - Click "Fork" button in the top right
   - Select your GitHub account

2. **Open in Firebase Studio**:
   - Go to: https://firebase.google.com/products/hosting/studio
   - Click "Connect repository"
   - Select your forked repository
   - Choose the `starter` branch

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```

### Option B: Local Development

1. **Clone the Repository**:
   ```bash
   git clone -b starter https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop.git
   cd devfest-chrome-build-in-ai-workshop
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Open in Browser**:
   - Navigate to: http://localhost:4200
   - Use Chrome Canary with flags enabled

---

## 📝 Step 2: Understanding the Project Structure

Before we start coding, let's explore the key files:

```
screenshot-analyzer/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   └── chrome-ai.service.ts      # ⚠️ We'll implement this
│   │   ├── types/
│   │   │   └── chrome-ai.types.ts        # TypeScript definitions
│   │   ├── components/
│   │   │   ├── text-improver/            # Text improvement UI
│   │   │   └── screenshot-upload/        # Image upload UI
│   │   └── pages/
│   │       └── screenshot-analyzer/      # Main page
│   └── solutions/
│       └── chrome-ai.service.ts          # ✅ Reference solution
```

---

## 🔧 Step 3: Create TypeScript Types

First, we need to define types for Chrome's AI API.

### 3.1 Open `src/app/types/chrome-ai.types.ts`

Create or verify this file contains:

```typescript path=/Users/mainawycliffe/projects/screenshot-analyzer/src/app/types/chrome-ai.types.ts start=1
export type AIAvailability = 
  | 'readily'        // Model is ready to use immediately
  | 'available'      // Model is available but needs initialization
  | 'after-download' // Model needs to be downloaded
  | 'downloadable'   // Model can be downloaded
  | 'downloading'    // Model is currently downloading
  | 'no';            // Model not available

export interface AILanguageModelMonitor {
  addEventListener(
    type: 'downloadprogress',
    callback: (e: { loaded: number; total: number }) => void
  ): void;
}

export interface AILanguageModelCreateOptions {
  systemPrompt?: string;
  signal?: AbortSignal;
  monitor?: (monitor: AILanguageModelMonitor) => void;
}

export interface AILanguageModel {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): ReadableStream;
  destroy(): void;
  maxTokens: number;
  tokensSoFar: number;
  tokensLeft: number;
}

// Global API
declare global {
  interface LanguageModelConstructor {
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
    availability(): Promise<AIAvailability>;
  }

  const LanguageModel: LanguageModelConstructor;
}

export {};
```

**Key Concepts**:
- `AIAvailability`: Different states the AI model can be in
- `AILanguageModel`: Interface for interacting with the AI
- `AILanguageModelCreateOptions`: Configuration for creating AI sessions
- Global `LanguageModel`: Chrome's built-in API

---

## 💡 Step 4: Implement the Chrome AI Service

Now let's build the service step by step.

### 4.1 Import Dependencies

Open `src/app/services/chrome-ai.service.ts` and update imports:

```typescript path=/Users/mainawycliffe/projects/screenshot-analyzer/src/app/services/chrome-ai.service.ts start=1
import { Injectable, signal } from '@angular/core';
import { AILanguageModel, AIAvailability } from '../types/chrome-ai.types';
```

### 4.2 Add Service Properties

Replace the placeholder signals with proper implementations:

```typescript path=/Users/mainawycliffe/projects/screenshot-analyzer/src/app/services/chrome-ai.service.ts start=8
@Injectable({
  providedIn: 'root'
})
export class ChromeAiService {
  private session = signal<AILanguageModel | null>(null);
  readonly isAvailable = signal<boolean>(false);
  readonly availability = signal<AIAvailability>('no');
  readonly downloadProgress = signal<number>(0);
  readonly isDownloading = signal<boolean>(false);
```

**Why Signals?**
- Reactive state management
- Automatic UI updates
- Better performance than observables for simple state

### 4.3 Implement `checkAvailability()`

This method checks if Chrome AI is available:

```typescript path=null start=null
async checkAvailability(): Promise<boolean> {
  // Check if the LanguageModel API exists globally
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
    // Check the availability status
    const status = await LanguageModel.availability();
    console.log('✅ Availability:', status);
    
    // Update signals
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
```

**What's Happening?**
1. Check if `LanguageModel` exists in the global scope
2. Call `LanguageModel.availability()` to check model status
3. Update reactive signals with the results
4. Return boolean for convenience

### 4.4 Implement `initializeSession()`

This creates an AI session with a custom system prompt:

```typescript path=null start=null
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
```

**Key Points**:
- **System Prompt**: Defines AI behavior and capabilities
- **Monitor Callback**: Tracks model download progress
- **Error Handling**: Gracefully handles initialization failures
- **First Run**: Model download (~1.5GB) happens automatically

### 4.5 Implement Streaming Methods

#### `analyzeScreenshotStreaming()`

This streams AI responses for image analysis:

```typescript path=null start=null
async *analyzeScreenshotStreaming(
  imageData: string, 
  customPrompt?: string
): AsyncGenerator<string> {
  const currentSession = this.session();
  
  if (!currentSession) {
    await this.initializeSession();
  }

  const prompt = customPrompt || 
    'Extract all text from this image. Output only the text, nothing else.';

  try {
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
    throw error;
  }
}
```

#### `analyzeText()`

For text improvement features:

```typescript path=null start=null
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
```

**Understanding AsyncGenerators**:
- `async *` creates an async generator function
- `yield` emits values one at a time
- Perfect for streaming responses
- UI updates progressively as text arrives

### 4.6 Implement Cleanup

```typescript path=null start=null
destroySession(): void {
  const currentSession = this.session();
  if (currentSession) {
    currentSession.destroy();
    this.session.set(null);
  }
}
```

---

## 🧪 Step 5: Test Your Implementation

### 5.1 Check Service Availability

1. Open the app in Chrome Canary: http://localhost:4200
2. Open DevTools Console (F12)
3. You should see availability logs

### 5.2 Test Screenshot Analysis

1. Click on the **Screenshot Analyzer** tab
2. Click **Upload Screenshot** or drag & drop an image
3. Watch the console for download progress (first time only)
4. See extracted text appear in real-time

### 5.3 Test Text Improvement

1. Click on the **Text Improver** tab
2. Enter some text (e.g., "i love angular its grate")
3. Click **Check Grammar**
4. Watch AI corrections stream in

### 5.4 Expected Console Output

```
✅ Availability: after-download
📥 Downloaded 25%
📥 Downloaded 50%
📥 Downloaded 75%
📥 Downloaded 100%
✅ Session initialized
Token info: { maxTokens: 4096, tokensSoFar: 150, tokensLeft: 3946 }
```

---

## 🐛 Troubleshooting

### Issue: "LanguageModel is not defined"

**Solution**:
1. Verify you're using Chrome Canary/Dev 128+
2. Check flags are enabled at `chrome://flags`
3. Restart Chrome completely
4. Clear browser cache if needed

### Issue: Model won't download

**Solution**:
1. Check internet connection
2. Ensure ~2GB free disk space
3. Try `chrome://components` → Check for "Optimization Guide On Device Model"
4. Click "Check for update"

### Issue: Stream errors or token limits

**Solution**:
1. Images too large - reduce image size before upload
2. Session reached token limit - call `destroySession()` and reinitialize
3. Check token usage in console logs

### Issue: No progress updates

**Solution**:
- Model might already be downloaded
- Check `chrome://components` for model status
- Try clearing model and re-downloading

---

## 🎓 Understanding Key Concepts

### How Chrome AI Works

1. **On-Device Processing**: 
   - Model runs locally (Gemini Nano)
   - No data sent to servers
   - Works offline after download

2. **Token Limits**:
   - Each session has a token budget
   - Tokens = words + punctuation + system prompt
   - Monitor with `tokensSoFar` and `tokensLeft`

3. **Streaming**:
   - Responses arrive incrementally
   - Better UX for long responses
   - Lower perceived latency

### Angular Signals vs Observables

**Signals (Used Here)**:
```typescript
const count = signal(0);
count.set(5);              // Update
const value = count();     // Read
```

**Observables (Alternative)**:
```typescript
const count$ = new BehaviorSubject(0);
count$.next(5);            // Update
count$.subscribe(v => {}); // Read
```

**Why Signals?**
- Simpler API for synchronous state
- Better performance
- Less boilerplate
- Native Angular feature (v16+)

---

## 🚀 Next Steps

### Extend the Service

1. **Add More Features**:
   - Sentiment analysis
   - Language translation
   - Content summarization

2. **Improve Error Handling**:
   - Retry logic for failed requests
   - Better error messages
   - Fallback strategies

3. **Optimize Performance**:
   - Image compression before sending
   - Session caching
   - Request debouncing

### Deploy Your App

1. **Build for Production**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   firebase init hosting
   firebase deploy
   ```

3. **Share Your Creation**:
   - Add to portfolio
   - Share on social media
   - Write a blog post

---

## 📚 Additional Resources

### Documentation
- [Chrome AI Origin Trial](https://developer.chrome.com/docs/ai/built-in)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)

### Example Use Cases
- **Content Creation**: Blog post drafting and editing
- **Accessibility**: Screen reader enhancements
- **Education**: Writing assistance for students
- **Business**: Email and document polishing

### Community
- [Chrome AI on GitHub](https://github.com/topics/chrome-ai)
- [Angular Discord](https://discord.gg/angular)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-ai)

---

## ✅ Checklist: Am I Done?

- [ ] Types are defined in `chrome-ai.types.ts`
- [ ] Service imports types correctly
- [ ] All signals are properly defined
- [ ] `checkAvailability()` works and logs status
- [ ] `initializeSession()` downloads model on first run
- [ ] Progress bar shows during download
- [ ] Screenshot analysis extracts text correctly
- [ ] Text streaming works in real-time
- [ ] Text improver features work (grammar, polish, etc.)
- [ ] No console errors (only warnings are OK)
- [ ] Session cleanup works with `destroySession()`

---

## 🎉 Congratulations!

You've successfully built a Chrome AI service! You now understand:

✅ How to integrate Chrome's built-in AI API  
✅ Angular signals for reactive state management  
✅ Streaming responses with AsyncGenerators  
✅ Type-safe AI interactions  
✅ Building privacy-focused, offline-capable AI apps  

**What's Next?** Take this foundation and build something amazing! 🚀

---

## 📝 Feedback

Found an issue or have suggestions? Please:
- Open an issue on GitHub
- Submit a pull request
- Share your improvements with the community

---

**Made with ❤️ using Chrome's Built-in AI and Angular**
