summary: Chrome AI APIs (On Device AI with Chrome) Codelab
id: chrome-ai-angular-workshop
categories: Web,Angular,AI
tags: devfest,chrome-ai,angular,gemini-nano
status: Published
authors: Maina Wycliffe
Feedback Link: https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop

# Chrome AI APIs (On Device AI with Chrome) Codelab

## Overview
Duration: 2

### What You'll Build

By the end of this codelab, you'll have created a fully functional Chrome AI service that can:
- Check AI availability in the browser
- Initialize AI sessions with custom system prompts
- Stream AI responses in real-time
- Process images for OCR (Optical Character Recognition)
- Improve text with grammar checking, polishing, and more

### What You'll Learn

- Understanding Chrome's built-in AI API
- Working with Angular signals for reactive state management
- Implementing streaming responses with AsyncGenerators
- Handling AI model downloads and progress tracking
- Building type-safe AI integrations

### What You'll Need

- **Chrome Canary** or **Chrome Dev** version 128 or higher
- **Node.js** 18+ and npm
- **Git** for cloning the repository
- A code editor (VS Code recommended)

## Browser Setup
Duration: 5

Negative
: This step is **critical**! The workshop won't work without proper browser configuration.

### Download Chrome Canary

1. Visit: https://www.google.com/chrome/canary/
2. Install for your operating system

### Enable Required Flags

1. Open Chrome Canary
2. Navigate to `chrome://flags`
3. Enable these flags:
   - `#prompt-api-for-gemini-nano`
   - `#optimization-guide-on-device-model`
4. Click **Relaunch** button

### Verify Setup

1. Open DevTools Console (F12)
2. Type: `typeof LanguageModel`
3. Should return: `"object"` (not `"undefined"`)

Positive
: If you see `"object"`, you're ready to go! If not, double-check the flags and restart Chrome.

## Project Setup
Duration: 10

You can choose between using Firebase Studio's online editor or developing locally.

### Option A: Firebase Studio (Recommended)

#### Fork the Repository

1. Visit: https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop
2. Click **Fork** button in the top right
3. Select your GitHub account

#### Open in Firebase Studio

1. Go to: https://firebase.google.com/products/hosting/studio
2. Click **Connect repository**
3. Select your forked repository
4. Choose the `starter` branch

#### Install Dependencies

```bash
npm install
```

#### Start Development Server

```bash
npm start
```

### Option B: Local Development

#### Clone the Repository

```bash
git clone -b starter https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop.git
cd devfest-chrome-build-in-ai-workshop
```

#### Install Dependencies

```bash
npm install
```

#### Start Development Server

```bash
npm start
```

#### Open in Browser

Navigate to: http://localhost:4200 (use Chrome Canary with flags enabled)

## Understanding the Project
Duration: 3

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

Positive
: The `solutions/` folder contains a complete reference implementation you can refer to if you get stuck.

## Create TypeScript Types
Duration: 8

First, we need to define types for Chrome's AI API.

### Open the Types File

Open `src/app/types/chrome-ai.types.ts` and add the following:

### AI Availability Type

```typescript
/**
 * Represents the different states of the Chrome AI model availability.
 */
export type AIAvailability = 
  | 'readily'        // Model is ready to use immediately
  | 'available'      // Model is available but needs initialization
  | 'after-download' // Model needs to be downloaded before use
  | 'downloadable'   // Model can be downloaded from Chrome components
  | 'downloading'    // Model is currently being downloaded
  | 'no';            // Model is not available
```

### Monitor Interface

```typescript
/**
 * Interface for monitoring AI model download progress.
 */
export interface AILanguageModelMonitor {
  addEventListener(
    type: 'downloadprogress',
    callback: (e: { loaded: number; total: number }) => void
  ): void;
}
```

### Configuration Options

```typescript
/**
 * Configuration options for creating an AI language model session.
 */
export interface AILanguageModelCreateOptions {
  systemPrompt?: string;  // Defines the AI's behavior
  signal?: AbortSignal;   // Allows cancellation
  monitor?: (monitor: AILanguageModelMonitor) => void;  // Download progress
}
```

### Language Model Interface

```typescript
/**
 * Interface representing an active AI language model session.
 */
export interface AILanguageModel {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): ReadableStream;
  destroy(): void;
  maxTokens: number;
  tokensSoFar: number;
  tokensLeft: number;
}
```

### Global Declaration

```typescript
/**
 * Global Chrome AI API declaration.
 */
declare global {
  interface LanguageModelConstructor {
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
    availability(): Promise<AIAvailability>;
  }

  const LanguageModel: LanguageModelConstructor;
}

export {};
```

Positive
: These types provide full IntelliSense support and type safety for Chrome's AI API!

## Service: Imports and Properties
Duration: 5

Now let's build the Chrome AI service.

### Import Dependencies

Open `src/app/services/chrome-ai.service.ts` and add imports:

```typescript
import { Injectable, signal } from '@angular/core';
import { AILanguageModel, AIAvailability } from '../types/chrome-ai.types';
```

### Add Service Properties

Replace the placeholder signals:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChromeAiService {
  /**
   * Stores the active AI session
   */
  private session = signal<AILanguageModel | null>(null);
  
  /**
   * Simple boolean flag for AI availability
   */
  readonly isAvailable = signal<boolean>(false);
  
  /**
   * Detailed availability status
   */
  readonly availability = signal<AIAvailability>('no');
  
  /**
   * Download progress as percentage (0-100)
   */
  readonly downloadProgress = signal<number>(0);
  
  /**
   * Flag indicating if model is downloading
   */
  readonly isDownloading = signal<boolean>(false);
}
```

Negative
: Signals are Angular's reactive state management solution. They automatically update the UI when values change!

## Service: Check Availability
Duration: 10

Implement the method that checks if Chrome AI is available.

### Add checkAvailability Method

```typescript
/**
 * Checks if Chrome's built-in AI is available in the current browser.
 */
async checkAvailability(): Promise<boolean> {
  // Check if the LanguageModel API exists
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
    // Call the Chrome API to check status
    const status = await LanguageModel.availability();
    console.log('✅ Availability:', status);
    
    // Update reactive signals
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

### What's Happening?

1. Check if `LanguageModel` exists in the global scope
2. Call `LanguageModel.availability()` to check model status
3. Update reactive signals with the results
4. Return boolean for convenience

Positive
: The helpful console warnings guide developers if something isn't configured correctly!

## Service: Initialize Session
Duration: 15

This creates an AI session with a custom system prompt.

### Add initializeSession Method

```typescript
/**
 * Initializes a new AI session with a custom system prompt.
 * 
 * IMPORTANT: On first run, this will download ~1.5GB model (Gemini Nano).
 */
async initializeSession(): Promise<void> {
  // Guard clause - ensure AI is available
  if (!this.isAvailable()) {
    throw new Error('Chrome AI is not available');
  }

  try {
    // Set download flags for loading UI
    this.isDownloading.set(true);
    this.downloadProgress.set(0);

    // Create the AI session
    const aiSession = await LanguageModel.create({
      /**
       * System Prompt: Defines the AI's behavior
       */
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
      
      /**
       * Monitor callback: Tracks download progress
       */
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          const progress = e.loaded * 100;
          console.log(`📥 Downloaded ${progress.toFixed(0)}%`);
          this.downloadProgress.set(progress);
        });
      }
    });
    
    // Store the session
    this.session.set(aiSession);
    
    // Update flags
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

### Key Points

- **System Prompt**: Defines AI behavior (we're creating an OCR system)
- **Monitor Callback**: Tracks model download progress (~1.5GB)
- **First Run**: Model download happens automatically
- **Error Handling**: Gracefully handles initialization failures

Negative
: The first initialization will download ~1.5GB. Make sure you have a good internet connection and sufficient disk space!

## Service: Streaming Methods
Duration: 15

Implement methods that stream AI responses for better UX.

### Add analyzeScreenshotStreaming Method

```typescript
/**
 * Analyzes a screenshot using AI and streams the response.
 * This is an AsyncGenerator that yields text chunks as they arrive.
 */
async *analyzeScreenshotStreaming(
  imageData: string, 
  customPrompt?: string
): AsyncGenerator<string> {
  const currentSession = this.session();
  
  // Lazy initialization - create session if needed
  if (!currentSession) {
    await this.initializeSession();
  }

  // Use custom prompt or default to OCR
  const prompt = customPrompt || 
    'Extract all text from this image. Output only the text, nothing else.';

  try {
    const fullPrompt = `${prompt}\n\nImage data: ${imageData}`;
    const session = this.session()!;
    
    // Log token information
    console.log('Token info:', {
      maxTokens: session.maxTokens,
      tokensSoFar: session.tokensSoFar,
      tokensLeft: session.tokensLeft
    });
    
    // Call the AI with streaming enabled
    const stream = session.promptStreaming(fullPrompt);
    const reader = stream.getReader();
    
    // Read chunks and yield them
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

### Add analyzeText Method

```typescript
/**
 * Analyzes plain text using AI (no image processing).
 * Used for text improvement features.
 */
async *analyzeText(prompt: string): AsyncGenerator<string> {
  const currentSession = this.session();
  
  // Initialize if needed
  if (!currentSession) {
    await this.initializeSession();
  }

  try {
    const session = this.session()!;
    const stream = session.promptStreaming(prompt);
    const reader = stream.getReader();
    
    // Read and yield chunks
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

### Understanding AsyncGenerators

- `async *` creates an async generator function
- `yield` emits values one at a time
- Perfect for streaming responses
- UI updates progressively as text arrives

Positive
: Streaming provides a much better user experience than waiting for the entire response!

## Service: Cleanup
Duration: 3

Add a method to destroy sessions and free resources.

### Add destroySession Method

```typescript
/**
 * Destroys the current AI session and frees up resources.
 * 
 * Call this when:
 * - The session has used too many tokens
 * - You want to change the system prompt
 * - The app is being closed
 */
destroySession(): void {
  const currentSession = this.session();
  
  if (currentSession) {
    currentSession.destroy();
    this.session.set(null);
  }
}
```

Positive
: Proper cleanup is important for memory management, especially when dealing with large AI models!

## Test Your Implementation
Duration: 10

Now let's verify everything works correctly.

### Check Service Availability

1. Open the app in Chrome Canary: http://localhost:4200
2. Open DevTools Console (F12)
3. You should see availability logs

### Test Screenshot Analysis

1. Click on the **Screenshot Analyzer** tab
2. Click **Upload Screenshot** or drag & drop an image
3. Watch the console for download progress (first time only)
4. See extracted text appear in real-time

### Test Text Improvement

1. Click on the **Text Improver** tab
2. Enter some text (e.g., "i love angular its grate")
3. Click **Check Grammar**
4. Watch AI corrections stream in

### Expected Console Output

```
✅ Availability: after-download
📥 Downloaded 25%
📥 Downloaded 50%
📥 Downloaded 75%
📥 Downloaded 100%
✅ Session initialized
Token info: { maxTokens: 4096, tokensSoFar: 150, tokensLeft: 3946 }
```

Negative
: If you see errors, check the Troubleshooting section below.

## Troubleshooting
Duration: 5

Common issues and their solutions.

### "LanguageModel is not defined"

**Solution:**
1. Verify you're using Chrome Canary/Dev 128+
2. Check flags are enabled at `chrome://flags`
3. Restart Chrome completely
4. Clear browser cache if needed

### Model Won't Download

**Solution:**
1. Check internet connection
2. Ensure ~2GB free disk space
3. Try `chrome://components` → Check for "Optimization Guide On Device Model"
4. Click "Check for update"

### Stream Errors or Token Limits

**Solution:**
1. Images too large - reduce image size before upload
2. Session reached token limit - call `destroySession()` and reinitialize
3. Check token usage in console logs

### No Progress Updates

**Solution:**
- Model might already be downloaded
- Check `chrome://components` for model status
- Try clearing model and re-downloading

## Understanding Key Concepts
Duration: 5

Let's review the important concepts.

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

**Signals (Used Here):**
```typescript
const count = signal(0);
count.set(5);              // Update
const value = count();     // Read
```

**Observables (Alternative):**
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

## Next Steps
Duration: 3

Congratulations on completing the codelab! Here's what you can do next:

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

```bash
npm run build
firebase init hosting
firebase deploy
```

### Share Your Creation

- Add to portfolio
- Share on social media
- Write a blog post

## Additional Resources
Duration: 1

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

## Congratulations!
Duration: 1

You've successfully built a Chrome AI service! You now understand:

✅ How to integrate Chrome's built-in AI API  
✅ Angular signals for reactive state management  
✅ Streaming responses with AsyncGenerators  
✅ Type-safe AI interactions  
✅ Building privacy-focused, offline-capable AI apps  

**What's Next?** Take this foundation and build something amazing! 🚀

---

**Made with ❤️ using Chrome's Built-in AI and Angular**
