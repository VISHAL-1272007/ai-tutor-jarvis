import sqlite3
import os

# Database file path setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'jarvis_memory.db')

def init_db():
    """Initializes the database and creates the table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS chat_history 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                       role TEXT, 
                       content TEXT,
                       timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def save_message(role, content):
    """Saves a single message to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chat_history (role, content) VALUES (?, ?)", (role, content))
    conn.commit()
    conn.close()

def get_history(limit=5):
    """Retrieves the last N messages from the history."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Inga dhaan neenga kĕtta (limit,) logic irukku
    cursor.execute("SELECT role, content FROM chat_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    # Chronological order-kaaga reverse pandrom
    return rows[::-1]

# Start the DB when this file is imported
init_db()