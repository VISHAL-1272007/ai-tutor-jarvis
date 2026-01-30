import React, { useState, useEffect } from 'react';
import {
    Home,
    MessageSquare,
    BookOpen,
    Zap,
    Package,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';

/**
 * ===== SIDEBAR COMPONENT =====
 * Collapsible Left Sidebar with Glassmorphism
 * State: isSidebarOpen (true = w-64, false = w-0)
 * Smooth transitions with Tailwind animations
 */

export const Sidebar = ({ activeTab, onTabChange, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sync sidebar state to global for toggle button
    useEffect(() => {
        window.sidebarState = { isOpen: isSidebarOpen, toggle: () => setIsSidebarOpen(!isSidebarOpen) };
    }, [isSidebarOpen]);

    const menuItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'new-chat', icon: MessageSquare, label: 'New Chat' },
        { id: 'learn', icon: BookOpen, label: 'Learn' },
        { id: 'playground', icon: Zap, label: 'Playground' },
        { id: 'projects', icon: Package, label: 'Projects' }
    ];

    const bottomItems = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    const recentChats = [
        'Quantum Physics',
        'Python Basics',
        'History Essay'
    ];

    return (
        <>
            {/* Toggle Button (Fixed, always visible) */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed left-4 top-4 z-50 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-in-out lg:hidden"
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                {isSidebarOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <Menu size={24} className="text-white" />
                )}
            </button>

            {/* Overlay (Mobile only, when sidebar is open) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[999] lg:hidden transition-opacity duration-300 ease-in-out"
                    style={{ backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container with smooth collapse animation */}
            <aside
                className={`fixed left-0 top-0 h-screen z-[1000] transition-all duration-300 ease-in-out overflow-hidden ${
                    isSidebarOpen 
                        ? 'w-64 opacity-100 shadow-xl' 
                        : 'w-0 opacity-0 -translate-x-full'
                }`}
                style={{
                    background: 'rgba(15, 15, 15, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: 'inset 1px 0 0 rgba(255, 255, 255, 0.02), 4px 0 20px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🤖</div>
                        <div>
                            <div className="text-white font-bold text-sm">JARVIS</div>
                            <div className="text-white/40 text-xs">AI Vision Studio</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded hover:bg-white/10 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} className="text-white/60" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto h-[calc(100vh-80px)] flex flex-col p-4">
                    {/* Recent Chats Section */}
                    {isSidebarOpen && (
                        <div className="mb-6">
                            <div className="text-xs uppercase font-bold text-white/40 mb-3 px-2">
                                Recent Chats
                            </div>
                            <ul className="space-y-2">
                                {recentChats.map((chat, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => onTabChange(`chat-${i}`)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out flex items-center gap-2"
                                        >
                                            <MessageSquare size={16} className="flex-shrink-0" />
                                            <span className="truncate">{chat}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Main Navigation */}
                    <div className="mb-6">
                        <div className="text-xs uppercase font-bold text-white/40 mb-3 px-2">
                            Navigation
                        </div>
                        <ul className="space-y-2">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                onTabChange(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-in-out flex items-center gap-3 ${
                                                activeTab === item.id
                                                    ? 'bg-white/10 text-white border border-white/20'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon size={18} className="flex-shrink-0" />
                                            {isSidebarOpen && <span>{item.label}</span>}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Account Section */}
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="text-xs uppercase font-bold text-white/40 mb-3 px-2">
                            Account
                        </div>
                        <ul className="space-y-2">
                            {bottomItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                onTabChange(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-in-out flex items-center gap-3 ${
                                                activeTab === item.id
                                                    ? 'bg-white/10 text-white border border-white/20'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon size={18} className="flex-shrink-0" />
                                            {isSidebarOpen && <span>{item.label}</span>}
                                        </button>
                                    </li>
                                );
                            })}

                            {/* Logout Button */}
                            <li>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setIsSidebarOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-orange-400/60 hover:text-orange-400 hover:bg-white/5 transition-all duration-300 ease-in-out flex items-center gap-3"
                                >
                                    <LogOut size={18} className="flex-shrink-0" />
                                    {isSidebarOpen && <span>Logout</span>}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
