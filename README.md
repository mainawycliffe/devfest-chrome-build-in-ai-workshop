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
/**
 * Represents the different states of the Chrome AI model availability.
 * This type is used to determine if the model is ready, needs downloading, or unavailable.
 */
export type AIAvailability = 
  | 'readily'        // Model is ready to use immediately (already downloaded and initialized)
  | 'available'      // Model is available but needs initialization
  | 'after-download' // Model needs to be downloaded before use
  | 'downloadable'   // Model can be downloaded from Chrome components
  | 'downloading'    // Model is currently being downloaded
  | 'no';            // Model is not available (flags not enabled or unsupported browser)

/**
 * Interface for monitoring AI model download progress.
 * This allows us to track when the ~1.5GB Gemini Nano model is downloading.
 */
export interface AILanguageModelMonitor {
  addEventListener(
    type: 'downloadprogress',
    callback: (e: { loaded: number; total: number }) => void
  ): void;
}

/**
 * Configuration options for creating an AI language model session.
 * These options control how the AI behaves and allow progress monitoring.
 */
export interface AILanguageModelCreateOptions {
  systemPrompt?: string;  // Defines the AI's behavior, role, and constraints
  signal?: AbortSignal;   // Allows cancellation of the creation process
  monitor?: (monitor: AILanguageModelMonitor) => void;  // Callback for download progress
}

/**
 * Interface representing an active AI language model session.
 * This is what you get after calling LanguageModel.create().
 */
export interface AILanguageModel {
  // Send a prompt and get the complete response as a Promise
  prompt(input: string): Promise<string>;
  
  // Send a prompt and get a streaming response (better UX for long responses)
  promptStreaming(input: string): ReadableStream;
  
  // Clean up the session and free resources
  destroy(): void;
  
  // Maximum tokens this session can handle (typically 4096)
  maxTokens: number;
  
  // How many tokens have been used so far in this session
  tokensSoFar: number;
  
  // How many tokens remain available in this session
  tokensLeft: number;
}

/**
 * Global Chrome AI API declaration.
 * This makes TypeScript aware of the LanguageModel global object.
 */
declare global {
  interface LanguageModelConstructor {
    // Creates a new AI session with the specified options
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
    
    // Checks if the AI model is available in the current browser
    availability(): Promise<AIAvailability>;
  }

  // The global LanguageModel object provided by Chrome
  const LanguageModel: LanguageModelConstructor;
}

// This empty export makes this file a module
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
// Import Angular's dependency injection decorator
import { Injectable, signal } from '@angular/core';

// Import our custom types that define the Chrome AI API structure
import { AILanguageModel, AIAvailability } from '../types/chrome-ai.types';
```

### 4.2 Add Service Properties

Replace the placeholder signals with proper implementations:

```typescript path=/Users/mainawycliffe/projects/screenshot-analyzer/src/app/services/chrome-ai.service.ts start=8
@Injectable({
  providedIn: 'root'  // Makes this service a singleton available throughout the app
})
export class ChromeAiService {
  /**
   * Stores the active AI session. Private because external code shouldn't
   * manipulate the session directly - they should use the service methods.
   */
  private session = signal<AILanguageModel | null>(null);
  
  /**
   * Simple boolean flag indicating if Chrome AI is available.
   * Components can use this to show/hide AI features.
   */
  readonly isAvailable = signal<boolean>(false);
  
  /**
   * Detailed availability status with more granular information.
   * Useful for showing specific error messages to users.
   */
  readonly availability = signal<AIAvailability>('no');
  
  /**
   * Download progress as a percentage (0-100).
   * Used to show a progress bar during the initial model download.
   */
  readonly downloadProgress = signal<number>(0);
  
  /**
   * Flag indicating if the model is currently downloading.
   * Prevents duplicate download attempts and shows loading states.
   */
  readonly isDownloading = signal<boolean>(false);
```

**Why Signals?**
- Reactive state management
- Automatic UI updates
- Better performance than observables for simple state

### 4.3 Implement `checkAvailability()`

This method checks if Chrome AI is available:

```typescript path=null start=null
/**
 * Checks if Chrome's built-in AI is available in the current browser.
 * This should be called before attempting to use any AI features.
 * 
 * @returns Promise<boolean> - true if AI is available, false otherwise
 */
async checkAvailability(): Promise<boolean> {
  // Step 1: Check if the LanguageModel API exists in the global scope
  // If it doesn't exist, the flags aren't enabled or browser doesn't support it
  if (typeof LanguageModel === 'undefined') {
    // Provide helpful console warnings to guide developers
    console.warn('❌ Chrome AI not available. Make sure you have:');
    console.warn('1. Chrome Canary/Dev 128+');
    console.warn('2. Enabled chrome://flags/#prompt-api-for-gemini-nano');
    console.warn('3. Enabled chrome://flags/#optimization-guide-on-device-model');
    console.warn('4. Restarted Chrome');
    
    // Update our signals to reflect unavailability
    this.isAvailable.set(false);
    this.availability.set('no');
    return false;
  }

  try {
    // Step 2: Call the Chrome API to check detailed availability status
    // This will return one of: 'readily', 'available', 'after-download', etc.
    const status = await LanguageModel.availability();
    console.log('✅ Availability:', status);
    
    // Step 3: Update our reactive signals with the results
    // This will automatically update any UI components watching these signals
    this.availability.set(status);
    
    // Set isAvailable to true for any status except 'no'
    // Even 'after-download' means it's available, just needs downloading
    this.isAvailable.set(status !== 'no');
    
    // Return simple boolean for convenience
    return status !== 'no';
  } catch (error) {
    // Handle any errors (e.g., network issues, API changes)
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
/**
 * Initializes a new AI session with a custom system prompt.
 * This creates the AI "personality" and defines its behavior.
 * 
 * IMPORTANT: On first run, this will download ~1.5GB model (Gemini Nano).
 * Subsequent calls will use the cached model.
 * 
 * @throws Error if Chrome AI is not available
 */
async initializeSession(): Promise<void> {
  // Step 1: Guard clause - ensure AI is available before proceeding
  if (!this.isAvailable()) {
    throw new Error('Chrome AI is not available');
  }

  try {
    // Step 2: Set download flags to show loading UI
    this.isDownloading.set(true);
    this.downloadProgress.set(0);

    // Step 3: Create the AI session with configuration
    const aiSession = await LanguageModel.create({
      /**
       * System Prompt: This is like giving instructions to an employee.
       * It defines the AI's role, capabilities, and constraints.
       * 
       * For this workshop, we're creating an OCR (text extraction) system.
       * The prompt is detailed to ensure accurate, consistent results.
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
       * Monitor callback: Tracks download progress of the AI model.
       * This is crucial for UX - users need to know the ~1.5GB model is downloading.
       * 
       * The callback receives a monitor object that emits progress events.
       */
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          // Convert loaded/total ratio to percentage
          const progress = e.loaded * 100;
          console.log(`📥 Downloaded ${progress.toFixed(0)}%`);
          
          // Update our signal so UI can show a progress bar
          this.downloadProgress.set(progress);
        });
      }
    });
    
    // Step 4: Store the session in our signal for later use
    this.session.set(aiSession);
    
    // Step 5: Update flags to indicate download is complete
    this.isDownloading.set(false);
    this.downloadProgress.set(100);
    console.log('✅ Session initialized');
  } catch (error) {
    // Handle errors gracefully - could be network issues, storage issues, etc.
    console.error('❌ Failed to initialize AI session:', error);
    this.isDownloading.set(false);
    
    // Re-throw so calling code knows something went wrong
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
/**
 * Analyzes a screenshot using AI and streams the response back incrementally.
 * This provides better UX than waiting for the entire response.
 * 
 * This is an AsyncGenerator function (note the async *) which means:
 * - It can yield multiple values over time
 * - Calling code can process chunks as they arrive
 * - UI can update in real-time as text is extracted
 * 
 * @param imageData - Base64 encoded image string
 * @param customPrompt - Optional custom prompt (defaults to OCR extraction)
 * @yields string - Chunks of the AI response as they're generated
 */
async *analyzeScreenshotStreaming(
  imageData: string, 
  customPrompt?: string
): AsyncGenerator<string> {
  // Step 1: Get the current session (if it exists)
  const currentSession = this.session();
  
  // Step 2: Lazy initialization - create session if it doesn't exist
  // This is helpful because we only download the model when actually needed
  if (!currentSession) {
    await this.initializeSession();
  }

  // Step 3: Use custom prompt or default to OCR extraction
  const prompt = customPrompt || 
    'Extract all text from this image. Output only the text, nothing else.';

  try {
    // Step 4: Combine the prompt with the image data
    const fullPrompt = `${prompt}\n\nImage data: ${imageData}`;
    const session = this.session()!;  // Non-null assertion - we know session exists now
    
    // Step 5: Log token information for debugging and monitoring
    // Tokens are like "currency" - each session has a limited budget
    console.log('Token info:', {
      maxTokens: session.maxTokens,        // Total tokens available (usually 4096)
      tokensSoFar: session.tokensSoFar,    // How many we've used
      tokensLeft: session.tokensLeft       // How many remain
    });
    
    // Step 6: Call the AI with streaming enabled
    // This returns a ReadableStream that emits chunks of text
    const stream = session.promptStreaming(fullPrompt);
    
    // Step 7: Get a reader to consume the stream
    const reader = stream.getReader();
    
    // Step 8: Read chunks in a loop and yield them to the caller
    // This is the "streaming" part - we emit text as it arrives
    while (true) {
      const { done, value } = await reader.read();
      
      // If stream is complete, exit the loop
      if (done) break;
      
      // Yield the chunk to whoever is consuming this generator
      // In the UI, each yield will trigger an update
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
/**
 * Analyzes plain text using AI (no image processing).
 * Used for text improvement features: grammar check, polish, elaborate, etc.
 * 
 * This method is simpler than analyzeScreenshotStreaming because it doesn't
 * need to handle image data - just a text prompt.
 * 
 * @param prompt - The text prompt to send to the AI
 * @yields string - Chunks of the AI response as they're generated
 */
async *analyzeText(prompt: string): AsyncGenerator<string> {
  // Step 1: Check if we have an active session
  const currentSession = this.session();
  
  // Step 2: Initialize if needed (lazy loading pattern)
  if (!currentSession) {
    await this.initializeSession();
  }

  try {
    // Step 3: Get the session (we know it exists now)
    const session = this.session()!;
    
    // Step 4: Send the prompt and get a streaming response
    // The AI will start generating text immediately
    const stream = session.promptStreaming(prompt);
    
    // Step 5: Get a reader to consume the stream
    const reader = stream.getReader();
    
    // Step 6: Read and yield chunks as they arrive
    // This creates a smooth, real-time experience in the UI
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;  // Stream is complete
      yield value;      // Emit this chunk to the caller
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
/**
 * Destroys the current AI session and frees up resources.
 * 
 * Call this when:
 * - The session has used too many tokens (approaching limit)
 * - You want to change the system prompt (requires new session)
 * - The app is being closed/unmounted
 * - You want to free up memory
 * 
 * After calling this, the next AI operation will create a new session.
 */
destroySession(): void {
  // Step 1: Get the current session
  const currentSession = this.session();
  
  // Step 2: If session exists, clean it up
  if (currentSession) {
    // Call the destroy method to free resources
    // This is important for memory management
    currentSession.destroy();
    
    // Set our signal to null to indicate no active session
    this.session.set(null);
  }
  // If no session exists, do nothing (already clean)
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
