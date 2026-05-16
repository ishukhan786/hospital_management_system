import React, { useState } from 'react';
import { UserPlus, CheckCircle, Printer, RefreshCw } from 'lucide-react';
import { Patient, PatientType } from '../../types';
import { generatePatientNo, savePatient } from '../../db/database';
import { showToast } from '../common/Toast';

interface PatientRegistrationProps {
  onPrintCard?: (patient: Patient) => void;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ onPrintCard }) => {
  const [patientNo, setPatientNo] = useState<string>(generatePatientNo());
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [patientType, setPatientType] = useState<PatientType>('OPD');
  const [photoUrl, setPhotoUrl] = useState('');

  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.slice(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }
    setCnic(formatted);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 4) {
      formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setMobile(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !cnic || !mobile || !dob || !address || !city) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newPatient: Patient = {
      patient_no: patientNo,
      name,
      father_name: fatherName,
      cnic,
      mobile,
      dob,
      gender,
      blood_group: bloodGroup,
      address,
      city,
      registered_date: new Date().toISOString().slice(0, 10),
      patient_type: patientType,
      photo_url: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    const res = savePatient(newPatient);
    if (res.success) {
      showToast(res.message, 'success');
      setRegisteredPatient(newPatient);
    } else {
      showToast(res.message, 'error');
    }
  };

  const resetForm = () => {
    setPatientNo(generatePatientNo());
    setName('');
    setFatherName('');
    setCnic('');
    setMobile('');
    setDob('');
    setGender('Male');
    setBloodGroup('A+');
    setAddress('');
    setCity('');
    setPatientType('OPD');
    setPhotoUrl('');
    setRegisteredPatient(null);
  };

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title"><UserPlus size={24} style={{ color: 'var(--primary-teal)' }} /> Patient Registration Form</h2>
        <span className="badge badge-navy">Auto-ID: {patientNo}</span>
      </div>

      {registeredPatient ? (
        <div style={{ padding: '32px', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
            Patient Registered Successfully!
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
            {registeredPatient.name} has been assigned Patient ID: <strong style={{ color: 'var(--primary-navy)' }}>{registeredPatient.patient_no}</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {onPrintCard && (
              <button className="btn btn-teal" onClick={() => onPrintCard(registeredPatient)}>
                <Printer size={18} /> Print Patient Card
              </button>
            )}
            <button className="btn btn-outline" onClick={resetForm}>
              <RefreshCw size={18} /> Register Another Patient
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter patient's full name" required />
            </div>

            <div className="form-group">
              <label className="form-label">Father / Husband Name *</label>
              <input type="text" className="form-input" value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Enter father/husband name" required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">CNIC Number * (Format: #####-#######-#)</label>
              <input type="text" className="form-input" value={cnic} onChange={handleCnicChange} placeholder="42101-1234567-1" required />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input type="text" className="form-input" value={mobile} onChange={handleMobileChange} placeholder="0300-1234567" required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-input" value={dob} onChange={e => setDob(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" value={gender} onChange={e => setGender(e.target.value as any)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Patient Type *</label>
              <select className="form-select" value={patientType} onChange={e => setPatientType(e.target.value as PatientType)}>
                <option value="OPD">OPD (Outpatient)</option>
                <option value="IPD">IPD (Inpatient / Admission)</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Karachi" required />
            </div>

            <div className="form-group">
              <label className="form-label">Patient Photo URL (Optional)</label>
              <input type="url" className="form-input" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Residential Address *</label>
            <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full street address" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={resetForm}>Reset Form</button>
            <button type="submit" className="btn btn-primary"><UserPlus size={18} /> Register Patient</button>
          </div>
        </form>
      )}
    </div>
  );
};
