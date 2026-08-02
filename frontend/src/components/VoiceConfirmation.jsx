import { useState, useRef, useEffect } from 'react';

/**
 * VoiceConfirmation component.
 * Uses the Web Speech Recognition API to detect when a patient says
 * "I took my medicine" (or similar phrases).
 * Includes: timeout auto-stop, stop button, improved error handling,
 * and broader keyword matching.
 */
export default function VoiceConfirmation({ onConfirm }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('');
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopListening = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore errors on abort
      }
      recognitionRef.current = null;
    }
    setListening(false);
  };

  // Cleanup on unmount (stopListening is defined before this)
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('❌ Speech Recognition not supported. Please use Chrome or Edge.');
      return;
    }

    // Check for HTTPS (required for speech recognition in most browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setStatus('⚠️ Speech Recognition requires HTTPS or localhost.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3; // Get multiple alternatives for better matching
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setStatus('🎙️ Listening... Say "I took my medicine"');
      setTranscript('');

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        setStatus('⏰ Timed out. Please try again.');
        stopListening();
      }, 10000);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Check all alternatives for matches
      let matched = false;
      let bestTranscript = '';

      for (let i = 0; i < event.results[0].length; i++) {
        const speech = event.results[0][i].transcript.toLowerCase();
        if (!bestTranscript) bestTranscript = speech;

        // Confirmation keywords
        const confirmPhrases = [
          // Direct medicine phrases
          speech.includes('took') && (speech.includes('medicine') || speech.includes('pill') || speech.includes('tablet') || speech.includes('medication')),
          speech.includes('taken') && (speech.includes('medicine') || speech.includes('pill') || speech.includes('tablet') || speech.includes('medication')),
          // Simple confirmations
          speech.includes('yes'),
          speech.includes('done'),
          speech.includes('confirmed'),
          speech.includes('i did'),
          speech.includes('took it'),
          speech.includes('taken it'),
          // Hindi / common
          speech.includes('haan'),
          speech.includes('le liya'),
          speech.includes('kha liya'),
        ];

        if (confirmPhrases.some(Boolean)) {
          matched = true;
          bestTranscript = speech;
          break;
        }
      }

      setTranscript(bestTranscript);

      if (matched) {
        setStatus('✅ Voice confirmed! Medicine intake recorded.');
        onConfirm?.('voice');
      } else {
        setStatus('⚠️ Could not understand. Say "yes", "done", or "I took my medicine".');
      }
    };

    recognition.onerror = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setListening(false);
      recognitionRef.current = null;

      // User-friendly error messages
      const errorMessages = {
        'not-allowed': '🔒 Microphone access denied. Please allow microphone permission.',
        'no-speech': '🔇 No speech detected. Please try again and speak clearly.',
        'audio-capture': '🎤 No microphone found. Please connect a microphone.',
        'network': '🌐 Network error. Check your internet connection.',
        'aborted': '', // User cancelled — no message needed
      };

      const msg = errorMessages[event.error] || `❌ Error: ${event.error}`;
      if (msg) setStatus(msg);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setStatus('❌ Failed to start speech recognition. Please try again.');
      setListening(false);
    }
  };

  return (
    <div className="confirm-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎤</span>
        <div>
          <h3>Voice Confirmation</h3>
          <p className="confirm-subtitle">Say "I took my medicine" to confirm</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={listening ? stopListening : startListening}
          className={listening ? 'btn-danger' : 'btn-primary'}
          style={{
            flex: 1,
            padding: '0.875rem',
            fontSize: '0.8125rem',
            borderRadius: '12px',
          }}
        >
          {listening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </button>
      </div>

      {listening && (
        <div className="voice-listening" style={{
          padding: '0.75rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#fca5a5',
          fontWeight: 600,
        }}>
          🎙️ Listening... speak now (auto-stops in 10s)
        </div>
      )}

      {transcript && (
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Heard: <span style={{ color: '#e2e8f0', fontStyle: 'italic' }}>"{transcript}"</span>
        </p>
      )}

      {status && !listening && (
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: status.includes('✅') ? '#34d399' :
            status.includes('❌') || status.includes('🔒') ? '#f87171' :
              status.includes('⏰') ? '#fbbf24' : '#fbbf24'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}
