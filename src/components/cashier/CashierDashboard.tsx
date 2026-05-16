import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, CheckCircle, Printer, Activity, Receipt as ReceiptIcon, Calendar, Filter } from 'lucide-react';
import { FeeOPD, Admission, FeeIPD, Receipt, Patient, Doctor, User } from '../../types';
import {
  getFeesOPD,
  getAdmissions,
  getFeesIPD,
  getReceipts,
  getPatients,
  getDoctors,
  getUsers,
  payFeeOPD,
  admitPatient,
  addFeeIPD,
  dischargePatient
} from '../../db/database';
import { showToast } from '../common/Toast';

interface CashierDashboardProps {
  initialSubTab?: 'opd' | 'ipd' | 'reports';
  onPrintReceipt?: (receipt: Receipt, patient: Patient) => void;
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({ initialSubTab = 'opd', onPrintReceipt }) => {
  const [activeTab, setActiveTab] = useState<'opd' | 'ipd' | 'reports'>(initialSubTab);

  // Database state
  const [feesOPD, setFeesOPD] = useState<FeeOPD[]>(getFeesOPD());
  const [admissions, setAdmissions] = useState<Admission[]>(getAdmissions());
  const [feesIPD, setFeesIPD] = useState<FeeIPD[]>(getFeesIPD());
  const [receipts, setReceipts] = useState<Receipt[]>(getReceipts());
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors());
  const [users, setUsers] = useState<User[]>(getUsers());

  // Search filter
  const [opdSearch, setOpdSearch] = useState('');

  // Admit Patient Form State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState(doctors[0]?.user_id || '');
  const [admitWard, setAdmitWard] = useState('General Ward');
  const [admitBedNo, setAdmitBedNo] = useState('Bed-101');
  const [admitReason, setAdmitReason] = useState('');

  // Add IPD Charge Modal State
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);
  const [chargeType, setChargeType] = useState('Daily Room & Nursing Charges');
  const [chargeAmount, setChargeAmount] = useState<number>(5000);

  // Discharge Summary Modal State
  const [dischargeAdmId, setDischargeAdmId] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'Online'>('Cash');

  // Reports Filter State
  const [reportDateRange, setReportDateRange] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportDoctorId, setReportDoctorId] = useState<string>('ALL');

  const refreshData = () => {
    setFeesOPD(getFeesOPD());
    setAdmissions(getAdmissions());
    setFeesIPD(getFeesIPD());
    setReceipts(getReceipts());
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
    return u ? u.name : 'Unknown Doctor';
  };

  const handlePayOPD = (fee_id: string) => {
    const rec = payFeeOPD(fee_id, 'Cash');
    if (rec) {
      showToast(`Fee paid successfully! Receipt #${rec.id} generated`, 'success');
      refreshData();
      const pat = patients.find(p => p.patient_no === rec.patient_id);
      if (onPrintReceipt && pat) onPrintReceipt(rec, pat);
    }
  };

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitPatientId) {
      showToast('Please enter a valid Patient ID', 'error');
      return;
    }
    const pat = patients.find(p => p.patient_no.toLowerCase() === admitPatientId.toLowerCase());
    if (!pat) {
      showToast('Patient ID not found. Register patient first.', 'error');
      return;
    }

    const newAdm = admitPatient({
      patient_id: pat.patient_no,
      doctor_id: admitDoctorId,
      admit_date: new Date().toLocaleString(),
      ward: admitWard,
      bed_no: admitBedNo,
      reason: admitReason,
    });

    // Also add an initial admission fee
    addFeeIPD({
      admission_id: newAdm.id,
      charge_type: 'Admission & Registration Fee',
      amount: 2000,
      date: new Date().toISOString().slice(0, 10),
    });

    showToast(`Patient admitted successfully to ${admitWard}!`, 'success');
    setIsAdmitModalOpen(false);
    refreshData();
    // Reset
    setAdmitPatientId('');
    setAdmitReason('');
  };

  const handleAddChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) return;

    addFeeIPD({
      admission_id: selectedAdmissionId,
      charge_type: chargeType,
      amount: chargeAmount,
      date: new Date().toISOString().slice(0, 10),
    });

    showToast('Charge added successfully to IPD Bill', 'success');
    setSelectedAdmissionId(null);
    refreshData();
  };

  const handleDischargeConfirm = () => {
    if (!dischargeAdmId) return;
    const rec = dischargePatient(dischargeAdmId, paymentMode);
    if (rec) {
      showToast(`Patient discharged successfully! Final Invoice #${rec.id} generated`, 'success');
      setDischargeAdmId(null);
      refreshData();
      const pat = patients.find(p => p.patient_no === rec.patient_id);
      if (onPrintReceipt && pat) onPrintReceipt(rec, pat);
    }
  };

  const filteredOPD = feesOPD.filter(f => {
    const pName = getPatientName(f.patient_id).toLowerCase();
    const q = opdSearch.toLowerCase();
    return f.patient_id.toLowerCase().includes(q) || pName.includes(q) || f.receipt_no.toLowerCase().includes(q);
  });

  // Calculate Reports Data
  const opdCollection = feesOPD.filter(f => f.status === 'Paid' && (reportDoctorId === 'ALL' || f.doctor_id === reportDoctorId));
  const totalOpdAmount = opdCollection.reduce((sum, f) => sum + f.amount, 0);

  const ipdCollection = feesIPD.filter(f => {
    const adm = admissions.find(a => a.id === f.admission_id);
    if (!adm) return false;
    return reportDoctorId === 'ALL' || adm.doctor_id === reportDoctorId;
  });
  const totalIpdAmount = ipdCollection.reduce((sum, f) => sum + f.amount, 0);

  const totalEarnings = totalOpdAmount + totalIpdAmount;

  return (
    <div>
      {/* Sub navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button onClick={() => setActiveTab('opd')} className={`btn ${activeTab === 'opd' ? 'btn-primary' : 'btn-outline'}`}>
          <DollarSign size={18} /> OPD Fee Management
        </button>
        <button onClick={() => setActiveTab('ipd')} className={`btn ${activeTab === 'ipd' ? 'btn-primary' : 'btn-outline'}`}>
          <Activity size={18} /> IPD Admissions & Billing
        </button>
        <button onClick={() => setActiveTab('reports')} className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}`}>
          <ReceiptIcon size={18} /> Financial Fee Reports
        </button>
      </div>

      {/* Tab 1: OPD Fee Management */}
      {activeTab === 'opd' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><DollarSign size={24} style={{ color: 'var(--primary-teal)' }} /> OPD Consultation Fees</h2>
            <span className="badge badge-navy">Cashier Desk</span>
          </div>

          <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '500px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '48px' }}
              placeholder="Search by Patient ID, Name, or Receipt No..."
              value={opdSearch}
              onChange={e => setOpdSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOPD.map(f => {
                  const pat = patients.find(p => p.patient_no === f.patient_id);
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{f.receipt_no}</td>
                      <td style={{ fontWeight: 600 }}>{getPatientName(f.patient_id)}</td>
                      <td>{getDoctorName(f.doctor_id)}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {f.amount}</td>
                      <td>
                        <span className={`badge ${f.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{f.status}</span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        {f.status === 'Unpaid' ? (
                          <button className="btn btn-teal" style={{ padding: '6px 12px' }} onClick={() => handlePayOPD(f.id)}>
                            <CheckCircle size={16} /> Mark as Paid
                          </button>
                        ) : (
                          onPrintReceipt && pat && (
                            <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => {
                              const rec = receipts.find(r => r.reference_id === f.appointment_id) || { id: f.receipt_no, hospital_id: f.hospital_id, patient_id: f.patient_id, total_amount: f.amount, discount: 0, paid_amount: f.amount, payment_mode: 'Cash', cashier_id: 'usr-5', created_at: f.paid_at || '', receipt_type: 'OPD', reference_id: f.appointment_id };
                              onPrintReceipt(rec, pat);
                            }}>
                              <Printer size={16} /> Print Receipt
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredOPD.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No OPD fee records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: IPD Admissions & Billing */}
      {activeTab === 'ipd' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 className="card-title"><Activity size={24} style={{ color: 'var(--primary-teal)' }} /> IPD Admitted Patients & Billing</h2>
              <button className="btn btn-teal" onClick={() => setIsAdmitModalOpen(true)}>
                <Plus size={18} /> Admit New Patient
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Admission ID</th>
                    <th>Patient Name</th>
                    <th>Ward / Bed</th>
                    <th>Admit Date</th>
                    <th>Current Bill</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.map(adm => {
                    const admFees = feesIPD.filter(f => f.admission_id === adm.id);
                    const totalBill = admFees.reduce((sum, f) => sum + f.amount, 0);
                    const pat = patients.find(p => p.patient_no === adm.patient_id);

                    return (
                      <tr key={adm.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{adm.id}</td>
                        <td style={{ fontWeight: 600 }}>{getPatientName(adm.patient_id)}</td>
                        <td>{adm.ward} ({adm.bed_no})</td>
                        <td>{adm.admit_date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--danger)' }}>Rs. {totalBill.toLocaleString()}</td>
                        <td><span className={`badge ${adm.status === 'Admitted' ? 'badge-danger' : 'badge-success'}`}>{adm.status}</span></td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          {adm.status === 'Admitted' ? (
                            <>
                              <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setSelectedAdmissionId(adm.id)}>
                                <Plus size={16} /> Add Charge
                              </button>
                              <button className="btn btn-success" style={{ padding: '6px 12px' }} onClick={() => setDischargeAdmId(adm.id)}>
                                <CheckCircle size={16} /> Discharge & Bill
                              </button>
                            </>
                          ) : (
                            onPrintReceipt && pat && (
                              <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => {
                                const rec = receipts.find(r => r.reference_id === adm.id) || { id: `rec-${adm.id}`, hospital_id: adm.hospital_id, patient_id: adm.patient_id, total_amount: totalBill, discount: 0, paid_amount: totalBill, payment_mode: 'Cash', cashier_id: 'usr-5', created_at: adm.discharge_date || '', receipt_type: 'IPD', reference_id: adm.id };
                                onPrintReceipt(rec, pat);
                              }}>
                                <Printer size={16} /> Print Final Invoice
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {admissions.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No IPD admissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Fee Reports */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><ReceiptIcon size={24} style={{ color: 'var(--primary-teal)' }} /> Financial Fee Reports</h2>
            <span className="badge badge-success">Live Earnings Summary</span>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} style={{ color: 'var(--primary-teal)' }} />
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter Date:</label>
              <input type="date" className="form-input" style={{ width: 'auto' }} value={reportDateRange} onChange={e => setReportDateRange(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Filter size={20} style={{ color: 'var(--primary-teal)' }} />
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter Doctor:</label>
              <select className="form-select" style={{ width: 'auto' }} value={reportDoctorId} onChange={e => setReportDoctorId(e.target.value)}>
                <option value="ALL">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.user_id} value={d.user_id}>{getDoctorName(d.user_id)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Earnings Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px' }}>OPD Collections</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d' }}>Rs. {totalOpdAmount.toLocaleString()}</h3>
            </div>

            <div style={{ background: '#fff1f2', padding: '24px', borderRadius: '14px', border: '1px solid #fecdd3' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', marginBottom: '8px' }}>IPD Collections</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#be123c' }}>Rs. {totalIpdAmount.toLocaleString()}</h3>
            </div>

            <div style={{ background: '#f0f9ff', padding: '24px', borderRadius: '14px', border: '1px solid #bae6fd' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>Total Net Earnings</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0369a1' }}>Rs. {totalEarnings.toLocaleString()}</h3>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '16px' }}>Detailed Transaction Logs</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {opdCollection.map(f => (
                  <tr key={f.id}>
                    <td><span className="badge badge-success">OPD Receipt</span></td>
                    <td style={{ fontWeight: 600 }}>{getPatientName(f.patient_id)}</td>
                    <td>{getDoctorName(f.doctor_id)}</td>
                    <td style={{ fontWeight: 700 }}>Rs. {f.amount}</td>
                    <td><span className="badge badge-success">Paid</span></td>
                  </tr>
                ))}
                {ipdCollection.map(f => {
                  const adm = admissions.find(a => a.id === f.admission_id);
                  return (
                    <tr key={f.id}>
                      <td><span className="badge badge-danger">IPD Charge</span></td>
                      <td style={{ fontWeight: 600 }}>{adm ? getPatientName(adm.patient_id) : 'IPD Patient'}</td>
                      <td>{adm ? getDoctorName(adm.doctor_id) : '-'}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {f.amount}</td>
                      <td><span className="badge badge-warning">{f.charge_type}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {isAdmitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsAdmitModalOpen(false)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>Admit Patient to IPD Ward</h2>

            <form onSubmit={handleAdmitSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Patient ID * (e.g. PT-2026-00001)</label>
                  <input type="text" className="form-input" value={admitPatientId} onChange={e => setAdmitPatientId(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Admitting Doctor *</label>
                  <select className="form-select" value={admitDoctorId} onChange={e => setAdmitDoctorId(e.target.value)}>
                    {doctors.map(d => (
                      <option key={d.user_id} value={d.user_id}>{getDoctorName(d.user_id)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ward / Department *</label>
                  <select className="form-select" value={admitWard} onChange={e => setAdmitWard(e.target.value)}>
                    <option value="General Ward">General Ward</option>
                    <option value="Cardiology Ward">Cardiology Ward</option>
                    <option value="Pediatrics Ward">Pediatrics Ward</option>
                    <option value="ICU">ICU (Intensive Care)</option>
                    <option value="Private Room">Private Room</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bed Number *</label>
                  <input type="text" className="form-input" value={admitBedNo} onChange={e => setAdmitBedNo(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Reason for Admission *</label>
                <textarea className="form-textarea" rows={2} value={admitReason} onChange={e => setAdmitReason(e.target.value)} placeholder="Describe diagnosis or surgery reason..." required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAdmitModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Admit Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add IPD Charge Modal */}
      {selectedAdmissionId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setSelectedAdmissionId(null)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>Add IPD Extra Charge</h2>

            <form onSubmit={handleAddChargeSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Charge Type / Description</label>
                <select className="form-select" value={chargeType} onChange={e => setChargeType(e.target.value)}>
                  <option value="Daily Room & Nursing Charges">Daily Room & Nursing Charges</option>
                  <option value="ICU Monitoring & Oxygen">ICU Monitoring & Oxygen</option>
                  <option value="Surgical Procedure / OT Charges">Surgical Procedure / OT Charges</option>
                  <option value="IV Medicines & Injections">IV Medicines & Injections</option>
                  <option value="Laboratory Test Charges">Laboratory Test Charges</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Amount (Rs.)</label>
                <input type="number" className="form-input" value={chargeAmount} onChange={e => setChargeAmount(Number(e.target.value))} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedAdmissionId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Charge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Summary Modal */}
      {dischargeAdmId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <button className="modal-close" onClick={() => setDischargeAdmId(null)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>Discharge Summary & Final Bill</h2>

            <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px' }}>Billing Summary Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                {feesIPD.filter(f => f.admission_id === dischargeAdmId).map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span>{f.charge_type} ({f.date})</span>
                    <span style={{ fontWeight: 600 }}>Rs. {f.amount}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid var(--primary-navy)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                  <span>Total Payable Bill:</span>
                  <span>Rs. {feesIPD.filter(f => f.admission_id === dischargeAdmId).reduce((sum, f) => sum + f.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)}>
                <option value="Cash">Cash Payment</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Online">Online Transfer</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setDischargeAdmId(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleDischargeConfirm}>Confirm Discharge & Generate Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
