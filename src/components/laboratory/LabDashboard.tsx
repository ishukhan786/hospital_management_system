import React, { useState, useEffect } from 'react';
import { TestTube, Search, Plus, Edit, CheckCircle, Printer, AlertTriangle } from 'lucide-react';
import { LabTest, Patient, Doctor, User } from '../../types';
import { getLabTests, getPatients, getDoctors, getUsers, saveLabTest } from '../../db/database';
import { showToast } from '../common/Toast';

interface LabDashboardProps {
  onPrintReport?: (labTest: LabTest, patient: Patient) => void;
}

export const LabDashboard: React.FC<LabDashboardProps> = ({ onPrintReport }) => {
  const [labTests, setLabTests] = useState<LabTest[]>(getLabTests());
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors());
  const [users, setUsers] = useState<User[]>(getUsers());
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.user_id || '');
  const [testName, setTestName] = useState('');
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [status, setStatus] = useState<LabTest['status']>('Pending');
  const [remarks, setRemarks] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);

  const refreshData = () => {
    setLabTests(getLabTests());
    setPatients(getPatients());
    setDoctors(getDoctors());
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  const getPatientName = (id: string) => {
    const p = patients.find(pat => pat.patient_no === id);
    return p ? p.name : id;
  };

  const getDoctorName = (id: string) => {
    const u = users.find(usr => usr.id === id);
    return u ? u.name : 'Direct Walk-in';
  };

  const openAddModal = () => {
    setEditingTest(null);
    setPatientId('');
    setDoctorId(doctors[0]?.user_id || '');
    setTestName('');
    setResult('');
    setNormalRange('');
    setUnit('');
    setStatus('Pending');
    setRemarks('');
    setIsAbnormal(false);
    setIsModalOpen(true);
  };

  const openEditModal = (t: LabTest) => {
    setEditingTest(t);
    setPatientId(t.patient_id);
    setDoctorId(t.doctor_id);
    setTestName(t.test_name);
    setResult(t.result);
    setNormalRange(t.normal_range);
    setUnit(t.unit);
    setStatus(t.status);
    setRemarks(t.remarks || '');
    setIsAbnormal(t.is_abnormal || false);
    setIsModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !testName) {
      showToast('Patient ID and Test Name are required', 'error');
      return;
    }

    const testObj: LabTest = {
      id: editingTest ? editingTest.id : `lab-${Date.now()}`,
      hospital_id: editingTest ? editingTest.hospital_id : 'hospital-1',
      patient_id: patientId,
      doctor_id: doctorId,
      test_name: testName,
      result,
      normal_range: normalRange,
      unit,
      status,
      report_date: status === 'Completed' ? new Date().toLocaleString() : undefined,
      remarks,
      is_abnormal: isAbnormal,
    };

    saveLabTest(testObj);
    showToast(`Lab test ${editingTest ? 'updated' : 'ordered'} successfully!`, 'success');
    setIsModalOpen(false);
    refreshData();
  };

  const filteredTests = labTests.filter(t => {
    const pName = getPatientName(t.patient_id).toLowerCase();
    const q = searchTerm.toLowerCase();
    return t.patient_id.toLowerCase().includes(q) || pName.includes(q) || t.test_name.toLowerCase().includes(q);
  });

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><TestTube size={24} style={{ color: 'var(--primary-teal)' }} /> Laboratory Module & Reports</h2>
        <button className="btn btn-teal" onClick={openAddModal}>
          <Plus size={18} /> Order / Add New Lab Test
        </button>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '500px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '48px' }}
          placeholder="Search by Patient ID, Name, or Test Name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Patient Info</th>
              <th>Test Name</th>
              <th>Referred By</th>
              <th>Result Value</th>
              <th>Normal Range</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map(t => {
              const pat = patients.find(p => p.patient_no === t.patient_id);
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div>{getPatientName(t.patient_id)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {t.patient_id}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{t.test_name}</td>
                  <td>{getDoctorName(t.doctor_id)}</td>
                  <td>
                    {t.status === 'Completed' ? (
                      <span style={{ fontWeight: 700, color: t.is_abnormal ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t.is_abnormal && <AlertTriangle size={14} />} {t.result} {t.unit}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting Result</span>
                    )}
                  </td>
                  <td>{t.normal_range} {t.unit}</td>
                  <td>
                    <span className={`badge ${
                      t.status === 'Completed' ? 'badge-success' :
                      t.status === 'Processing' ? 'badge-warning' : 'badge-info'
                    }`}>{t.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => openEditModal(t)}>
                      <Edit size={16} /> Enter / Edit Result
                    </button>
                    {t.status === 'Completed' && onPrintReport && pat && (
                      <button className="btn btn-teal" style={{ padding: '6px 12px' }} onClick={() => onPrintReport(t, pat)}>
                        <Printer size={16} /> Print Report
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredTests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No laboratory tests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Lab Test Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>
              {editingTest ? 'Enter / Edit Lab Test Result' : 'Order New Lab Test'}
            </h2>

            <form onSubmit={handleSaveTest}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Patient ID * (e.g. PT-2026-00001)</label>
                  <input type="text" className="form-input" value={patientId} onChange={e => setPatientId(e.target.value)} disabled={!!editingTest} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Referred Doctor *</label>
                  <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)} disabled={!!editingTest}>
                    {doctors.map(d => (
                      <option key={d.user_id} value={d.user_id}>{getDoctorName(d.user_id)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Test Name *</label>
                <input type="text" className="form-input" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. Complete Blood Count (CBC) / Lipid Profile" required />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Test Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Result Value</label>
                  <input type="text" className="form-input" value={result} onChange={e => setResult(e.target.value)} placeholder="e.g. 14.2 / 245" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Normal Range</label>
                  <input type="text" className="form-input" value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="e.g. 12.0 - 15.5 / < 200" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input type="text" className="form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. g/dL / mg/dL" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Remarks / Interpretation</label>
                <textarea className="form-textarea" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Mild Anemia / High Cholesterol advised dietary control" />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <input type="checkbox" id="abnormal" checked={isAbnormal} onChange={e => setIsAbnormal(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <label htmlFor="abnormal" style={{ fontWeight: 700, color: 'var(--danger)', cursor: 'pointer' }}>Flag as Abnormal Result</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Test Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
