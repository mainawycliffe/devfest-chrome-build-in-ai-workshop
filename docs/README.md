# Chrome AI APIs (On Device AI with Chrome) Codelab

This directory contains the Google Codelab for learning how to build Angular applications with Chrome's built-in AI APIs.

## 📁 Structure

```
docs/
├── index.html                        # Landing page with auto-redirect
├── chrome-ai-angular-workshop/       # Generated codelab
│   ├── index.html                   # Main codelab page
│   ├── codelab.json                 # Codelab metadata
│   └── img/                         # Image assets
```

## 🚀 Viewing Locally

### Option 1: Using claat serve

```bash
cd ..
claat serve
```

Open http://localhost:9090

### Option 2: Using Python

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

### Option 3: Using Node.js

```bash
npx http-server -p 8080
```

Open http://localhost:8080

## 🌐 GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or your default branch)
   - Folder: `/docs`
5. Click **Save**

### Step 2: Wait for Deployment

GitHub will automatically build and deploy your site. This usually takes 1-2 minutes.

### Step 3: Access Your Codelab

Your codelab will be available at:
```
https://<username>.github.io/<repository-name>/
```

For example:
```
https://mainawycliffe.github.io/screenshot-analyzer/
```

## 🔄 Updating the Codelab

If you make changes to the source markdown (`../codelab.md`), regenerate with:

```bash
cd ..
claat export -o docs codelab.md
```

Then commit and push the changes:

```bash
git add docs/
git commit -m "Update codelab content"
git push
```

GitHub Pages will automatically redeploy.

## 📝 Codelab Information

- **Title**: Chrome AI APIs (On Device AI with Chrome) Codelab
- **Duration**: ~101 minutes
- **Level**: Intermediate
- **Topics**: Chrome AI, Angular, Gemini Nano, On-Device AI
- **Prerequisites**: Chrome Canary/Dev 128+, Node.js 18+

## 🎯 What You'll Learn

- Chrome's built-in AI API
- Angular signals for reactive state
- Streaming responses with AsyncGenerators
- AI model downloads and progress tracking
- Building type-safe AI integrations

## 📚 Additional Resources

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Angular Documentation](https://angular.dev)
- [Source Repository](https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop)

## 🐛 Issues & Feedback

Found a bug or have suggestions? Please open an issue at:
https://github.com/mainawycliffe/devfest-chrome-build-in-ai-workshop/issues

---

**Made with ❤️ using Chrome's Built-in AI and Angular**
