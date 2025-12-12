import { Link } from 'react-router-dom';
import WinnersList from '../components/puzzles/WinnersList';
import { ArrowLeft } from 'lucide-react';

export default function WinnersPage() {
    return (
        <div className="winners-page">
            <div className="winners-page-header">
                <Link to="/puzzles" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Puzzles
                </Link>
                <h1>🏆 Complete Winners List</h1>
                <p className="subtitle">Engineers who solved puzzles correctly on their first try!</p>
            </div>

            <WinnersList />
        </div>
    );
}
