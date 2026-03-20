import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Bell, Mic, Camera, Users, Brain, ClipboardList,
  ArrowRight, Heart, Shield, Clock,
  Github, Twitter, Linkedin, Mail,
  Menu, X
} from 'lucide-react';
import { useState } from 'react';

/* ── Scroll-triggered fade wrapper ─────────────────── */
function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Feature data ──────────────────────────────────── */
const features = [
  { icon: Bell, title: 'Smart Reminders', desc: 'Timely medication alerts with real-time alarm notifications that ring until acknowledged by the patient.', color: '#818cf8' },
  { icon: Mic, title: 'Voice Confirmation', desc: 'Patients can confirm medicine intake through simple voice commands — no buttons needed.', color: '#22d3ee' },
  { icon: Camera, title: 'Camera Verification', desc: 'AI-powered pill recognition using the camera to verify the correct medicine is being taken.', color: '#34d399' },
  { icon: Users, title: 'Caregiver Dashboard', desc: 'Real-time monitoring for caregivers with adherence tracking, alerts, and patient management.', color: '#f472b6' },
  { icon: Brain, title: 'Cognitive Games', desc: 'Fun mini-games designed to stimulate cognitive function and slow mental decline.', color: '#fbbf24' },
  { icon: ClipboardList, title: 'Medication History', desc: 'Complete logs of every dose taken or missed, with filters and detailed analytics.', color: '#fb923c' },
];

/* ── Stats data ────────────────────────────────────── */
const stats = [
  { value: '55M+', label: 'People living with dementia worldwide' },
  { value: '60-70%', label: 'Of dementia cases are Alzheimer\'s' },
  { value: '70%', label: 'Patients forget medications regularly' },
  { value: '2x', label: 'Risk increases with missed doses' },
];

/* ── Nav links ─────────────────────────────────────── */
const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#f1f5f9', overflowX: 'hidden' }}>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.75rem' }}>💊</span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>MedReminder</span>
          </Link>

          {/* Desktop links */}
          <div className="landing-nav-links">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="landing-nav-link">{l.label}</a>
            ))}
            <Link to="/login" className="landing-nav-link">Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem' }}>
              Get Started <ArrowRight size={14} style={{ marginLeft: '0.25rem', display: 'inline' }} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="landing-mobile-menu"
          >
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
            ))}
            <Link to="/login" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }} onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="home" className="landing-hero">
        {/* Background decorative elements */}
        <div className="landing-hero-glow" />
        <div className="landing-hero-glow-2" />

        <div className="landing-container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="landing-hero-grid">
            {/* Text */}
            <div className="landing-hero-text">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="landing-pill-badge">
                  <Heart size={14} /> Built for Alzheimer's Care
                </span>
                <h1 className="landing-hero-h1">
                  Never Miss a{' '}
                  <span className="landing-gradient-text">Medicine</span>{' '}
                  Again
                </h1>
                <p className="landing-hero-subtitle">
                  A smart, compassionate medication reminder system designed specifically
                  for Alzheimer's patients and their caregivers. Voice-activated, camera-verified,
                  and always watching out for your loved ones.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              >
                <Link to="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <a href="#about" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                  Learn More
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}
              >
                {[
                  { icon: Shield, text: 'HIPAA Compliant' },
                  { icon: Clock, text: '24/7 Monitoring' },
                  { icon: Heart, text: 'Family-Friendly' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500 }}>
                    <Icon size={16} style={{ color: '#818cf8' }} />
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="landing-hero-visual"
            >
              <div className="landing-hero-circle">
                <div className="landing-hero-card">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>MedReminder</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    Smart medicine reminders powered by AI, voice recognition, and real-time monitoring
                  </p>
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {[Bell, Mic, Camera].map((Icon, i) => (
                      <div key={i} style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.15)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} style={{ color: '#a5b4fc' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating pills */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="landing-float-badge"
                style={{ top: '10%', right: '5%' }}
              >
                🔔 Reminder Set!
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="landing-float-badge"
                style={{ bottom: '15%', left: '0%' }}
              >
                ✅ Dose Confirmed
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT ALZHEIMER'S ═══════════════════ */}
      <section id="about" className="landing-section">
        <div className="landing-container">
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="landing-section-tag">Understanding the Challenge</span>
              <h2 className="landing-section-h2">
                About <span className="landing-gradient-text">Alzheimer's</span> Disease
              </h2>
              <p className="landing-section-subtitle">
                Alzheimer's is a progressive neurological disorder that causes memory loss,
                confusion, and behavioural changes. One of the most critical challenges patients
                face is consistently remembering to take their medications on time.
              </p>
            </div>
          </FadeIn>

          {/* Stats row */}
          <div className="landing-stats-grid">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="stat-card" style={{ padding: '2rem 1.5rem' }}>
                  <p className="stat-value" style={{ color: i % 2 === 0 ? '#818cf8' : '#22d3ee' }}>{s.value}</p>
                  <p className="stat-label" style={{ marginTop: '0.75rem' }}>{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Info text */}
          <FadeIn delay={0.3}>
            <div className="landing-about-card glass-card" style={{ marginTop: '3rem', padding: '2.5rem' }}>
              <div className="landing-about-grid">
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
                    Why Medication Adherence Matters
                  </h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.9375rem' }}>
                    For Alzheimer's patients, medication adherence is critical for slowing
                    disease progression. Missed doses can lead to accelerated cognitive decline,
                    increased hospitalisations, and a higher burden on caregivers. Studies show
                    that technology-assisted reminders can improve adherence rates by up to 40%.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
                    How MedReminder Helps
                  </h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.9375rem' }}>
                    MedReminder combines smart scheduling, multi-modal confirmation (voice, camera,
                    manual), and real-time caregiver alerts to create a safety net around the patient.
                    Our cognitive mini-games also provide gentle brain exercise, while the full
                    medication history gives caregivers peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="landing-section" style={{ paddingTop: '2rem' }}>
        <div className="landing-container">
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="landing-section-tag">What We Offer</span>
              <h2 className="landing-section-h2">
                Powerful <span className="landing-gradient-text">Features</span>
              </h2>
              <p className="landing-section-subtitle">
                Every feature is designed with empathy, built for simplicity, and driven by the
                goal of keeping patients safe and caregivers informed.
              </p>
            </div>
          </FadeIn>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="landing-feature-card glass-card">
                  <div className="landing-feature-icon" style={{ background: `${f.color}20` }}>
                    <f.icon size={24} style={{ color: f.color }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="landing-section" style={{ paddingBottom: '5rem' }}>
        <div className="landing-container">
          <FadeIn>
            <div className="landing-cta glass-card">
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '1rem', lineHeight: 1.3 }}>
                Ready to Care <span className="landing-gradient-text">Smarter</span>?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '32rem', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Join families who trust MedReminder to keep their loved ones safe.
                Sign up in under a minute — it's free.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Create Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-outline" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💊</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MedReminder</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: '18rem' }}>
                Smart Medicine Reminder for Alzheimer's Patients. Built with care, powered by technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="landing-footer-heading">Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <a href="#home" className="landing-footer-link">Home</a>
                <a href="#about" className="landing-footer-link">About</a>
                <a href="#features" className="landing-footer-link">Features</a>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="landing-footer-heading">Account</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Link to="/login" className="landing-footer-link">Login</Link>
                <Link to="/register" className="landing-footer-link">Register</Link>
              </div>
            </div>

            {/* Contact / Social */}
            <div>
              <h4 className="landing-footer-heading">Connect</h4>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="landing-social-icon" aria-label="Social link">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="landing-footer-bottom">
            <p>© 2026 MedReminder. All rights reserved.</p>
            <p>Made with <Heart size={14} style={{ color: '#ef4444', display: 'inline', verticalAlign: 'middle' }} /> for Alzheimer's awareness</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
