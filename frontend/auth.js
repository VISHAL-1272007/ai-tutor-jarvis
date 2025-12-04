// ===== Firebase Authentication =====
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from './firebase-config.js';

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Already logged in, redirect to home
        console.log('✅ Already logged in as:', user.displayName || user.email);
        window.location.href = '/';
    }
});

// Google Sign In
let isSigningIn = false; // Prevent multiple popups

async function loginWithGoogle() {
    // Prevent multiple simultaneous popup requests
    if (isSigningIn) {
        console.log('⏳ Sign-in already in progress...');
        return;
    }

    const btn = document.getElementById('googleSignInBtn');
    const btnText = btn?.querySelector('span');
    
    try {
        isSigningIn = true;
        
        // Update button UI
        if (btn) {
            btn.disabled = true;
            if (btnText) btnText.textContent = 'Opening popup...';
        }
        
        console.log('🔐 Opening Google sign-in popup...');
        console.log('📍 Current domain:', window.location.hostname);
        
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Signed in:', result.user.displayName || result.user.email);
        
        if (btnText) btnText.textContent = 'Redirecting...';
        
        // Small delay for better UX
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    } catch (error) {
        console.error('❌ Login error:', error.code, error.message);
        console.error('Full error:', error);
        
        // Reset button
        if (btn) {
            btn.disabled = false;
            if (btnText) btnText.textContent = 'Sign in with Google';
        }
        
        // Better error messages
        if (error.code === 'auth/popup-closed-by-user') {
            alert('❌ Sign-in cancelled. Please try again.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            // User clicked button multiple times - ignore this error
            console.log('⚠️ Multiple popup requests detected - ignoring');
        } else if (error.code === 'auth/popup-blocked') {
            alert('❌ Popup was blocked by your browser.\n\nPlease:\n1. Allow popups for this site\n2. Try again');
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('❌ This domain is not authorized.\n\nPlease add this domain to Firebase Console:\nAuthentication → Settings → Authorized domains\n\nDomain: ' + window.location.hostname);
        } else {
            alert('❌ Login failed: ' + error.message + '\n\nError code: ' + error.code);
        }
    } finally {
        isSigningIn = false;
    }
}

// Make function globally accessible
window.loginWithGoogle = loginWithGoogle;
