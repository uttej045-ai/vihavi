import React, { useEffect, useState } from 'react';
import { QrCode, ShieldAlert, CheckCircle2, Search, ArrowRight, Camera } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function QRScanner() {
  const [ticketId, setTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState('');
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'error'|'warning', message: '', details: {} }
  const [allBookings, setAllBookings] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScannerData = async () => {
    try {
      setIsLoading(true);
      const bookings = await dbService.getAll('bookings');
      const atts = await dbService.getAll('attendees');
      const evs = await dbService.getAll('events');
      setAllBookings(bookings);
      setAttendees(atts);
      setEvents(evs);
    } catch (err) {
      console.error('Failed to load scan records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScannerData();
  }, []);

  const handleScan = async (scannedId) => {
    if (!scannedId) return;
    
    setScanResult(null);
    const booking = allBookings.find(b => String(b.id) === String(scannedId));
    
    if (!booking) {
      setScanResult({
        status: 'error',
        message: 'Invalid Ticket QR Code! Ticket ID does not exist in our database.',
        details: null
      });
      return;
    }

    const attendee = attendees.find(a => String(a.bookingId) === String(scannedId));
    const event = events.find(e => String(e.id) === String(booking.eventId));

    // 1. Check booking confirmation status
    if (booking.status !== 'Confirmed') {
      setScanResult({
        status: 'error',
        message: `Check-in Failed: Ticket booking is currently ${booking.status.toUpperCase()}.`,
        details: {
          name: booking.userName,
          event: event ? event.name : 'Unknown Event',
          ticket: booking.ticketName
        }
      });
      return;
    }

    // 2. Check for duplicate scan
    if (attendee && attendee.checkedIn) {
      setScanResult({
        status: 'warning',
        message: 'WARNING: Duplicate Check-In Detected!',
        details: {
          name: booking.userName,
          event: event ? event.name : 'Unknown Event',
          ticket: booking.ticketName,
          checkedInAt: attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'N/A'
        }
      });
      return;
    }

    // 3. Complete successful check-in
    try {
      const nowStr = new Date().toISOString();
      
      // Update attendee in database
      if (attendee) {
        await dbService.update('attendees', attendee.id, {
          checkedIn: true,
          checkedInAt: nowStr
        });
      } else {
        // Create attendee record if missing
        await dbService.create('attendees', {
          bookingId: booking.id,
          eventId: booking.eventId,
          name: booking.userName,
          email: booking.userEmail,
          phone: booking.userPhone || '',
          company: 'Checked In via QR',
          checkedIn: true,
          checkedInAt: nowStr
        });
      }

      // Update booking status
      await dbService.update('bookings', booking.id, {
        checkInStatus: 'Checked In',
        checkedInAt: nowStr
      });

      // Create check-in log notification
      await dbService.create('notifications', {
        type: 'system',
        message: `Check-In successful: ${booking.userName} checked in for ${event ? event.name : 'event'}.`,
        timestamp: nowStr,
        read: false
      });

      setScanResult({
        status: 'success',
        message: `Access Granted! Check-in successful. Welcome, ${booking.userName}!`,
        details: {
          name: booking.userName,
          event: event ? event.name : 'Unknown Event',
          ticket: booking.ticketName,
          checkedInAt: nowStr
        }
      });

      // Refresh data
      loadScannerData();
    } catch (err) {
      setScanResult({
        status: 'error',
        message: `System Error processing check-in: ${err.message}`,
        details: null
      });
    }
  };

  if (isLoading) {
    return <div className="organizer-loading">Calibrating QR Check-In Scanner...</div>;
  }

  return (
    <div className="org-scanner-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="org-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>QR Ticket Check-In</h1>
        <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Scan customer tickets to verify entry credentials and prevent duplicates.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Glowing Simulated Scanner Screen */}
        <div className="luxury-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
          
          <div className="scanner-glowing-box" style={{
            position: 'relative',
            width: '220px',
            height: '220px',
            border: '3px solid var(--org-gold)',
            borderRadius: '16px',
            background: 'rgba(0,0,0,0.4)',
            boxShadow: '0 0 20px rgba(212,175,55,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '30px'
          }}>
            {/* Holographic Laser line scanning up and down */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, rgba(212,175,55,0) 0%, #D4AF37 50%, rgba(212,175,55,0) 100%)',
              boxShadow: '0 0 10px #D4AF37',
              animation: 'laserScan 2.5s infinite ease-in-out',
              top: 0
            }}></div>
            <style>{`
              @keyframes laserScan {
                0% { top: 0%; }
                50% { top: 98%; }
                100% { top: 0%; }
              }
            `}</style>
            
            <QrCode size={100} color="rgba(212,175,55,0.4)" />
            <Camera size={24} color="var(--org-gold)" style={{ position: 'absolute', top: '10px', right: '10px' }} />
          </div>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--org-text-muted)', fontWeight: 'bold' }}>Simulate Scan (Pick a registered ticket)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="luxury-select"
                value={selectedTicket}
                onChange={(e) => {
                  setSelectedTicket(e.target.value);
                  setTicketId(e.target.value);
                }}
              >
                <option value="">Select Ticket Holder...</option>
                {allBookings.map(b => (
                  <option key={b.id} value={b.id}>{b.id} - {b.userName} ({b.ticketName})</option>
                ))}
              </select>
              <button 
                type="button" 
                className="luxury-btn-primary" 
                style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}
                onClick={() => handleScan(ticketId)}
              >
                Scan <ArrowRight size={14} style={{ marginLeft: '6px' }} />
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Or manual input Ticket ID (e.g. 101)" 
                className="luxury-input" 
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Scan Results Message Panel */}
        {scanResult && (
          <div className="luxury-card animated fadeInUp" style={{
            borderColor: scanResult.status === 'success' 
              ? '#52c41a' 
              : scanResult.status === 'warning' 
              ? '#faad14' 
              : '#ff4d4f',
            background: 'rgba(20,20,22,0.95)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                {scanResult.status === 'success' && <CheckCircle2 size={36} color="#52c41a" />}
                {scanResult.status === 'warning' && <ShieldAlert size={36} color="#faad14" />}
                {scanResult.status === 'error' && <ShieldAlert size={36} color="#ff4d4f" />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: scanResult.status === 'success' 
                    ? '#52c41a' 
                    : scanResult.status === 'warning' 
                    ? '#faad14' 
                    : '#ff4d4f',
                  fontSize: '18px',
                  margin: 0
                }}>{scanResult.message}</h3>

                {scanResult.details && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#e0e0e0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <div><strong>Customer Name:</strong> {scanResult.details.name}</div>
                    <div><strong>Event:</strong> {scanResult.details.event}</div>
                    <div><strong>Ticket Type:</strong> {scanResult.details.ticket}</div>
                    
                    {scanResult.status === 'success' && (
                      <div style={{ color: '#52c41a', marginTop: '6px' }}>
                        <strong>Check-In Timestamp:</strong> {new Date(scanResult.details.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                    
                    {scanResult.status === 'warning' && (
                      <div style={{ color: '#faad14', background: 'rgba(250,173,20,0.08)', padding: '10px', borderRadius: '6px', marginTop: '8px', border: '1px solid rgba(250,173,20,0.2)' }}>
                        <strong>ERROR:</strong> Scanned ticket was already checked in at <strong>{scanResult.details.checkedInAt}</strong>. Duplicate entry blocked.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
