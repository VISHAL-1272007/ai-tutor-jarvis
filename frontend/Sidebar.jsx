import React, { useState } from 'react';
import {
    Home,
    MessageSquare,
    BookOpen,
    Zap,
    Package,
    User,
    Settings,
    LogOut
} from 'lucide-react';

/**
 * ===== SIDEBAR COMPONENT =====
 * Fixed Left Sidebar with Blurred-Glass Effect
 * Backdrop-filter: blur(16px) for AI Vision Studio aesthetic
 */

export const Sidebar = ({ activeTab, onTabChange, onLogout }) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
        <aside className="sidebar-fixed">
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">🤖</div>
                </div>
                <div className="sidebar-brand">
                    <div className="sidebar-title">JARVIS</div>
                    <div className="sidebar-subtitle">AI Vision Studio</div>
                </div>
            </div>

            {/* Recent Chats Section */}
            <div className="sidebar-section">
                <div className="section-label">Recent Chats</div>
                <ul className="sidebar-menu">
                    {recentChats.map((chat, i) => (
                        <li key={i} className="sidebar-menu-item">
                            <a 
                                href="#" 
                                className="sidebar-menu-link" 
                                onClick={(e) => e.preventDefault()}
                            >
                                <MessageSquare size={18} />
                                <span>{chat}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Navigation */}
            <ul className="sidebar-menu">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <li key={item.id} className="sidebar-menu-item">
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={`sidebar-menu-link ${activeTab === item.id ? 'active' : ''}`}
                                style={{ width: '100%', textAlign: 'left' }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Account Section */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: '#6a7492',
                    marginBottom: '16px',
                    fontWeight: '700'
                }}>
                    Account
                </div>
                <ul className="sidebar-menu">
                    {bottomItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id} className="sidebar-menu-item">
                                <button
                                    onClick={() => onTabChange(item.id)}
                                    className={`sidebar-menu-link ${activeTab === item.id ? 'active' : ''}`}
                                    style={{ width: '100%', textAlign: 'left' }}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                    
                    {/* Logout Button */}
                    <li className="sidebar-menu-item">
                        <button
                            onClick={onLogout}
                            className="sidebar-menu-link"
                            style={{ width: '100%', textAlign: 'left', color: '#ff8c42' }}
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
