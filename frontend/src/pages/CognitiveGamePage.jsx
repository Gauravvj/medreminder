import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

/**
 * CognitiveGamePage — Pattern Memory and Number Recall mini-games.
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
            <div className="game-card" onClick={() => setActiveGame('reaction')}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🎯</span>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>Speed Reaction</h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Click the targets as fast as you can</p>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)' }}>▶ Play Fast</button>
            </div>
          </div>
        ) : activeGame === 'pattern' ? (
          <PatternGame onFinish={(s) => { saveResult('pattern_memory', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        ) : activeGame === 'number' ? (
          <NumberGame onFinish={(s) => { saveResult('number_recall', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        ) : (
          <ReactionGame onFinish={(s) => { saveResult('speed_reaction', s); setActiveGame(null); }} onBack={() => setActiveGame(null)} />
        )}

        {/* Recent Results */}
        {results.length > 0 && (
          <div>
            <h2 className="section-heading">📊 Recent Results</h2>
            <div className="stats-grid-4">
              {results.slice(0, 8).map(r => (
                <div key={r._id} className="stat-card">
                  <span style={{ fontSize: '1.5rem' }}>{r.gameType === 'pattern_memory' ? '🎨' : '🔢'}</span>
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

/** Speed Reaction Game */
function ReactionGame({ onFinish, onBack }) {
  const [activeSquare, setActiveSquare] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds game
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const moveTarget = useCallback(() => {
    let nextPos;
    do {
      nextPos = Math.floor(Math.random() * 9);
    } while (nextPos === activeSquare);
    setActiveSquare(nextPos);
  }, [activeSquare]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setPlaying(true);
    setGameOver(false);
    moveTarget();
  };

  useEffect(() => {
    let timer;
    if (playing && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (playing && timeLeft === 0) {
      setPlaying(false);
      setGameOver(true);
      setActiveSquare(null);
      // Calc score: 25 clicks = 100%
      const finalScore = Math.min(100, Math.round((score / 25) * 100));
      onFinish(finalScore);
    }
    return () => clearTimeout(timer);
  }, [playing, timeLeft, score, onFinish]);

  const handleSquareClick = (idx) => {
    if (!playing) return;
    if (idx === activeSquare) {
      setScore(s => s + 1);
      moveTarget();
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>🎯 Speed Reaction</h2>
        <button onClick={onBack} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>← Back</button>
      </div>
      
      {!playing && !gameOver ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '300px' }}>
            Click the green targets as fast as you can. You have 30 seconds. Ready?
          </p>
          <button onClick={startGame} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)', padding: '0.75rem 2.5rem', fontSize: '1.125rem' }}>
            START
          </button>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 1rem' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>⏳ {timeLeft}s</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>Score: {score}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                onClick={() => handleSquareClick(i)}
                style={{
                  width: '5.5rem', height: '5.5rem', borderRadius: '12px',
                  background: activeSquare === i ? 'radial-gradient(circle, #34d399 20%, #10b981 100%)' : 'rgba(30, 41, 59, 0.6)',
                  boxShadow: activeSquare === i ? '0 0 20px rgba(52, 211, 153, 0.6), inset 0 0 10px rgba(255,255,255,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  cursor: activeSquare === i ? 'pointer' : 'default',
                  transition: 'all 0.1s',
                  transform: activeSquare === i ? 'scale(1.05)' : 'scale(1)',
                  border: activeSquare === i ? '2px solid #a7f3d0' : '1px solid rgba(255,255,255,0.05)'
                }}
              />
            ))}
          </div>
        </>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Time's Up!</p>
          <p style={{ fontSize: '1.25rem', color: '#fbbf24', marginTop: '0.5rem' }}>You hit {score} targets.</p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem' }}>Result saved to your progress.</p>
        </div>
      )}
    </div>
  );
}
