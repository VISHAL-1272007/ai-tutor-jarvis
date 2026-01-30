"""
J.A.R.V.I.S. Hands Module
n8n webhook integration for real-world task execution.
"""

import requests
import logging
from datetime import datetime
from typing import Tuple

logger = logging.getLogger("jarvis.hands")

N8N_WEBHOOK_URL = "https://jarvisaieedu.app.n8n.cloud/webhook-test/jarvis-task"
N8N_TIMEOUT = 10


def trigger_n8n_action(task_name: str, boss_command: str) -> Tuple[bool, str]:
    """
    Send a task to n8n to perform real-world actions.
    
    Args:
        task_name: Type of action (e.g., "send_email", "set_reminder")
        boss_command: Detailed instruction for n8n workflow
    
    Returns:
        (success: bool, message: str)
    """
    payload = {
        "task_name": task_name,
        "command": boss_command,
        "timestamp": datetime.now().isoformat(),
        "status": "triggered_by_jarvis"
    }
    
    try:
        logger.info(f"📤 Sending n8n action: {task_name}")
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=N8N_TIMEOUT)
        
        if response.status_code in [200, 201]:
            logger.info(f"✅ Action executed: {task_name}")
            return True, "Action initiated successfully, Boss."
        else:
            logger.warning(f"⚠️ n8n returned status {response.status_code}")
            return False, f"Hands are unresponsive. Status code: {response.status_code}"
    except requests.exceptions.Timeout:
        logger.error("❌ n8n request timed out")
        return False, "Hands response timeout. Try again, Boss."
    except Exception as e:
        logger.error(f"❌ Hands module error: {str(e)}")
        return False, f"System error in Hands module: {str(e)}"


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    success, message = trigger_n8n_action("System Test", "Testing JARVIS Hands integration.")
    print(f"Status: {success}, Message: {message}")
