import React from 'react';
import './HeaderStyles.css';
import UserRegistration, { USER_DETAILS_KEY } from './UserRegistration';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [layoutKey, setLayoutKey] = React.useState(0);
    const [userName, setUserName] = React.useState<string>('');

    React.useEffect(() => {
        const loadUserName = () => {
            const stored = localStorage.getItem(USER_DETAILS_KEY);
            if (stored) {
                try {
                    const user = JSON.parse(stored);
                    if (user && user.name) {
                        setUserName(user.name);
                    } else {
                        // Invalid structure
                        localStorage.removeItem(USER_DETAILS_KEY);
                        setUserName('');
                        setLayoutKey(prev => prev + 1); // Force remount to show registration
                    }
                } catch {
                    // Corrupted data
                    localStorage.removeItem(USER_DETAILS_KEY);
                    setUserName('');
                    setLayoutKey(prev => prev + 1); // Force remount
                }
            } else {
                setUserName('');
            }
        };

        loadUserName();

        const handleUserUpdate = () => {
            setLayoutKey(prev => prev + 1);
            loadUserName();
        };

        window.addEventListener('itef-user-updated', handleUserUpdate);
        return () => window.removeEventListener('itef-user-updated', handleUserUpdate);
    }, [layoutKey]);

    const handleLogout = () => {
        localStorage.removeItem(USER_DETAILS_KEY);
        localStorage.removeItem('puzzleProgress');
        localStorage.removeItem('puzzleWinners');
        setUserName('');
        setLayoutKey(prev => prev + 1);
    };

    // Layout serves as the main wrapper
    return (
        <div className="layout" key={layoutKey}>
            <UserRegistration />
            <header className="itef-header">
                <img src="/itef-header.png" alt="ITEF Bahrain" className="header-image" />
                {userName && (
                    <div className="user-info" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ color: '#333', fontWeight: '500', fontSize: '0.9rem' }}>
                            👤 {userName}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </header>
            <main className="container">
                {children}
            </main>
        </div>
    );
};

export default Layout;
