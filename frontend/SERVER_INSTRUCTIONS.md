# JARVIS AI - Local Development Server

## Quick Start

### Start the Server:
Double-click `START_SERVER.bat` or run:
```bash
python -m http.server 8000
```

### Access the Application:
Open your browser and navigate to:
- **Main App**: http://localhost:8000/index.html
- **Courses**: http://localhost:8000/courses.html
- **Playground**: http://localhost:8000/playground.html
- **Dashboard**: http://localhost:8000/dashboard.html
- **AI Tools**: http://localhost:8000/ai-tools.html
- **Project Generator**: http://localhost:8000/project-generator.html

## Why Use a Local Server?

Running the app through a local server (instead of opening HTML files directly) fixes:

✅ **CORS Errors** - Allows JavaScript modules to load properly
✅ **postMessage Warnings** - Eliminates cross-origin warnings
✅ **Firebase Integration** - Enables proper authentication
✅ **Full Functionality** - All features work as intended

## Alternative Servers

If Python is not available, you can use:

### Node.js (http-server):
```bash
npx http-server -p 8000
```

### PHP:
```bash
php -S localhost:8000
```

### Live Server (VS Code Extension):
Install "Live Server" extension and click "Go Live"

## Troubleshooting

**Port Already in Use?**
Change the port number in START_SERVER.bat:
```batch
python -m http.server 8080
```

**Python Not Found?**
Install Python from: https://www.python.org/downloads/

## Stop the Server

Press `Ctrl+C` in the terminal window where the server is running.
