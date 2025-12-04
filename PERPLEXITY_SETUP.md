# 🌐 Perplexity API Integration Guide

Your AI Tutor now supports **Perplexity API** with real-time web search capabilities! 🚀

## ✨ What You Get with Perplexity

- **🌐 Real-time Web Search**: AI can search the internet for latest information
- **📊 Up-to-date Data**: Get current news, trends, and information
- **🔍 Citations & Sources**: Perplexity provides sources for its answers
- **🧠 Advanced Reasoning**: Better understanding of complex queries

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Perplexity API Key

1. Go to https://www.perplexity.ai/api
2. Sign up or log in
3. Navigate to API settings
4. Create a new API key
5. Copy your API key (starts with `pplx-`)

### Step 2: Add API Key to Your Project

**For Local Development:**
1. Open `backend/.env` file
2. Replace this line:
   ```
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   ```
   With:
   ```
   PERPLEXITY_API_KEY=pplx-your-actual-key-here
   ```
3. Save the file

**For Render Deployment:**
1. Go to https://dashboard.render.com
2. Select your `ai-tutor-jarvis` service
3. Go to **Environment** section
4. Add new environment variable:
   - **Key:** `PERPLEXITY_API_KEY`
   - **Value:** `pplx-your-actual-key-here`
5. Click **Save Changes**
6. Render will automatically redeploy

### Step 3: Test It!

**Local Test:**
```bash
cd backend
node index.js
```
You should see: `🤖 Using Perplexity API (with Web Search! 🌐)`

**Live Test:**
Visit https://vishai-f6197.web.app and ask a question about current events!

## 🔄 How It Works

The backend automatically detects which API to use:

1. **If PERPLEXITY_API_KEY is set** → Uses Perplexity with web search 🌐
2. **If not set** → Falls back to Groq API (still works great!) ⚡

## 🎯 Perplexity Models Available

Currently using: `llama-3.1-sonar-small-128k-online`

Other models you can try (edit `backend/index.js`):
- `llama-3.1-sonar-large-128k-online` - More powerful, slower
- `llama-3.1-sonar-huge-128k-online` - Most powerful (requires higher tier)

## 💰 Pricing

Check https://www.perplexity.ai/api for current pricing.
They offer free credits for new users! 🎉

## 🔧 Switching Between APIs

**Use Perplexity:**
- Set `PERPLEXITY_API_KEY` in environment variables
- Backend will automatically use it

**Use Groq (free):**
- Keep `GROQ_API_KEY` as is
- Don't set (or remove) `PERPLEXITY_API_KEY`

**Both work great!** Perplexity adds web search, Groq is faster and free.

## 🎤 Voice Feature

Voice responses work with **both** APIs! Your Perplexity-style voice feature is already integrated. 🤖

## 🐛 Troubleshooting

**"⚠️ Please add your API key"**
- Make sure you've added the key to `.env` (local) or Render environment variables (production)
- Key should start with `pplx-`

**"Invalid API key"**
- Double-check your key from Perplexity dashboard
- Make sure there are no extra spaces

**"Too many requests"**
- You've hit the rate limit
- Wait a few minutes or upgrade your Perplexity plan

## 📚 Next Steps

1. Get your Perplexity API key
2. Add it to environment variables
3. Deploy to Render
4. Enjoy AI with web search! 🎉

Your voice feature will now speak Perplexity's intelligent responses with real-time web data! 🌐🎤

---

**Need help?** Check the main README.md or visit https://www.perplexity.ai/api/docs
