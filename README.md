<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/167h0xKVc7ZMCefrxQxGoHsjaJdB4Cy3P

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This project includes a GitHub Action to automatically deploy to GitHub Pages.

1. Go to your repository **Settings** -> **Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push your changes to the `main` branch.
4. The "Deploy to GitHub Pages" workflow will run automatically and deploy your site.

## Security & Gitignore

A `.gitignore` file is configured to ensure sensitive and unnecessary files are not committed to the repository.

- **Ignored files include:**
  - `node_modules/`: Dependency packages.
  - `dist/`: Production build artifacts.
  - `.env` & `*.local`: Environment variables (protects your API keys).
  - System logs and editor config files.

**Important:** Never commit your `.env` file containing real API keys. Use `.env.example` or GitHub Secrets for CI/CD if needed.

