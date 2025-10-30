# 🎓 Chrome AI Workshop - Screenshot Analyzer

Welcome to the Chrome AI Workshop! In this hands-on workshop, you'll learn how to build an AI-powered screenshot analyzer using Chrome's built-in Gemini Nano model and the Prompt API.

## 📚 What You'll Learn

- How to use Chrome's **Prompt API** to access Gemini Nano
- Working with **streaming responses** for real-time AI output
- Managing **AI sessions** and model downloads
- Handling **image context** in AI prompts
- Building a modern Angular app with **signals** and **standalone components**

## 🎯 Workshop Goal

By the end of this workshop, you'll have a working screenshot analyzer that:
- Extracts text from uploaded images using on-device AI
- Displays results in real-time as they're generated
- Runs 100% on your device (no server required)
- Works offline after initial model download

## 🚀 Getting Started

### Prerequisites

1. **Chrome Canary or Chrome Dev** (version 128+)
   - Download: [Chrome Canary](https://www.google.com/chrome/canary/)

2. **Enable Chrome AI Flags**
   - Navigate to `chrome://flags` in your browser
   - Enable these two flags:
     - `#prompt-api-for-gemini-nano`
     - `#optimization-guide-on-device-model`
   - **Restart Chrome** after enabling

3. **Node.js** (version 18+)
   - Check: `node --version`

### Setup Instructions

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd screenshot-analyzer
   ```

2. **Checkout the starter branch**
   ```bash
   git checkout starter
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:4200`
   - The app will load but AI features won't work yet (that's what you'll build!)

## 📖 Workshop Steps

Follow the workshop guide (`workshop.md`) or the generated HTML codelab to complete these steps:

### Step 1: Introduction & Setup ✅
You're here! Environment is ready.

### Step 2: Define Chrome AI Types
- Create TypeScript interfaces for Chrome's Prompt API
- Learn about `AILanguageModel`, `AIAvailability`, and other types
- File: `src/app/types/chrome-ai.types.ts`

### Step 3: Implement Chrome AI Service
- Build the service to interact with Chrome AI
- Implement availability checking
- Create and manage AI sessions
- File: `src/app/services/chrome-ai.service.ts`

### Step 4: Add Streaming Support
- Implement real-time streaming responses
- Handle image data in prompts
- Process AI responses chunk by chunk

### Step 5: Connect Components
- Wire up the upload component to the AI service
- Display streaming results in the UI
- Handle loading states and errors

### Step 6: Test Your App
- Upload a screenshot
- Watch the AI extract text in real-time
- Try different images and prompts

### Step 7: Enhance & Experiment
- Customize system prompts
- Add new features
- Optimize for different use cases

## 🗂️ Project Structure

```
src/app/
├── components/
│   ├── screenshot-upload/      # Image upload UI (already complete)
│   └── analysis-display/       # Results display (already complete)
├── services/
│   └── chrome-ai.service.ts    # 🔨 You'll implement this
├── types/
│   └── chrome-ai.types.ts      # 🔨 You'll define these types
├── pages/
│   └── screenshot-analyzer/    # Main page component
└── app.component.ts            # Root component
```

## 📝 Workshop Tips

- **Read TODO comments carefully** - They guide you through each step
- **Check the console** - Helpful warnings show what's not implemented yet
- **Test frequently** - Run the app after completing each step
- **Compare with solution** - The `solution` branch has complete code
- **Ask questions** - Your instructor is here to help!

## 🆘 Getting Help

### Need to see the solution?

```bash
# View complete implementation
git checkout solution

# Compare your code with solution
git diff starter solution -- src/app/services/chrome-ai.service.ts
```

### Reference Files

The `solutions/` directory contains complete implementations:
- `solutions/chrome-ai.service.ts`
- `solutions/chrome-ai.types.ts`

### Common Issues

**"LanguageModel is not defined"**
- Make sure Chrome flags are enabled
- Restart Chrome after enabling flags
- Use Chrome Canary/Dev (version 128+)

**"Model download fails"**
- Check your internet connection (for initial download)
- Requires ~1.5GB of free space
- Download happens once per browser profile

**"TypeScript errors"**
- Make sure you've defined all types in `chrome-ai.types.ts`
- Import types into `chrome-ai.service.ts`

## 📚 Additional Resources

- [Chrome AI Prompt API Documentation](https://developer.chrome.com/docs/ai/prompt-api)
- [Gemini Nano Overview](https://deepmind.google/technologies/gemini/nano/)
- [Angular Signals Guide](https://angular.dev/guide/signals)

## 🎉 Next Steps

After completing the workshop:
- Explore other Chrome AI APIs (Summarization, Translation)
- Build your own AI-powered features
- Share your creations!

---

**Happy coding! 🚀**
