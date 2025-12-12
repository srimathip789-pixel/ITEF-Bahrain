import React from 'react';
import './HeaderStyles.css';
import UserRegistration from './UserRegistration';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [layoutKey, setLayoutKey] = React.useState(0);

    React.useEffect(() => {
        const handleUserUpdate = () => {
            setLayoutKey(prev => prev + 1);
        };

        window.addEventListener('itef-user-updated', handleUserUpdate);
        return () => window.removeEventListener('itef-user-updated', handleUserUpdate);
    }, []);

    // Layout serves as the main wrapper
    return (
        <div className="layout" key={layoutKey}>
            <UserRegistration />
            <header className="itef-header">
                <img src="/itef-header.png" alt="ITEF Bahrain" className="header-image" />
            </header>
            <main className="container">
                {children}
            </main>
        </div>
    );
};

export default Layout;
