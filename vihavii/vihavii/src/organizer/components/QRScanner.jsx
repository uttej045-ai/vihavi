import React, { useEffect, useState } from 'react';
import { QrCode, ShieldAlert, CheckCircle2, Search, ArrowRight, Camera, Clock, XCircle, Download, FileSpreadsheet, UserCheck } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';

export default function QRScanner() {
  const { showToast } = useToast();
  const [ticketId, setTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanLogs, setScanLogs] = useState([]);

  const loadScannerData = async () => {
    try {
      setIsLoading(true);
      const [bookings, atts, evs] = await Promise.all([
        dbService.getAll('bookings'),
        dbService.getAll('attendees'),
        dbService.getAll('events')
      ]);
      setAllBookings(bookings || []);
      setAttendees(atts || []);
      setEvents(evs || []);
      
      // Seed initial mock scan history based on attendees checked-in status
      const initialLogs = (bookings || [])
        .filter(b => b.checkInStatus === 'Checked In')
        .map(b => ({
          id: `log-${b.id}`,
          ticketId: b.id,
          attendeeName: b.userName,
          eventTitle: b.eventName,
          ticketClass: b.ticketName,
          timestamp: b.checkedInAt || new Date().toISOString(),
          status: 'success',
          notes: 'Regular QR Scan'
        }));
      setScanLogs(initialLogs);
    } catch (err) {
      console.error('Failed to load scanner resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScannerData();
  }, []);

  const handleScan = async (scannedId) => {
    if (!scannedId) {
      showToast('Please specify a ticket ID', 'error');
      return;
    }
    
    setScanResult(null);
    const booking = allBookings.find(b => String(b.id) === String(scannedId));
    const nowStr = new Date().toISOString();
    
    if (!booking) {
      const logEntry = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        ticketId: scannedId,
        attendeeName: 'Unknown Visitor',
        eventTitle: 'Unknown Event',
        ticketClass: 'N/A',
        timestamp: nowStr,
        status: 'failed',
        notes: 'Invalid Ticket QR Code'
      };
      setScanLogs(prev => [logEntry, ...prev]);
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
      const logEntry = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        ticketId: scannedId,
        attendeeName: booking.userName,
        eventTitle: event ? event.name : 'Unknown Event',
        ticketClass: booking.ticketName,
        timestamp: nowStr,
        status: 'failed',
        notes: `Ticket is ${booking.status.toUpperCase()}`
      };
      setScanLogs(prev => [logEntry, ...prev]);
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
    if (booking.checkInStatus === 'Checked In' || (attendee && attendee.checkedIn)) {
      const logEntry = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        ticketId: scannedId,
        attendeeName: booking.userName,
        eventTitle: event ? event.name : 'Unknown Event',
        ticketClass: booking.ticketName,
        timestamp: nowStr,
        status: 'warning',
        notes: 'Duplicate Scan Blocked'
      };
      setScanLogs(prev => [logEntry, ...prev]);
      setScanResult({
        status: 'warning',
        message: 'WARNING: Duplicate Check-In Detected!',
        details: {
          name: booking.userName,
          event: event ? event.name : 'Unknown Event',
          ticket: booking.ticketName,
          checkedInAt: booking.checkedInAt || (attendee && attendee.checkedInAt) || 'N/A'
        }
      });
      return;
    }

    // 3. Complete successful check-in
    try {
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

      // Add to scanner logs
      const logEntry = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        ticketId: scannedId,
        attendeeName: booking.userName,
        eventTitle: event ? event.name : 'Unknown Event',
        ticketClass: booking.ticketName,
        timestamp: nowStr,
        status: 'success',
        notes: 'Check-in Granted'
      };
      setScanLogs(prev => [logEntry, ...prev]);

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

      showToast(`Checked in ${booking.userName} successfully!`, 'success');
      loadScannerData();
    } catch (err) {
      setScanResult({
        status: 'error',
        message: `System Error processing check-in: ${err.message}`,
        details: null
      });
    }
  };

  const handleExportLogs = () => {
    if (scanLogs.length === 0) {
      showToast('No scan logs to export.', 'error');
      return;
    }
    const headers = ['Log ID', 'Ticket ID', 'Attendee Name', 'Event Name', 'Ticket Class', 'Timestamp', 'Status', 'Notes'];
    const rows = scanLogs.map(log => [
      log.id,
      log.ticketId,
      log.attendeeName,
      log.eventTitle,
      log.ticketClass,
      log.timestamp,
      log.status,
      log.notes
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scanner_attendance_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance logs exported successfully!', 'success');
  };

  // Compute metrics
  const totalScans = scanLogs.length;
  const successfulScans = scanLogs.filter(l => l.status === 'success').length;
  const failedScans = scanLogs.filter(l => l.status === 'failed').length;
  const warnings = scanLogs.filter(l => l.status === 'warning').length;

  if (isLoading) {
    return <div className="organizer-loading">Calibrating QR Check-In Scanner...</div>;
  }

  return (
    <div className="org-scanner-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="org-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>QR Ticket Check-In</h1>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Scan customer tickets to verify entry credentials and prevent duplicates.</p>
        </div>
        <button className="luxury-btn-outline" onClick={handleExportLogs} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={16} /> Export Logs
        </button>
      </div>

      {/* Mini stats cards */}
      <div className="org-bookings-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Total Scans</div>
          <div className="org-b-stat-value" style={{ color: '#fff' }}>{totalScans}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Successful Entries</div>
          <div className="org-b-stat-value" style={{ color: '#52c41a' }}>{successfulScans}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Duplicate / Warnings</div>
          <div className="org-b-stat-value" style={{ color: '#faad14' }}>{warnings}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Failed Scans</div>
          <div className="org-b-stat-value" style={{ color: '#ff4d4f' }}>{failedScans}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        
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
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--org-text-muted)', fontWeight: 'bold' }}>Simulate Check-In (Pick a registered ticket)</label>
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
                  <option key={b.id} value={b.id}>{b.id} - {b.userName} ({b.ticketName}) [{b.checkInStatus || 'Pending'}]</option>
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

            <div style={{ marginTop: '16px' }}>
              <input 
                type="text" 
                placeholder="Or manually input Ticket ID (e.g. 101)" 
                className="luxury-input" 
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Scan Results Message Panel */}
        <div className="luxury-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Live Scan Feedback</h3>
          {scanResult ? (
            <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                {scanResult.status === 'success' && <CheckCircle2 size={36} color="#52c41a" />}
                {scanResult.status === 'warning' && <ShieldAlert size={36} color="#faad14" />}
                {scanResult.status === 'error' && <XCircle size={36} color="#ff4d4f" />}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: scanResult.status === 'success' ? '#52c41a' : scanResult.status === 'warning' ? '#faad14' : '#ff4d4f',
                  fontSize: '16px',
                  margin: 0
                }}>{scanResult.message}</h4>

                {scanResult.details && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#ccc' }}>
                    <div><strong>Attendee:</strong> {scanResult.details.name}</div>
                    <div><strong>Event:</strong> {scanResult.details.event}</div>
                    <div><strong>Ticket Class:</strong> {scanResult.details.ticket}</div>
                    {scanResult.status === 'success' && (
                      <div style={{ color: '#52c41a', marginTop: '4px' }}>
                        <strong>Checked In:</strong> {new Date(scanResult.details.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                    {scanResult.status === 'warning' && (
                      <div style={{ color: '#faad14', marginTop: '4px', fontSize: '12px' }}>
                        Previously checked in at {new Date(scanResult.details.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--org-text-muted)' }}>
              <QrCode size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>Awaiting check-in input scanner trigger.</p>
            </div>
          )}
        </div>

      </div>

      {/* Scan History Log List */}
      <div className="luxury-card" style={{ padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', margin: 0 }}>Scan History Log</h3>
          <span style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>Live entries verified: {scanLogs.length}</span>
        </div>
        <div className="table-scroll-wrapper">
          <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Ticket ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Attendee Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Event & Class</th>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Details / Note</th>
              </tr>
            </thead>
            <tbody>
              {scanLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--org-text-muted)' }}>No scans recorded in this session.</td>
                </tr>
              ) : (
                scanLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '12px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--org-gold)', fontFamily: 'monospace', fontWeight: 'bold' }}>{log.ticketId}</td>
                    <td style={{ padding: '14px 16px', color: '#fff', fontWeight: '600' }}>{log.attendeeName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#eee', fontSize: '13px' }}>{log.eventTitle}</div>
                      <div style={{ fontSize: '10px', color: 'var(--org-text-muted)' }}>{log.ticketClass}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge-status ${log.status === 'success' ? 'confirmed' : log.status === 'warning' ? 'pending' : 'cancelled'}`}>
                        {log.status === 'success' ? 'Granted' : log.status === 'warning' ? 'Duplicate' : 'Invalid'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '12px' }}>{log.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
