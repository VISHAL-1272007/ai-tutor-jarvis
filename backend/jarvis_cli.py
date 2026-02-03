#!/usr/bin/env python3
"""
JARVIS Standalone CLI Wrapper
Accepts JSON input via stdin, returns JSON output via stdout
For use with Node.js child_process integration
"""

import sys
import json
import logging

# Disable logging to stdout to keep JSON clean
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('/tmp/jarvis.log')]
)

try:
    from jarvis_standalone import JARVISResilientAgent
    
    # Initialize agent
    agent = JARVISResilientAgent()
    
    # Read input from stdin
    input_data = sys.stdin.read()
    request = json.loads(input_data)
    
    action = request.get('action', 'query')
    
    if action == 'health':
        result = {
            'success': True,
            'available': True,
            'version': '4.0'
        }
    
    elif action == 'stats':
        stats = agent.get_statistics()
        result = {
            'success': True,
            'statistics': stats
        }
    
    elif action == 'query':
        query = request.get('query', '')
        
        if not query:
            result = {
                'success': False,
                'answer': 'No query provided',
                'source': 'error'
            }
        else:
            response = agent.process_query(query)
            result = {
                'success': True,
                'answer': response.answer,
                'source': response.source.value,
                'used_search': response.used_search,
                'confidence': response.confidence,
                'resources': response.resources
            }
    
    else:
        result = {
            'success': False,
            'error': f'Unknown action: {action}'
        }
    
    # Output JSON to stdout
    print(json.dumps(result))
    sys.exit(0)

except Exception as e:
    error_result = {
        'success': False,
        'error': str(e),
        'type': type(e).__name__
    }
    print(json.dumps(error_result))
    sys.exit(1)
