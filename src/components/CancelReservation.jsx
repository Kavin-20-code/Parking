import React, { useState } from 'react';
import { Ban, Calendar, CircleUser, Ticket, HelpCircle, Loader2 } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const CancelReservation = () => {
  const { bookings, cancelBooking } = useParking();
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeBookings = bookings.filter((b) => b.status === 'Active' || b.status === 'Completed');

  const handleCancelConfirm = () => {
    if (!selectedForCancel) return;
    setIsProcessing(true);
    setTimeout(() => {
      cancelBooking(selectedForCancel.id);
      setIsProcessing(false);
      setSelectedForCancel(null);
    }, 900);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Active Reservations</h1>
        <p className="page-subtitle">Manage bookings. Cancel to release spots back to the available pool.</p>
      </div>

      {activeBookings.length > 0 ? (
        <div className="active-reservations-grid">
          {activeBookings.map((b) => {
            const isEnded = b.status === 'Completed' || (new Date() >= new Date(`${b.exitDate}T${b.exitTime}`));
            
            return (
              <div 
                id={`active-reserve-card-${b.id}`} 
                key={b.id} 
                className="active-reserve-card"
                style={isEnded ? { 
                  opacity: 0.65, 
                  backgroundColor: '#f8fafc', 
                  borderColor: '#cbd5e1', 
                  filter: 'grayscale(0.3)',
                  pointerEvents: 'auto',
                  transition: 'all 0.3s'
                } : { transition: 'all 0.3s' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '800', background: isEnded ? '#e2e8f0' : 'var(--primary-light)', color: isEnded ? '#475569' : 'var(--primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--primary-border)' }}>Slot {b.slotNumber}</span>
                      {isEnded && (
                        <span style={{ fontSize: '9px', fontWeight: '800', background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>Ended & Released</span>
                      )}
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID: {b.id}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CircleUser size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Customer</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '13.5px', marginTop: '2px', display: 'block' }}>{b.customerName}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ticket size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Vehicle Number</span>
                        <span style={{ color: isEnded ? '#64748b' : 'var(--danger-text)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>{b.vehicleNumber}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Booking Schedule</span>
                        <span style={{ color: 'var(--text-main)', fontSize: '11px', fontWeight: '600', marginTop: '2px', display: 'block' }}>{b.bookingDate} at {b.entryTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isEnded ? (
                  <button 
                    id={`cancel-btn-${b.id}`} 
                    disabled={true} 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      fontSize: '11px', 
                      padding: '10px 16px', 
                      background: '#cbd5e1', 
                      color: '#64748b', 
                      border: '1px solid #cbd5e1', 
                      cursor: 'not-allowed',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 'bold'
                    }}
                  >
                    <Ban size={13} style={{ opacity: 0.5 }} /> <span>Booking Time Ended</span>
                  </button>
                ) : (
                  <button 
                    id={`cancel-btn-${b.id}`} 
                    onClick={() => setSelectedForCancel(b)} 
                    className="btn btn-cancel" 
                    style={{ width: '100%', fontSize: '11px', padding: '10px 16px' }}
                  >
                    <Ban size={13} /> <span>Cancel Reservation</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div id="no-active-reservations" style={{ padding: '60px', textAlign: 'center', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--border-radius)', backgroundColor: 'white' }}>
          <Ban size={42} style={{ marginBottom: '12px', color: 'var(--text-light)' }} />
          <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px', margin: '0 0 6px 0' }}>No Active Bookings</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>All parking spaces are vacant. Go to <strong>Book Parking</strong> to reserve a slot.</p>
        </div>
      )}

      {selectedForCancel && (
        <div id="cancel-modal-backdrop" className="modal-overlay" onClick={() => { if (!isProcessing) setSelectedForCancel(null); }}>
          <div id="cancel-modal-card" className="modal-content fade-in" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ margin: '0 auto 16px auto', width: 'fit-content', padding: '12px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '50%' }}><HelpCircle size={32} /></div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: '805' }}>Release Parking Space?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: '1.5', marginTop: '8px' }}>Cancel active reservation for slot <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{selectedForCancel.slotNumber}</strong>? This will update utilization stats.</p>
            </div>
            <div style={{ background: 'var(--secondary-light)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Customer:</span><span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{selectedForCancel.customerName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vehicle Number:</span><span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '700' }}>{selectedForCancel.vehicleNumber}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button id="cancel-abort-btn" onClick={() => setSelectedForCancel(null)} disabled={isProcessing} className="btn btn-danger-outline" style={{ flex: 1, padding: '10px' }}>Keep Slot Locked</button>
              <button id="cancel-confirm-btn" onClick={handleCancelConfirm} disabled={isProcessing} className="btn btn-primary" style={{ flex: 1, padding: '10px', background: 'var(--danger)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {isProcessing ? <><Loader2 size={14} className="animate-spin" /><span>Releasing...</span></> : <span>Release Space</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
