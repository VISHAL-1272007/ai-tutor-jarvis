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
            {/* Toggle Button (Fixed, always visible on mobile) */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed left-4 top-4 z-50 p-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-all duration-200 lg:hidden"
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
                    className="fixed inset-0 bg-black/50 z-[999] lg:hidden transition-opacity duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container - simple solid styling */}
            <aside
                className={`fixed left-0 top-0 h-screen z-[1000] transition-all duration-200 overflow-hidden ${
                    isSidebarOpen 
                        ? 'w-64 opacity-100' 
                        : 'w-0 opacity-0 -translate-x-full'
                }`}
                style={{
                    background: '#1a1a1a',
                    borderRight: '1px solid #2a2a2a'
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🤖</div>
                        <div>
                            <div className="text-white font-bold text-sm">JARVIS</div>
                            <div className="text-neutral-500 text-xs">AI Vision Studio</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded hover:bg-neutral-700 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto h-[calc(100vh-80px)] flex flex-col p-4">
                    {/* Recent Chats Section */}
                    {isSidebarOpen && (
                        <div className="mb-6">
                            <div className="text-xs uppercase font-bold text-neutral-500 mb-3 px-2">
                                Recent Chats
                            </div>
                            <ul className="space-y-1">
                                {recentChats.map((chat, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => onTabChange(`chat-${i}`)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200 flex items-center gap-2"
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
                        <div className="text-xs uppercase font-bold text-neutral-500 mb-3 px-2">
                            Navigation
                        </div>
                        <ul className="space-y-1">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                onTabChange(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                                                activeTab === item.id
                                                    ? 'bg-neutral-800 text-white border border-neutral-700'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
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
                    <div className="mt-auto pt-6 border-t border-neutral-800">
                        <div className="text-xs uppercase font-bold text-neutral-500 mb-3 px-2">
                            Account
                        </div>
                        <ul className="space-y-1">
                            {bottomItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                onTabChange(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                                                activeTab === item.id
                                                    ? 'bg-neutral-800 text-white border border-neutral-700'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
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
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-orange-400 hover:text-orange-300 hover:bg-neutral-800 transition-all duration-200 flex items-center gap-3"
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
