import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SLOTS } from '../data/parkingSlots.js';

const ParkingContext = createContext(undefined);

const getLocal = (key, def) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : def;
};

export const ParkingProvider = ({ children }) => {
  const [slots, setSlots] = useState(() => getLocal('car_parking_slots', INITIAL_SLOTS));
  const [bookings, setBookings] = useState(() => getLocal('car_parking_bookings', []));
  const [smsLogs, setSmsLogs] = useState(() => getLocal('car_parking_sms_logs', []));
  const [vehicleType, setVehicleType] = useState('Car');
  const [toasts, setToasts] = useState([]);

  useEffect(() => { localStorage.setItem('car_parking_slots', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('car_parking_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('car_parking_sms_logs', JSON.stringify(smsLogs)); }, [smsLogs]);

  useEffect(() => {
    const root = document.documentElement;
    const themes = {
      Bike: {
        primary: '#f59e0b',
        primaryHover: '#d97706',
        primaryLight: '#fffbeb',
        primaryBorder: '#fde68a',
        primaryDark: '#78350f',
        bgApp: '#faf6f0',
        bgCard: '#ffffff',
        bgLight: '#fcf2e6',
        textMain: '#451a03',
        textMuted: '#78350f',
        textLight: '#b45309',
        borderColor: '#fed7aa',
        borderFocus: '#f59e0b',
      },
      Car: {
        primary: '#4f46e5',
        primaryHover: '#4338ca',
        primaryLight: '#eff6ff',
        primaryBorder: '#e0e7ff',
        primaryDark: '#3730a3',
        bgApp: '#f8fafc',
        bgCard: '#ffffff',
        bgLight: '#f1f5f9',
        textMain: '#0f172a',
        textMuted: '#64748b',
        textLight: '#94a3b8',
        borderColor: '#e2e8f0',
        borderFocus: '#4f46e5',
      },
      SUV: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryLight: '#f5f3ff',
        primaryBorder: '#ddd6fe',
        primaryDark: '#5b21b6',
        bgApp: '#fbfaff',
        bgCard: '#ffffff',
        bgLight: '#f3eefc',
        textMain: '#1e1b4b',
        textMuted: '#58508d',
        textLight: '#8b5cf6',
        borderColor: '#e9e3f8',
        borderFocus: '#8b5cf6',
      },
      ElectricVehicle: {
        primary: '#10b981',
        primaryHover: '#059669',
        primaryLight: '#f0fbf6',
        primaryBorder: '#d1fae5',
        primaryDark: '#064e3b',
        bgApp: '#ecf8f3',
        bgCard: '#ffffff',
        bgLight: '#def5ea',
        textMain: '#062c1e',
        textMuted: '#1e4a38',
        textLight: '#527d6d',
        borderColor: '#c2eed8',
        borderFocus: '#10b981',
      },
    };

    const theme = themes[vehicleType] || themes.Car;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-hover', theme.primaryHover);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--primary-border', theme.primaryBorder);
    root.style.setProperty('--primary-dark', theme.primaryDark);
    
    root.style.setProperty('--bg-app', theme.bgApp);
    root.style.setProperty('--bg-card', theme.bgCard);
    root.style.setProperty('--bg-light', theme.bgLight);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--text-light', theme.textLight);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--border-focus', theme.borderFocus);
  }, [vehicleType]);

  useEffect(() => {
    const checkExpired = () => {
      const now = new Date();
      setBookings((prev) => {
        let changed = false;
        const next = prev.map((b) => {
          if (b.status === 'Active' && now >= new Date(`${b.exitDate}T${b.exitTime}`)) {
            changed = true;
            return { ...b, status: 'Completed' };
          }
          return b;
        });
        if (changed) {
          const actives = next.filter((b) => b.status === 'Active').map((b) => b.slotNumber);
          setSlots((sPrev) => sPrev.map((s) => ({ ...s, status: actives.includes(s.id) ? 'Booked' : 'Available' })));
          return next;
        }
        return prev;
      });
    };
    checkExpired();
    const interval = setInterval(checkExpired, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const clearSMSLogs = () => setSmsLogs([]);

  const bookSlot = (data) => {
    const bId = 'B' + Date.now().toString().slice(-6);
    const newBooking = { ...data, id: bId, status: 'Active' };
    setSlots((prev) => prev.map((s) => s.id === data.slotNumber ? { ...s, status: 'Booked' } : s));
    setBookings((prev) => [newBooking, ...prev]);

    const fDate = new Date(data.bookingDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const msg = `Dear ${data.customerName}, your reservation for Parking Slot ${data.slotNumber} (${data.vehicleType}) on ${fDate} is confirmed. Entry: ${data.entryTime}, Exit: ${data.exitTime}. Duration: ${data.duration} hrs. Final Total: ₹${data.finalAmount}. Ref ID: ${bId}. Thank you for using ParkEasy.`;
    const logId = 'SMS-' + Date.now().toString().slice(-6);
    const logVal = {
      id: logId, mobileNumber: data.mobileNumber, customerName: data.customerName, message: msg,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Sending', type: 'Confirmation', slotNumber: data.slotNumber,
    };
    setSmsLogs((prev) => [logVal, ...prev]);
    showToast(`Reservation Confirmed successfully. Automated SMS confirmation dispatched to +91 ${data.mobileNumber}.`, 'success');
    setTimeout(() => {
      setSmsLogs((prev) => prev.map((log) => log.id === logId ? { ...log, status: 'Delivered' } : log));
      showToast(`SMS message successfully delivered to +91 ${data.mobileNumber}.`, 'info');
    }, 2000);
  };

  const cancelBooking = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    setSlots((prev) => prev.map((s) => s.id === booking.slotNumber ? { ...s, status: 'Available' } : s));
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'Cancelled' } : b));

    const msg = `Dear ${booking.customerName}, your reservation for Parking Slot ${booking.slotNumber} has been successfully cancelled. A full refund of ₹${booking.finalAmount || 0} has been processed. Reference ID: ${id}.`;
    const logId = 'SMS-' + Date.now().toString().slice(-6);
    const logVal = {
      id: logId, mobileNumber: booking.mobileNumber, customerName: booking.customerName, message: msg,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Sending', type: 'Cancellation', slotNumber: booking.slotNumber,
    };
    setSmsLogs((prev) => [logVal, ...prev]);
    showToast(`Reservation Cancelled. Revocation notification SMS dispatched to +91 ${booking.mobileNumber}.`, 'success');
    setTimeout(() => {
      setSmsLogs((prev) => prev.map((log) => log.id === logId ? { ...log, status: 'Delivered' } : log));
      showToast(`Cancellation receipt successfully delivered to +91 ${booking.mobileNumber}.`, 'info');
    }, 2000);
  };

  return (
    <ParkingContext.Provider value={{ slots, bookings, smsLogs, bookSlot, cancelBooking, toasts, showToast, removeToast, clearSMSLogs, vehicleType, setVehicleType }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) throw new Error('useParking must be used within a ParkingProvider');
  return context;
};
