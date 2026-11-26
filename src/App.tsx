import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';




import PuzzleHub from './pages/PuzzleHub';
import PuzzleGame from './pages/PuzzleGame';
import WinnersPage from './pages/WinnersPage';
import AnswerKey from './pages/AnswerKey';
import Layout from './components/Layout';
import './puzzle-styles.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Layout><PuzzleHub /></Layout>} />
          <Route path="/puzzles" element={<Layout><PuzzleHub /></Layout>} />
          <Route path="/puzzles/:puzzleId" element={<Layout><PuzzleGame /></Layout>} />
          <Route path="/puzzles/winners" element={<Layout><WinnersPage /></Layout>} />
          {/* Answer key only available when running locally (npm run dev) — never on the live site */}
          {import.meta.env.DEV && <Route path="/answers" element={<AnswerKey />} />}
          {/* Fallback route */}
          <Route path="*" element={<Layout><PuzzleHub /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
