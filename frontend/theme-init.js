/**
 * Early Theme Initialization
 * This script runs BEFORE page render to prevent flash of dark mode
 */

(function() {
    'use strict';
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = 'light';
    
    // If no theme saved, set light mode
    if (!savedTheme) {
        localStorage.setItem('theme', defaultTheme);
    }
    
    // Apply theme immediately to prevent flash
    const theme = savedTheme || defaultTheme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also set it on body for any legacy selectors
    document.addEventListener('DOMContentLoaded', function() {
        document.body.setAttribute('data-theme', theme);
        
        // Update theme color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            if (theme === 'light') {
                metaThemeColor.setAttribute('content', '#667eea');
            } else {
                metaThemeColor.setAttribute('content', '#0f1419');
            }
        }
    });
    
    console.log('🎨 Theme initialized:', theme);
})();
