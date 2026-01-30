"""
J.A.R.V.I.S. Action Module
Robust desktop automation with human-like typing and window management.
"""

import os
import random
import subprocess
import time
from typing import Optional

import pyautogui
import pygetwindow as gw


class JarvisActionModule:
    """Desktop action handler for J.A.R.V.I.S."""

    def __init__(self, typing_min_delay: float = 0.03, typing_max_delay: float = 0.09):
        pyautogui.FAILSAFE = True
        self.typing_min_delay = typing_min_delay
        self.typing_max_delay = typing_max_delay

    def execute(self, command_text: str) -> Optional[str]:
        """
        Execute a user command for desktop actions.
        Returns a status string or None if not handled.
        """
        cmd = (command_text or "").lower().strip()
        if not cmd:
            return None

        try:
            if "open notepad" in cmd and "write" in cmd:
                content = self._extract_write_content(cmd)
                self._open_or_focus_notepad()
                return self._type_in_notepad(content)

            if "open notepad" in cmd:
                self._open_or_focus_notepad()
                return "Notepad action completed."

            if "write" in cmd and "notepad" in cmd:
                content = self._extract_write_content(cmd)
                return self._type_in_notepad(content)

            if "search for" in cmd:
                search_query = cmd.split("search for")[-1].strip()
                return self._web_search(search_query)

            if "screenshot" in cmd:
                return self._take_screenshot()

            return None
        except Exception as e:
            return f"Boss, an error occurred: {str(e)}"

    def _open_or_focus_notepad(self) -> None:
        """Open Notepad or focus it if already running."""
        windows = gw.getWindowsWithTitle("Notepad")
        if windows:
            window = windows[0]
            try:
                window.restore()
            except Exception:
                pass
            window.activate()
            return

        subprocess.Popen(["notepad.exe"])
        time.sleep(0.8)

    def _type_in_notepad(self, content: str) -> str:
        """Type content into Notepad with human-like delays."""
        if not content:
            return "Boss, there's nothing to write."

        if not self._is_notepad_focused():
            return "Boss, Notepad is not in focus. I won't type in the wrong window."

        time.sleep(0.3)
        for ch in content:
            pyautogui.write(ch)
            time.sleep(random.uniform(self.typing_min_delay, self.typing_max_delay))

        return "Typed content successfully."

    def _web_search(self, search_query: str) -> str:
        if not search_query:
            return "Boss, I need a search query."

        pyautogui.press("win")
        time.sleep(0.5)
        pyautogui.write(f"https://www.google.com/search?q={search_query}")
        pyautogui.press("enter")
        return "Search initiated."

    def _take_screenshot(self) -> str:
        if not os.path.exists("Screenshots"):
            os.makedirs("Screenshots")

        path = f"Screenshots/JARVIS_{int(time.time())}.png"
        pyautogui.screenshot(path)
        return f"Screenshot saved at {path}"

    def _is_notepad_focused(self) -> bool:
        try:
            active = gw.getActiveWindow()
            if not active or not active.title:
                return False
            return "notepad" in active.title.lower()
        except Exception:
            return False

    @staticmethod
    def _extract_write_content(cmd: str) -> str:
        content = cmd.split("write", 1)[-1]
        content = content.replace("on notepad", "").strip()
        return content


if __name__ == "__main__":
    print("🤖 J.A.R.V.I.S: Ready for action test!")
    jarvis_actions = JarvisActionModule()
    # Example: jarvis_actions.execute("open notepad and write Hello Boss")
