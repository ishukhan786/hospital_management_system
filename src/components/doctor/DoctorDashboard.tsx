import React, { useState, useEffect } from 'react';
import { Stethoscope, UserCheck, Clock, CheckCircle, ArrowRight, Play } from 'lucide-react';
import { Appointment, Patient, User } from '../../types';
import { getAppointments, getPatients, updateAppointmentStatus } from '../../db/database';
import { showToast } from '../common/Toast';

interface DoctorDashboardProps {
  currentUser: User;
  onExaminePatient: (appointment: Appointment, patient: Patient) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ currentUser, onExaminePatient }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [patients, setPatients] = useState<Patient[]>(getPatients());

  const refreshData = () => {
    setAppointments(getAppointments());
    setPatients(getPatients());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const myApts = appointments.filter(a => a.doctor_id === currentUser.id && a.date === todayStr && a.status !== 'Cancelled');

  const getPatient = (patient_id: string) => {
    return patients.find(p => p.patient_no === patient_id);
  };

  const handleStatusChange = (apt_id: string, newStatus: Appointment['status']) => {
    updateAppointmentStatus(apt_id, newStatus);
    showToast(`Appointment status updated to ${newStatus}`, 'success');
    refreshData();
  };

  const waitingCount = myApts.filter(a => a.status === 'Waiting').length;
  const inProgressCount = myApts.filter(a => a.status === 'In Progress').length;
  const completedCount = myApts.filter(a => a.status === 'Completed').length;

  return (
    <div>
      {/* Doctor Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-navy), var(--secondary-navy))',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--primary-teal)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)' }}>
            <Stethoscope size={36} color="white" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--light-teal)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Personal Doctor Panel</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{currentUser.name}</h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{currentUser.specialization || 'General Physician'} | {currentUser.qualification || 'MBBS'}</p>
          </div>
        </div>

        {/* Live Queue Badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '14px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Waiting</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fef08a', marginTop: '2px' }}>{waitingCount}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '14px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>In Progress</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#93c5fd', marginTop: '2px' }}>{inProgressCount}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '14px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Completed</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6ee7b7', marginTop: '2px' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Appointment List Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Clock size={24} style={{ color: 'var(--primary-teal)' }} /> Today's Appointment Queue ({myApts.length})</h2>
          <span className="badge badge-navy">Live Synchronized</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Name</th>
                <th>Time Slot</th>
                <th>Type</th>
                <th>Queue Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myApts.map(apt => {
                const pat = getPatient(apt.patient_id);
                if (!pat) return null;

                return (
                  <tr key={apt.id}>
                    <td><span style={{ background: 'var(--primary-navy)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem' }}>#{apt.token_no}</span></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '1.05rem' }}>{pat.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {pat.patient_no} | Gender: {pat.gender} | Age: {pat.dob}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{apt.time_slot}</td>
                    <td><span className={`badge ${apt.type === 'Follow-up' ? 'badge-warning' : 'badge-info'}`}>{apt.type}</span></td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600, background: apt.status === 'Completed' ? '#dcfce7' : apt.status === 'In Progress' ? '#fef3c7' : '#e0f2fe' }}
                        value={apt.status}
                        onChange={e => handleStatusChange(apt.id, e.target.value as any)}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-teal"
                        onClick={() => {
                          if (apt.status === 'Waiting') handleStatusChange(apt.id, 'In Progress');
                          onExaminePatient(apt, pat);
                        }}
                      >
                        <Play size={16} /> Examine Patient <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {myApts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <UserCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No appointments assigned to you for today.</p>
                  </td>
                </tr>
              )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
