import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

/**
 * CognitiveGamePage — Pattern Memory, Number Recall and Card Match mini-games.
 * Results are saved to the database for caregiver monitoring.
 */
export default function CognitiveGamePage() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get(`/cognitive/${user._id}`).then(res => setResults(res.data)).catch(() => { });
  }, [user]);

  const saveResult = async (gameType, score) => {
    try {
      await api.post('/cognitive', { patientId: user._id, gameType, score, maxScore: 100 });
      const res = await api.get(`/cognitive/${user._id}`);
      setResults(res.data);
    } catch (err) { console.error(err); }
  };

  const gameIcon = (type) => {
    if (type === 'pattern_memory') return '🎨';
    if (type === 'number_recall') return '🔢';
    if (type === 'card_match') return '🃏';
    return '🧠';
  };

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="page-header">
          <h1>🧠 Brain Games</h1>
          <p>Keep your mind sharp with memory exercises</p>
        </div>

        {!activeGame ? (
          <div className="cards-grid-3">
            <div className="game-card" onClick={() => setActiveGame('pattern')}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🎨</span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>Pattern Memory</h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Remember and repeat the color pattern</p>
              <button className="btn-primary">▶ Play</button>
            </div>
            <div className="game-card" onClick={() => setActiveGame('number')}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🔢</span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>Number Recall</h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Remember the sequence of numbers</p>
              <button className="btn-primary">▶ Play</button>
            </div>
            <div className="game-card" onClick={() => setActiveGame('cardmatch')}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🃏</span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>Card Match</h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Flip cards and find matching pairs</p>
              <button className="btn-primary">▶ Play</button>
            </div>
          </div>
        ) : activeGame === 'pattern' ? (
          <PatternGame onFinish={(s) => { saveResult('pattern_memory', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        ) : activeGame === 'number' ? (
          <NumberGame onFinish={(s) => { saveResult('number_recall', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        ) : (
          <CardMatchGame onFinish={(s) => { saveResult('card_match', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        )}

        {/* Recent Results */}
        {results.length > 0 && (
          <div>
            <h2 className="section-heading">📊 Recent Results</h2>
            <div className="stats-grid-4">
              {results.slice(0, 8).map(r => (
                <div key={r._id} className="stat-card">
                  <span style={{ fontSize: '1.5rem' }}>{gameIcon(r.gameType)}</span>
                  <p className="stat-value" style={{ color: '#818cf8', fontSize: '1.75rem', marginTop: '0.375rem' }}>{r.score}%</p>
                  <p className="stat-label">{new Date(r.playedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

/** Pattern Memory Game */
function PatternGame({ onFinish, onBack }) {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [showing, setShowing] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const startRound = useCallback(() => {
    const newSeq = Array.from({ length: round + 2 }, () => Math.floor(Math.random() * colors.length));
    setSequence(newSeq);
    setPlayerSeq([]);
    setShowing(true);

    newSeq.forEach((ci, i) => {
      setTimeout(() => setActiveColor(ci), i * 700);
      setTimeout(() => setActiveColor(null), i * 700 + 400);
    });
    setTimeout(() => setShowing(false), newSeq.length * 700 + 200);
  }, [round]);

  useEffect(() => { startRound(); }, [round]);

  const handleClick = (ci) => {
    if (showing || gameOver) return;
    const newPlayerSeq = [...playerSeq, ci];
    setPlayerSeq(newPlayerSeq);
    setActiveColor(ci);
    setTimeout(() => setActiveColor(null), 200);

    const idx = newPlayerSeq.length - 1;
    if (newPlayerSeq[idx] !== sequence[idx]) {
      const finalScore = Math.round(((round - 1) / 5) * 100);
      setScore(finalScore);
      setGameOver(true);
      onFinish(finalScore);
      return;
    }
    if (newPlayerSeq.length === sequence.length) {
      if (round >= 5) { setScore(100); setGameOver(true); onFinish(100); }
      else setTimeout(() => setRound(r => r + 1), 500);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>🎨 Pattern Memory — Round {round}/5</h2>
        <button onClick={onBack} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>← Back</button>
      </div>
      {showing && <p style={{ textAlign: 'center', color: '#fbbf24', fontWeight: 600 }}>Watch the pattern...</p>}
      {!showing && !gameOver && <p style={{ textAlign: 'center', color: '#34d399', fontWeight: 600 }}>Your turn! Repeat the pattern.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: '16rem', margin: '0 auto' }}>
        {colors.map((c, i) => (
          <button key={i} onClick={() => handleClick(i)} disabled={showing || gameOver}
            style={{
              width: '5rem', height: '5rem', borderRadius: '12px',
              transition: 'all 0.2s', border: '2px solid transparent',
              backgroundColor: activeColor === i ? c : `${c}33`,
              borderColor: activeColor === i ? c : 'transparent',
              cursor: showing || gameOver ? 'default' : 'pointer',
              transform: activeColor === i ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
      </div>
      {gameOver && <p style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>Score: {score}%</p>}
    </div>
  );
}

/** Number Recall Game */
function NumberGame({ onFinish, onBack }) {
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('show'); // show | input | result
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const totalRounds = 5;

  const generateNumber = useCallback(() => {
    const len = round + 2;
    const num = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    setNumber(num);
    setInput('');
    setPhase('show');
    setTimeout(() => setPhase('input'), 2000 + len * 300);
  }, [round]);

  useEffect(() => { generateNumber(); }, [round]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCorrect = input === number;
    if (isCorrect) setCorrect(c => c + 1);
    if (round >= totalRounds) {
      const finalScore = Math.round(((correct + (isCorrect ? 1 : 0)) / totalRounds) * 100);
      setPhase('result');
      onFinish(finalScore);
    } else {
      setRound(r => r + 1);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>🔢 Number Recall — Round {round}/{totalRounds}</h2>
        <button onClick={onBack} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>← Back</button>
      </div>
      {phase === 'show' && (
        <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
          <p style={{ fontSize: '0.8125rem', color: '#fbbf24', marginBottom: '0.75rem' }}>Remember this number:</p>
          <p style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.2em', color: '#818cf8' }}>{number}</p>
        </div>
      )}
      {phase === 'input' && (
        <form onSubmit={handleSubmit} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem 0' }}>
          <p style={{ fontSize: '0.8125rem', color: '#34d399' }}>Type the number you saw:</p>
          <input value={input} onChange={e => setInput(e.target.value)} className="input-field" style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '0.2em', maxWidth: '16rem', margin: '0 auto' }} autoFocus maxLength={number.length + 1} />
          <div><button type="submit" className="btn-primary">Check ✓</button></div>
        </form>
      )}
      {phase === 'result' && <p style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#818cf8', padding: '2rem 0' }}>Final Score: {Math.round(((correct) / totalRounds) * 100)}%</p>}
    </div>
  );
}

/** Card Match (Memory Pair) Game */
function CardMatchGame({ onFinish, onBack }) {
  const emojis = ['💊', '💉', '🩺', '🫀', '🧬', '🩹', '🏥', '🫁'];

  const createBoard = () => {
    const pairs = [...emojis, ...emojis];
    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));
  };

  const [cards, setCards] = useState(() => createBoard());
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [locked, setLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState([]);
  const totalPairs = emojis.length; // 8

  const handleCardClick = (id) => {
    if (locked || gameOver) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards[firstId];
      const secondCard = newCards[secondId];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        const matched = newCards.map(c =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        );
        setCards(matched);
        setFlippedIds([]);
        setLocked(false);

        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);

        if (newMatchedPairs === totalPairs) {
          // Game complete — score based on moves
          // Perfect = 8 moves (one per pair), good < 16, okay < 24
          const currentMoves = moves + 1;
          let finalScore;
          if (currentMoves <= 8) finalScore = 100;
          else if (currentMoves <= 12) finalScore = 90;
          else if (currentMoves <= 16) finalScore = 75;
          else if (currentMoves <= 20) finalScore = 60;
          else if (currentMoves <= 24) finalScore = 45;
          else if (currentMoves <= 30) finalScore = 30;
          else finalScore = 15;
          setScore(finalScore);
          setGameOver(true);
          onFinish(finalScore);
        }
      } else {
        // No match — shake then flip back
        setWrongIds([firstId, secondId]);
        setTimeout(() => {
          setWrongIds([]);
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setLocked(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(createBoard());
    setFlippedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setLocked(false);
    setGameOver(false);
    setWrongIds([]);
    setScore(0);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>🃏 Card Match</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc',
            padding: '0.375rem 0.75rem', borderRadius: '8px',
            fontSize: '0.75rem', fontWeight: 700
          }}>
            Moves: {moves}
          </span>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
            padding: '0.375rem 0.75rem', borderRadius: '8px',
            fontSize: '0.75rem', fontWeight: 700
          }}>
            Pairs: {matchedPairs}/{totalPairs}
          </span>
          <button onClick={onBack} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>← Back</button>
        </div>
      </div>

      {/* Instructions */}
      {!gameOver && (
        <p style={{ textAlign: 'center', color: '#34d399', fontWeight: 600, fontSize: '0.875rem' }}>
          Flip two cards to find a matching pair!
        </p>
      )}

      {/* Card Grid */}
      <div className="match-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`flip-card ${card.flipped || card.matched ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''} ${wrongIds.includes(card.id) ? 'is-wrong' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <span style={{ fontSize: '2.25rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>❓</span>
              </div>
              <div className="flip-card-back">
                <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 6px rgba(99,102,241,0.3))' }}>{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Over */}
      {gameOver && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>
            🎉 Score: {score}%
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Completed in {moves} moves
          </p>
          <div>
            <button onClick={resetGame} className="btn-primary" style={{ marginRight: '0.75rem' }}>🔄 Play Again</button>
            <button onClick={onBack} className="btn-outline">← Back to Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
