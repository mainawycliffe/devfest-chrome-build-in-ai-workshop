# 📸 Screenshot Analyzer

An Angular application that showcases Chrome's On-Device AI (Gemini Nano) using the Prompt API. Upload or drag-and-drop screenshots to get instant AI-powered analysis of UI/UX design, accessibility, and more—all processed locally on your device.

## ✨ Features

- **Drag & Drop Upload**: Easy screenshot upload with visual preview
- **Real-time Streaming Analysis**: See AI analysis results as they're generated
- **Privacy-First**: All processing happens on-device using Chrome's built-in AI
- **Modern Angular**: Built with Angular 17+ using standalone components, signals, and modern control flow
- **Beautiful UI**: Clean, responsive interface with smooth animations

## 🚀 Tech Stack

- **Angular 17+**: Standalone components, signals, modern control flow (`@if`, `@for`)
- **Chrome AI Prompt API**: Gemini Nano for on-device AI
- **TypeScript**: Fully typed for better developer experience
- **CSS3**: Modern styling with gradients and animations

## 📋 Prerequisites

To run this application, you need:

1. **Chrome Canary or Chrome Dev** (version 127+)
2. **Enable Chrome AI flags**:
   - Navigate to `chrome://flags`
   - Enable `Prompt API for Gemini Nano`
   - Enable `Enables optimization guide on device`
   - Restart Chrome

3. **Download Gemini Nano model**:
   - Open DevTools (F12)
   - Run: `await ai.languageModel.create()`
   - Wait for model download to complete

For detailed setup instructions, visit: https://developer.chrome.com/docs/ai/prompt-api

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to
http://localhost:4200
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── screenshot-upload/     # Image upload component
│   │   └── analysis-display/      # Results display component
│   ├── services/
│   │   └── chrome-ai.service.ts   # Chrome AI Prompt API wrapper
│   ├── types/
│   │   └── chrome-ai.types.ts     # TypeScript definitions
│   ├── app.component.ts           # Main app component
│   └── app.component.html         # Main template
└── styles.css                      # Global styles
```

## 🎯 How It Works

1. **Upload**: Drag and drop or click to upload a screenshot
2. **Process**: Image data is converted to base64 and sent to Gemini Nano
3. **Analyze**: AI analyzes the screenshot for:
   - UI/UX design quality
   - Accessibility issues
   - Design patterns and best practices
   - Text extraction
   - Improvement suggestions
4. **Stream**: Results are streamed in real-time as they're generated
5. **Copy**: Click to copy analysis to clipboard

## 🔒 Privacy

All analysis happens **100% on your device**. No data is sent to any server. The Gemini Nano model runs entirely in your browser.

## 🚧 Limitations

- **Browser Support**: Only works in Chrome Canary/Dev with flags enabled
- **Model Size**: Requires ~1.5GB download for Gemini Nano
- **Image Size**: Limited to 10MB per image
- **Processing Speed**: Depends on device capabilities

## 📚 Learn More

- [Chrome AI Prompt API Documentation](https://developer.chrome.com/docs/ai/prompt-api)
- [Angular Documentation](https://angular.dev)
- [Gemini Nano Overview](https://deepmind.google/technologies/gemini/nano/)

## 🤝 Contributing

This is a demo project showcasing Chrome's On-Device AI capabilities. Feel free to fork and experiment!

## 📄 License

MIT

## 🙏 Acknowledgments

- Chrome Team for the Prompt API
- Angular Team for the amazing framework
- Google DeepMind for Gemini Nano
