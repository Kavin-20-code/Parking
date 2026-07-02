import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';

// Context & Views
import { ParkingProvider, useParking } from './context/ParkingContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Home } from './components/Home.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { ParkingSlots } from './components/ParkingSlots.jsx';
import { BookParking } from './components/BookParking.jsx';
import { BookingHistory } from './components/BookingHistory.jsx';
import { CancelReservation } from './components/CancelReservation.jsx';
import { SMSMonitor } from './components/SMSMonitor.jsx';

const AppContent = () => {
  const { toasts, removeToast } = useParking();

  return (
    <div className="app-container">
      {/* High-fidelity Custom Navbar */}
      <Navbar />

      {/* Floating Simulation Dashboard helper */}
      <SMSMonitor />

      {/* Primary Routing Screen */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/slots" element={<ParkingSlots />} />
          <Route path="/book" element={<BookParking />} />
          <Route path="/history" element={<BookingHistory />} />
          <Route path="/cancel" element={<CancelReservation />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Human styled simple footer line */}
      <footer className="footer-area">
        &copy; {new Date().getFullYear()} PARKEASY - SIMPLIFIED OFFLINE VEHICLE PARKING MANAGER
      </footer>

      {/* Pure CSS Toast Alerts Interface */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            id={`toast-alert-${toast.id}`}
            key={toast.id}
            className={`custom-toast-alert ${
              toast.type === 'success' ? 'success' : toast.type === 'error' ? 'error' : 'info'
            }`}
          >
            <div className="custom-toast-message">
              {toast.message}
            </div>
            <button
              id={`dismiss-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="custom-toast-close"
              title="Close Notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ParkingProvider>
      <Router>
        <AppContent />
      </Router>
    </ParkingProvider>
  );
}
