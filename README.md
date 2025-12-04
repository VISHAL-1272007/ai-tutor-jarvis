# AI Tutor (JARVIS) - AI Assistant with Voice & Web Search 🤖

## 🌟 Live Demo

**Frontend:** https://vishai-f6197.web.app  
**Backend:** https://ai-tutor-jarvis.onrender.com

## ✨ Features

- 🎤 **Voice Control**: Speak your questions and hear responses
- 🌐 **Web Search**: Optional Perplexity API integration for real-time web search
- 🗣️ **Text-to-Speech**: Perplexity-style voice responses with visual feedback
- 💬 **Real-time Chat**: Instant AI responses with typing animation
- 🎨 **Iron Man Theme**: Sleek JARVIS-inspired UI with cyan glow effects
- 📱 **Mobile Optimized**: Responsive design with sidebar overlay
- 🔐 **Google Sign-In**: Optional authentication (guest mode available)
- 🌍 **Multi-language**: English, Tamil, Hindi support
- 📝 **Markdown Support**: Code blocks, formatting, and syntax highlighting
- 💾 **Chat History**: Save and manage conversations

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
# Add your API key to .env file (see Configuration below)
npm start
```

### Frontend
Simply open `frontend/index.html` in your browser, or deploy to Firebase Hosting.

## 📝 Configuration

### Option 1: Perplexity API (with Web Search) 🌐

Get real-time web search capabilities! See [PERPLEXITY_SETUP.md](PERPLEXITY_SETUP.md) for detailed setup.

1. Get API key from https://www.perplexity.ai/api
2. Edit `backend/.env`:
```
PERPLEXITY_API_KEY=pplx-your-actual-key-here
```

### Option 2: Groq API (Free & Fast) ⚡

1. Get API key from https://console.groq.com/keys
2. Edit `backend/.env`:
```
GROQ_API_KEY=gsk-your-actual-key-here
```

**The backend automatically uses Perplexity if available, otherwise falls back to Groq!**

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Axios
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **AI**: Perplexity API (web search) or Groq API (free)
- **Hosting**: Firebase Hosting + Render
- **Voice**: Web Speech API (SpeechSynthesis & SpeechRecognition)
- **Auth**: Firebase Authentication (Google Sign-In)

## 📂 Project Structure

```
ai-tutor/
├── backend/
│   ├── index.js           # Express server with Perplexity/Groq API
│   ├── package.json       # Dependencies
│   └── .env              # API keys (PERPLEXITY_API_KEY or GROQ_API_KEY)
├── frontend/
│   ├── index.html        # Main chat interface
│   ├── login.html        # Authentication page
│   ├── style.css         # Iron Man themed styling
│   ├── script.js         # Chat logic & voice features
│   ├── auth.js           # Firebase authentication
│   └── firebase-config.js # Firebase SDK configuration
├── PERPLEXITY_SETUP.md   # Detailed Perplexity API setup guide
├── DEPLOYMENT.md         # Deployment instructions
└── README.md            # This file
```

## 🎤 Voice Features

- **Voice Input**: Click microphone button to speak your question
- **Voice Output**: AI responses are automatically spoken with visual feedback
- **Multi-language**: Supports English, Tamil, and Hindi
- **Visual Feedback**: JARVIS orb pulses cyan when speaking (just like Perplexity!)

## 🌐 Perplexity Integration

Want AI with real-time web search? Check out [PERPLEXITY_SETUP.md](PERPLEXITY_SETUP.md) for:
- Step-by-step API setup
- Render deployment configuration
- Model selection guide
- Troubleshooting tips

## 🚀 Deployment

### Firebase Hosting (Frontend)
```bash
firebase deploy --only hosting
```

### Render (Backend)
1. Push to GitHub
2. Connect repository to Render
3. Add environment variables:
   - `PERPLEXITY_API_KEY` or `GROQ_API_KEY`
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 💡 Tips

- **Perplexity** provides web search and citations (requires API key & paid plan)
- **Groq** is completely free and very fast (no web search)
- Voice feature works with both APIs
- Guest mode allows usage without sign-in

## 👨‍💻 Developer

Developed with ❤️ by **VISHAL**

## 📄 License

MIT License - feel free to use and modify!

---

For questions or issues, check:
- [PERPLEXITY_SETUP.md](PERPLEXITY_SETUP.md) - Perplexity API integration
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide

## ❓ Troubleshooting

**Backend won't start?**
- Make sure you've run `npm install`
- Check that your API key is in `.env`

**Frontend can't connect?**
- Ensure backend is running on port 5000
- Check browser console for errors

**API errors?**
- Verify your OpenAI API key is valid
- Check you have API credits available
