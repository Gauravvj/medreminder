import { useState, useRef, useEffect } from 'react';

// AI Service URL — change this if the AI service runs on a different host/port
const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

/**
 * CameraVerification component.
 * Lets the patient show their pill to the camera, captures a frame,
 * and sends it to the AI microservice for verification.
 * Falls back to simulated verification if the AI service is unavailable.
 */
export default function CameraVerification({ expectedPill, onVerified }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Attach stream to video element AFTER it renders in the DOM
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => { });
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setResult(null);
      // Set cameraActive FIRST so the <video> element renders,
      // then the useEffect above will attach the stream
      setCameraActive(true);
    } catch (err) {
      const errorMessages = {
        'NotAllowedError': '🔒 Camera access denied. Please allow camera permission in your browser settings.',
        'NotFoundError': '📷 No camera found. Please connect a camera device.',
        'NotReadableError': '📷 Camera is in use by another application.',
        'OverconstrainedError': '📷 Camera does not meet requirements.',
      };
      setResult({
        success: false,
        message: errorMessages[err.name] || `❌ Could not access camera: ${err.message}`
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  /**
   * Capture a frame from the video stream and send it to the AI service.
   * Falls back to simulated verification if the AI service is unreachable.
   */
  const captureAndVerify = async () => {
    if (!videoRef.current) return;

    setVerifying(true);
    setResult(null);

    try {
      // Create a canvas to capture the video frame
      const canvas = canvasRef.current || document.createElement('canvas');
      canvasRef.current = canvas;
      const video = videoRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (!blob) {
        throw new Error('Failed to capture image from camera');
      }

      // Create form data to send to AI service
      const formData = new FormData();
      formData.append('image', blob, 'pill_capture.jpg');
      if (expectedPill) {
        formData.append('expected_pill', expectedPill);
      }

      // Try to send to the AI microservice
      let aiResult = null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(`${AI_SERVICE_URL}/verify-pill`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          aiResult = await response.json();
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        // AI service is not available or timed out — fall back to simulation
        if (fetchErr.name === 'AbortError') {
          console.warn('AI service request timed out after 15 seconds.');
        } else {
          console.warn('AI service unavailable:', fetchErr.message);
        }
      }

      if (aiResult) {
        // We got a real response from the AI service
        if (aiResult.verified) {
          setResult({
            success: true,
            message: `✅ Pill verified! ${aiResult.pill_name} — Confidence: ${Math.round(aiResult.confidence * 100)}%`,
            confidence: aiResult.confidence,
            pillName: aiResult.pill_name,
          });
          onVerified?.('camera');
        } else {
          setResult({
            success: false,
            message: `⚠️ Could not verify pill (${Math.round(aiResult.confidence * 100)}% confidence). Please ensure the pill label is clearly visible.`,
            confidence: aiResult.confidence,
          });
        }
      } else {
        // Fallback: simulated verification removed to avoid false positives
        setResult({
          success: false,
          message: '⚠️ AI service offline. Please start the ai-service backend.',
          simulated: true,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: `❌ Verification failed: ${err.message}`,
      });
    } finally {
      setVerifying(false);
      stopCamera();
    }
  };

  return (
    <div className="confirm-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📷</span>
        <div>
          <h3>Camera Pill Verification</h3>
          <p className="confirm-subtitle">Show your pill to the camera for AI verification</p>
        </div>
      </div>

      {!cameraActive ? (
        <button onClick={startCamera} className="btn-outline" style={{ width: '100%', fontSize: '0.8125rem', padding: '0.875rem' }}>
          📸 Open Camera to Verify Pill
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            {verifying && (
              <div className="camera-overlay">
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner">⚙️</div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.5rem' }}>Analyzing pill with AI...</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={captureAndVerify}
              disabled={verifying}
              className="btn-success"
              style={{ flex: 1, fontSize: '0.8125rem', padding: '0.625rem' }}
            >
              {verifying ? '⏳ Verifying...' : '📸 Capture & Verify'}
            </button>
            <button
              onClick={stopCamera}
              className="btn-danger"
              style={{ fontSize: '0.8125rem', padding: '0.625rem 1rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: result.success ? '#34d399' : '#f87171'
          }}>
            {result.message}
          </p>
          {result.confidence != null && (
            <div className="confidence-bar">
              <div
                className="fill"
                style={{
                  width: `${Math.round(result.confidence * 100)}%`,
                  background: result.success
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                }}
              />
            </div>
          )}
          {result.simulated && (
            <p style={{ fontSize: '0.6875rem', color: '#64748b', fontStyle: 'italic' }}>
              💡 Start the AI service (`python main.py` in ai-service/) for real pill verification
            </p>
          )}
        </div>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
