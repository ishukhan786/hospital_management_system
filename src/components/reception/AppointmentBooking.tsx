import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, UserCheck, Clock, XCircle, RefreshCw, Send } from 'lucide-react';
import { Appointment, Doctor, Patient, User } from '../../types';
import { getAppointments, getDoctors, getUsers, getPatientByNo, bookAppointment, updateAppointmentStatus } from '../../db/database';
import { showToast } from '../common/Toast';

export const AppointmentBooking: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors());
  const [users, setUsers] = useState<User[]>(getUsers());

  // Form State
  const [patientNo, setPatientNo] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]?.user_id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 10:30 AM');
  const [aptType, setAptType] = useState<'New' | 'Follow-up'>('New');

  // Preview Patient Info
  const [patientPreview, setPatientPreview] = useState<Patient | null>(null);

  // Filter Doctor for Calendar View
  const [calendarDoctor, setCalendarDoctor] = useState<string>(doctors[0]?.user_id || '');

  const refreshData = () => {
    setAppointments(getAppointments());
    setDoctors(getDoctors());
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  const handlePatientNoBlur = () => {
    if (!patientNo) {
      setPatientPreview(null);
      return;
    }
    const p = getPatientByNo(patientNo.toUpperCase());
    if (p) {
      setPatientPreview(p);
      showToast(`Patient found: ${p.name}`, 'success');
    } else {
      setPatientPreview(null);
      showToast('Patient ID not found in system. Please register first.', 'warning');
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientPreview) {
      showToast('Please enter a valid Patient ID first', 'error');
      return;
    }
    if (!selectedDoctor) {
      showToast('Please select a doctor', 'error');
      return;
    }

    const newApt = bookAppointment({
      patient_id: patientPreview.patient_no,
      doctor_id: selectedDoctor,
      date,
      time_slot: timeSlot,
      type: aptType,
    });

    showToast(`Appointment booked successfully! Token No: #${newApt.token_no}`, 'success');
    refreshData();
    // Reset
    setPatientNo('');
    setPatientPreview(null);
  };

  const handleCancel = (id: string) => {
    updateAppointmentStatus(id, 'Cancelled');
    showToast('Appointment cancelled successfully', 'info');
    refreshData();
  };

  const timeSlotsList = [
    '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM', '03:30 PM - 04:00 PM',
  ];

  const getDoctorName = (doc_id: string) => {
    const u = users.find(usr => usr.id === doc_id);
    return u ? u.name : 'Unknown Doctor';
  };

  const getDoctorSpec = (doc_id: string) => {
    const d = doctors.find(doc => doc.user_id === doc_id);
    return d ? d.specialization : '';
  };

  const filteredApts = appointments.filter(a => a.doctor_id === calendarDoctor && a.status !== 'Cancelled');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Booking Form Card */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h2 className="card-title"><CalendarIcon size={24} style={{ color: 'var(--primary-teal)' }} /> Book Appointment</h2>
            <span className="badge badge-navy">Token Generator</span>
          </div>

          <form onSubmit={handleBook}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Patient ID * (e.g. PT-2026-00001)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter Patient ID and press Search/Blur"
                  value={patientNo}
                  onChange={e => setPatientNo(e.target.value)}
                  onBlur={handlePatientNoBlur}
                  required
                />
                <button type="button" className="btn btn-outline" onClick={handlePatientNoBlur}>Verify</button>
              </div>
            </div>

            {/* Patient Preview Box */}
            {patientPreview ? (
              <div style={{ background: 'var(--light-teal)', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--secondary-teal)' }}>
                <UserCheck size={28} style={{ color: 'var(--primary-teal)' }} />
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{patientPreview.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CNIC: {patientPreview.cnic} | Mobile: {patientPreview.mobile}</p>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter Patient ID above to verify patient details.
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Select Doctor *</label>
              <select className="form-select" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                {doctors.map(d => (
                  <option key={d.user_id} value={d.user_id}>
                    {getDoctorName(d.user_id)} — ({d.specialization}) — Fee: Rs. {d.fee}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <select className="form-select" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                  {timeSlotsList.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px', marginBottom: '28px' }}>
              <label className="form-label">Appointment Type *</label>
              <select className="form-select" value={aptType} onChange={e => setAptType(e.target.value as any)}>
                <option value="New">New Consultation</option>
                <option value="Follow-up">Follow-up Visit</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <CalendarIcon size={18} /> Generate Token & Book Appointment
            </button>
          </form>
        </div>

        {/* Doctor Appointment Calendar / List Card */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h2 className="card-title"><Clock size={24} style={{ color: 'var(--primary-teal)' }} /> Doctor Appointment Schedule</h2>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={calendarDoctor}
              onChange={e => setCalendarDoctor(e.target.value)}
            >
              {doctors.map(d => (
                <option key={d.user_id} value={d.user_id}>{getDoctorName(d.user_id)}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-main)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Showing active queue for {getDoctorName(calendarDoctor)}</span>
            <span className="badge badge-navy">{filteredApts.length} Bookings</span>
          </div>

          <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient ID</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApts.map(a => (
                  <tr key={a.id}>
                    <td><span style={{ background: 'var(--primary-navy)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>#{a.token_no}</span></td>
                    <td style={{ fontWeight: 600 }}>{a.patient_id}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.time_slot}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        a.status === 'Completed' ? 'badge-success' :
                        a.status === 'In Progress' ? 'badge-warning' :
                        a.status === 'Waiting' ? 'badge-info' : 'badge-navy'
                      }`}>{a.status}</span>
                    </td>
                    <td>
                      {a.status !== 'Completed' && (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleCancel(a.id)} title="Cancel Appointment">
                          <XCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredApts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No appointments scheduled for this doctor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
