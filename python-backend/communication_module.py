"""
J.A.R.V.I.S. Communication Module
Professional voice input/output with wake-word detection and ambient noise handling.
"""

import pyttsx3
import speech_recognition as sr
import logging
import time
from typing import Optional, Tuple
from threading import Thread, Event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class JarvisCommunicationModule:
    """Handles voice I/O with professional tone and wake-word detection."""

    def __init__(self, wake_word: str = "jarvis", voice_gender: str = "male"):
        """
        Initialize communication module.
        
        Args:
            wake_word: Wake word to listen for (default: "jarvis")
            voice_gender: "male" or "female" (male = index 0, female = index 1)
        """
        self.wake_word = wake_word.lower()
        self.voice_gender = voice_gender
        self.recognizer = sr.Recognizer()
        
        # Initialize TTS engine
        self.engine = pyttsx3.init()
        self._configure_voice()
        
        # Stop flag for listening
        self.stop_listening = Event()
        
        logger.info(f"✅ J.A.R.V.I.S. Communication Module initialized ({voice_gender} voice)")

    def _configure_voice(self):
        """Configure voice properties for professional tone."""
        voices = self.engine.getProperty('voices')
        
        # Set voice: 0 = Male, 1 = Female
        voice_index = 0 if self.voice_gender.lower() == "male" else 1
        if voice_index < len(voices):
            self.engine.setProperty('voice', voices[voice_index].id)
        
        # Professional calm tone settings
        self.engine.setProperty('rate', 160)      # Slightly slower (calm)
        self.engine.setProperty('volume', 0.9)    # 90% volume
        
        logger.info(f"🎤 Voice configured: {self.voice_gender} @ 160 WPM")

    def speak(self, text: str, wait: bool = True) -> None:
        """
        Speak text using professional voice.
        
        Args:
            text: Text to speak
            wait: Wait for speech to finish (True) or async (False)
        """
        try:
            logger.info(f"🤖 Speaking: {text[:60]}...")
            print(f"🤖 J.A.R.V.I.S: {text}")
            
            self.engine.say(text)
            if wait:
                self.engine.runAndWait()
            else:
                # Non-blocking speech
                Thread(target=self.engine.runAndWait, daemon=True).start()
        except Exception as e:
            logger.error(f"❌ Speech error: {e}")

    def listen(self, timeout: int = 5, phrase_time_limit: int = 10) -> Optional[str]:
        """
        Listen for voice input with error handling.
        
        Args:
            timeout: Seconds to wait for speech to start
            phrase_time_limit: Max seconds to listen for a phrase
            
        Returns:
            Recognized text or None if failed
        """
        try:
            with sr.Microphone() as source:
                # Calibrate for ambient noise (critical for background noise rejection)
                logger.info("🎤 Calibrating for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                # Set dynamic energy threshold
                self.recognizer.dynamic_energy_threshold = True
                self.recognizer.energy_threshold = 4000  # Tuned for desktop environment
                
                logger.info("🎤 Listening...")
                audio = self.recognizer.listen(
                    source,
                    timeout=timeout,
                    phrase_time_limit=phrase_time_limit
                )
                
            # Recognize speech using Google
            text = self.recognizer.recognize_google(audio, language='en-in')
            logger.info(f"👤 Recognized: {text}")
            return text.lower()
            
        except sr.UnknownValueError:
            logger.warning("⚠️ Speech not recognized. Please speak clearly.")
            return None
        except sr.RequestError as e:
            logger.error(f"❌ Google API error: {e}")
            return None
        except sr.Timeout:
            logger.warning("⏱️ No speech detected. Timeout.")
            return None
        except Exception as e:
            logger.error(f"❌ Listening error: {e}")
            return None

    def wait_for_wake_word(self, timeout: Optional[int] = None) -> bool:
        """
        Continuously listen for wake word.
        
        Args:
            timeout: Max seconds to wait (None = infinite)
            
        Returns:
            True when wake word detected
        """
        start_time = time.time()
        attempt = 0
        
        while True:
            # Check timeout
            if timeout and (time.time() - start_time) > timeout:
                logger.warning(f"⏱️ Wake word timeout ({timeout}s)")
                return False
            
            # Check stop flag
            if self.stop_listening.is_set():
                logger.info("🛑 Listening stopped by user")
                return False
            
            attempt += 1
            logger.info(f"🔍 Listening for '{self.wake_word}' (attempt {attempt})...")
            
            heard = self.listen(timeout=10, phrase_time_limit=5)
            
            if heard and self.wake_word in heard:
                logger.info(f"✅ Wake word detected: '{self.wake_word}'")
                return True
            
            # Brief pause before next attempt to avoid CPU spam
            time.sleep(0.5)

    def activation_response(self) -> None:
        """Play activation sound/response when wake word detected."""
        self.speak("Yes Boss? How can I help you?", wait=True)

    def listen_for_command(self) -> Optional[str]:
        """
        Listen for actual command after wake word.
        
        Returns:
            Recognized command or None
        """
        logger.info("🎤 Listening for command...")
        command = self.listen(timeout=10, phrase_time_limit=15)
        
        if not command:
            self.speak("Sorry, I didn't catch that. Please repeat.")
            return None
        
        return command

    def conversation_flow(self, max_iterations: int = 5) -> Optional[str]:
        """
        Complete conversation flow: wait for wake word → activation → listen for command.
        
        Args:
            max_iterations: Max times to ask for repetition
            
        Returns:
            Final command or None if failed
        """
        # Step 1: Wait for wake word
        if not self.wait_for_wake_word(timeout=30):
            return None
        
        # Step 2: Activation response
        self.activation_response()
        
        # Step 3: Listen for command with retry logic
        for attempt in range(max_iterations):
            command = self.listen_for_command()
            
            if command:
                logger.info(f"✅ Command captured: {command}")
                return command
            
            if attempt < max_iterations - 1:
                self.speak(f"Let me try again. Please speak clearly.")
        
        self.speak("Unable to understand. Returning to standby.")
        return None

    def interrupt_listening(self) -> None:
        """Stop listening immediately."""
        self.stop_listening.set()
        logger.info("🛑 Listening interrupted")

    def resume_listening(self) -> None:
        """Resume listening."""
        self.stop_listening.clear()
        logger.info("▶️ Listening resumed")


# ==========================================
# USAGE FUNCTIONS
# ==========================================

# Global instance
communication_module: Optional[JarvisCommunicationModule] = None


def initialize_communication(wake_word: str = "jarvis", voice_gender: str = "male") -> JarvisCommunicationModule:
    """Initialize communication module (call once at startup)."""
    global communication_module
    communication_module = JarvisCommunicationModule(wake_word=wake_word, voice_gender=voice_gender)
    return communication_module


def speak(text: str, wait: bool = True) -> None:
    """Speak text using JARVIS voice."""
    if communication_module:
        communication_module.speak(text, wait=wait)
    else:
        logger.warning("⚠️ Communication module not initialized")


def listen_wake_word(timeout: Optional[int] = None) -> bool:
    """Wait for wake word."""
    if communication_module:
        return communication_module.wait_for_wake_word(timeout=timeout)
    return False


def get_command() -> Optional[str]:
    """Get voice command after wake word detected."""
    if communication_module:
        return communication_module.listen_for_command()
    return None


def listen_one_time(timeout: int = 5) -> Optional[str]:
    """Simple one-time listen without wake word."""
    if communication_module:
        return communication_module.listen(timeout=timeout)
    return None


def full_conversation() -> Optional[str]:
    """Complete conversation: wake word → activation → command."""
    if communication_module:
        return communication_module.conversation_flow()
    return None


# ==========================================
# DEMO / TEST
# ==========================================

if __name__ == "__main__":
    print("\n🤖 J.A.R.V.I.S. Communication Module - Test Mode\n")
    
    # Initialize
    comm = initialize_communication(wake_word="jarvis", voice_gender="male")
    
    # Startup message
    comm.speak("Systems online. J.A.R.V.I.S. is ready, Boss.")
    time.sleep(1)
    
    # Main loop
    iteration = 0
    while iteration < 3:
        iteration += 1
        print(f"\n--- Iteration {iteration} ---")
        
        # Complete conversation flow
        command = comm.conversation_flow()
        
        if command:
            print(f"✅ Received command: {command}")
            
            # Example: Process commands
            if "exit" in command or "sleep" in command:
                comm.speak("Going offline. Have a great day, Boss.")
                break
            elif "open notepad" in command:
                comm.speak("Opening Notepad right away.")
            else:
                comm.speak(f"Processing: {command}")
        else:
            print("❌ No command received")
        
        time.sleep(1)
    
    print("\n✅ Demo complete\n")
