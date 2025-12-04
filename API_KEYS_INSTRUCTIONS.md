# API Keys Instructions

To fully enable the advanced features of your AI Tutor (ElevenLabs Voice and GitHub Integration), you need to obtain the following API keys and add them to your `backend/.env` file.

## 1. ElevenLabs API Key (for High-Quality Voice)
- **Purpose**: Enables the realistic "Jarvis" voice instead of the robotic browser voice.
- **How to get it**:
  1. Go to [ElevenLabs.io](https://elevenlabs.io/).
  2. Sign up for an account (Free tier offers 10,000 characters/month).
  3. Click on your profile icon -> "Profile + API Key".
  4. Click the "Eye" icon to reveal your API Key.
  5. Copy the key.

## 2. GitHub Personal Access Token (for Repository Integration)
- **Purpose**: Allows the AI Tutor to list your repositories and save code to them.
- **How to get it**:
  1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
  2. Click "Generate new token" -> "Generate new token (classic)".
  3. Give it a note (e.g., "AI Tutor App").
  4. Select the **`repo`** scope (this is required to read/write repositories).
  5. Click "Generate token".
  6. **Copy the token immediately** (you won't see it again).

## 3. AI/ML API (Optional - Extra AI Models)
- **Purpose**: Provides access to 100+ AI models (Llama 3, Mistral, etc.) as a backup if Groq is busy.
- **How to get it**:
  1. Go to [aimlapi.com](https://aimlapi.com/).
  2. Sign up and get your API Key.
  3. Add it to `.env` as `AIML_API_KEY`.

## How to Add Keys
1. Open the file `backend/.env` in your editor.
2. Find the lines for `ELEVENLABS_API_KEY`, `GITHUB_API_TOKEN`, and `AIML_API_KEY`.
3. Replace the placeholder text with your actual keys.

Example:
```env
ELEVENLABS_API_KEY=xi_...your_key_here...
GITHUB_API_TOKEN=ghp_...your_token_here...
AIML_API_KEY=your_aiml_api_key_here
```

## Restart Backend
After adding the keys, if you are running the backend locally, restart it:
```bash
cd backend
npm start
```
If deployed to Render, add these as "Environment Variables" in your Render dashboard.
