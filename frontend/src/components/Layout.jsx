import Navbar from './Navbar';

/**
 * Layout component wraps authenticated pages with the Navbar and Footer.
 * Uses flex column to ensure the footer stays at the bottom.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="app-footer">
        <p>💊 MedReminder — Smart Medicine Reminder for Alzheimer's Patients</p>
        <p style={{ marginTop: '0.25rem', opacity: 0.6 }}>Built with care ❤️</p>
      </footer>
    </div>
  );
}
