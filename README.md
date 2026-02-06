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

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Axios
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Models**: hugginG face AI model(own AI) TRAINED BY ME~!
- **Hosting**: Firebase Hosting + Render
- **Voice**: Web Speech API (SpeechSynthesis & SpeechRecognition)
- **Auth**: Firebase Authentication (Google Sign-In)

## 📂 Project Structure

```
ai-tutor/
├── backend/
│   ├── index.js           # Express server with Perplexity/Groq API
│   ├── package.json       # Dependencies
│   └── .env              
├── frontend/
│   ├── index.html        # Main chat interface
│   ├── login.html        # Authentication page
│   ├── style.css         # Iron Man themed styling
│   ├── script.js         # Chat logic & voice features
│   ├── auth.js           # Firebase authentication
│   └── firebase-config.js # Firebase SDK configuration
```

## 🎤 Voice Features

- **Voice Input**: Click microphone button to speak your question
- **Voice Output**: AI responses are automatically spoken with visual feedback
- **Multi-language**: Supports English, Tamil, and Hindi
- **Visual Feedback**: JARVIS orb pulses cyan when speaking (just like Perplexity!)


## 🚀 Deployment

### Firebase Hosting (Frontend)
```bash
firebase deploy --only hosting
```

### Render backend(service)
### Render ---> Manual Deploy

## 👨‍💻 Developer

Developed with ❤️ by **VISHAL**

## 📄 License

MIT License - feel free to use and modify!

---


**Backend won't start?**
- Make sure you've run `npm install`
- Check that your API key is in `.env`

**Frontend can't connect?**
- Ensure backend is running on port 5000
- Check browser console for errors
