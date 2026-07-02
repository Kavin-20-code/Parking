import React, { useState, useEffect, useRef } from 'react';
import { Mail, Trash2, Smartphone, ChevronDown, CheckCheck, Loader2, X } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const SMSMonitor = () => {
  const { smsLogs, clearSMSLogs } = useParking();
  const [isOpen, setIsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  
  const timerRef = useRef(null);
  const notifiedIdRef = useRef(null);

  const playChime = (isDelivery) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), gain = ctx.createGain();
      
      osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      
      if (isDelivery) {
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08);
        osc2.frequency.setValueAtTime(698.46, ctx.currentTime);
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.start(); osc2.stop(ctx.currentTime + 0.35);
      } else {
        osc1.frequency.setValueAtTime(440.0, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      }
      osc1.start(); osc1.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  useEffect(() => {
    if (smsLogs.length > 0) {
      const latest = smsLogs[0];
      if (notifiedIdRef.current !== latest.id) {
        notifiedIdRef.current = latest.id;
        playChime(latest.status === 'Delivered');
        setActiveAlert(latest);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { setActiveAlert(null); timerRef.current = null; }, 5000);
      } else if (activeAlert && activeAlert.id === latest.id && activeAlert.status !== latest.status) {
        setActiveAlert(latest);
        if (latest.status === 'Delivered') playChime(true);
      }
    } else {
      setActiveAlert(null);
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      notifiedIdRef.current = null;
    }
  }, [smsLogs, activeAlert]);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return (
    <>
      {activeAlert && (
        <div className="toast success fade-in" style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, boxShadow: 'var(--shadow-lg)', maxWidth: '340px', width: '100%', backgroundColor: '#0f172a', borderLeft: '4px solid var(--primary)', color: 'white', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SMS Dispatch Simulation</span>
                <button id="close-sms-popup-btn" onClick={() => { setActiveAlert(null); if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } }} style={{ color: 'var(--text-light)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={14} /></button>
              </div>
              <span style={{ fontWeight: '700', fontSize: '11px', color: 'white' }}>To: +91 {activeAlert.mobileNumber}</span>
              <p style={{ margin: '4px 0', fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.4' }}>"{activeAlert.message}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Slot: {activeAlert.slotNumber}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: activeAlert.status === 'Delivered' ? 'var(--success)' : 'var(--warning)' }}>
                  {activeAlert.status === 'Delivered' ? <><CheckCheck size={12} /> Delivered</> : <><Loader2 size={12} className="animate-spin" /> Transmitting</>}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="sms-console-fixed fade-in">
          <div className="sms-console-header">
            <div className="sms-console-logo">
              <Smartphone size={16} className="sms-console-logo-icon" />
              <div>
                <h3 className="sms-console-title">SMS Logs</h3>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none' }} title="Close Panel"><ChevronDown size={16} /></button>
          </div>

          <div className="sms-console-logs-list">
            {smsLogs.length > 0 ? (
              smsLogs.map((log) => (
                <div key={log.id} className={`sms-log-item ${log.type}`}>
                  <div className="sms-log-item-header">
                     <span className="sms-log-item-tag">{log.type} notice</span> <span className="sms-log-item-time">{log.timestamp}</span>
                  </div>
                  <p className="sms-log-item-text">"{log.message}"</p>
                  <div className="sms-log-item-footer">
                    <span>Target: +91 {log.mobileNumber}</span>
                    <span className={`sms-log-item-status ${log.status === 'Delivered' ? 'delivered' : 'sending'}`}>
                      {log.status === 'Delivered' ? <><CheckCheck size={10} /> Delivered</> : <><Loader2 size={10} className="animate-spin" /> Sending</>}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="sms-console-empty">
                <Mail size={32} style={{ marginBottom: '8px', color: '#475569', display: 'block', margin: '0 auto 8px auto' }} />
                <p style={{ fontWeight: 'bold' }}>No texts sent yet</p>
                <p style={{ fontSize: '10px', marginTop: '4px', lineHeight: '1.4' }}>Receipts will show up here as soon as spots are reserved or released.</p>
              </div>
            )}
          </div>

          
        </div>
      )}

      <button id="sms-dispatch-gateway-trigger-badge" onClick={() => setIsOpen(!isOpen)} className="sms-panel-toggle">
        <span className="sms-badge-dot" style={{ backgroundColor: smsLogs.length > 0 ? 'var(--success)' : 'var(--warning)' }} />
        <span>SMS Gateway</span>
        {smsLogs.length > 0 && <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '50px' }}>{smsLogs.length}</span>}
      </button>
    </>
  );
};
