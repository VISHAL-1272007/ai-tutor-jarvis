"""
HTML Structure Fixer Script
Fixes broken HTML files by ensuring proper head/body structure
"""

import os
import re

# Define the pages that need fixing
PAGES_TO_FIX = [
    'courses.html',
    'playground.html',
    'ai-tools.html',
    'project-generator.html',
    'course-generator.html',
    'lesson.html',
    'quiz.html',
    'progress.html'
]

FRONTEND_DIR = r'c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor\frontend'

def fix_html_file(filepath):
    """Fix HTML file structure"""
    print(f"Fixing {os.path.basename(filepath)}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if </head> exists
    if '</head>' not in content:
        print(f"  - Missing </head> tag")
        # Find the last <link> tag and add </head><body> after it
        # Look for the pattern where sidebar starts without proper closure
        pattern = r'(<link[^>]*>)\s*(<div class="sidebar-header">)'
        replacement = r'\1\n</head>\n\n<body>\n    <!-- Sidebar -->\n    <aside class="sidebar" id="sidebar">\n        \2'
        content = re.sub(pattern, replacement, content)
    
    # Check if <body> exists
    if '<body>' not in content:
        print(f"  - Missing <body> tag")
    
    # Save the fixed content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✓ Fixed {os.path.basename(filepath)}")

def main():
    print("=" * 60)
    print("HTML Structure Fixer")
    print("=" * 60)
    
    for page in PAGES_TO_FIX:
        filepath = os.path.join(FRONTEND_DIR, page)
        if os.path.exists(filepath):
            try:
                fix_html_file(filepath)
            except Exception as e:
                print(f"  ✗ Error fixing {page}: {e}")
        else:
            print(f"  - Skipping {page} (not found)")
    
    print("=" * 60)
    print("Done!")

if __name__ == "__main__":
    main()
