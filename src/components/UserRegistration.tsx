import React, { useState, useEffect } from 'react';
import './UserRegistration.css';
import { registerAttendee } from '../services/firebaseService';

interface UserDetails {
    name: string;
    email: string;
    mobile: string;
}

export const USER_DETAILS_KEY = 'itef_user_details';

export default function UserRegistration() {
    const [isOpen, setIsOpen] = useState(false);
    const [details, setDetails] = useState<UserDetails>({
        name: '',
        email: '',
        mobile: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const storedDetails = localStorage.getItem(USER_DETAILS_KEY);
        if (!storedDetails) {
            setIsOpen(true);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!details.name || !details.email || !details.mobile) {
            setError('Please fill in all fields');
            return;
        }

        // Basic validation
        if (!details.email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        if (details.mobile.length < 8) {
            setError('Please enter a valid mobile number');
            return;
        }

        // Save to localStorage first (this is synchronous and reliable)
        localStorage.setItem(USER_DETAILS_KEY, JSON.stringify(details));

        // Close modal
        setIsOpen(false);

        // Save to Firebase for attendees tracking - wait for completion
        try {
            await registerAttendee(details.name, details.email, details.mobile);
        } catch (error) {
            console.error('Error saving attendee to Firebase:', error);
        }

        // Reload page to show puzzle hub
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="registration-overlay">
            <div className="registration-modal">
                <div className="modal-header">
                    <h2>Event Registration</h2>
                    <p>Please enter your details to participate</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={details.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={details.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobile">Mobile Number</label>
                        <input
                            type="tel"
                            id="mobile"
                            name="mobile"
                            value={details.mobile}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                        />
                    </div>

                    <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                        Start Playing
                    </button>
                </form>
            </div>
        </div>
    );
}
