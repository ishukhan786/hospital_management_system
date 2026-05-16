import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X } from 'lucide-react';
import { Patient, Prescription, LabTest, Receipt, HospitalSettings, Doctor, User } from '../../types';
import { getSettings, getUsers } from '../../db/database';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  printType: 'PATIENT_CARD' | 'PRESCRIPTION' | 'LAB_REPORT' | 'RECEIPT';
  patient?: Patient | null;
  prescription?: Prescription | null;
  labTest?: LabTest | null;
  receipt?: Receipt | null;
  doctorInfo?: { user: User; doctor: Doctor } | null;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  printType,
  patient,
  prescription,
  labTest,
  receipt,
  doctorInfo
}) => {
  if (!isOpen) return null;

  const settings: HospitalSettings = getSettings();
  const allUsers = getUsers();

  const handlePrint = () => {
    window.print();
  };

  const getDoctorName = (doc_id: string) => {
    const u = allUsers.find(usr => usr.id === doc_id);
    return u ? u.name : 'Doctor';
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      {/* Modal Actions Bar (No Print) */}
      <div className="modal-content" style={{ maxWidth: '800px', padding: '32px', background: '#f1f5f9' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>Document Print Preview</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check the layout below and click Print Document</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={onClose}><X size={18} /> Close</button>
            <button className="btn btn-primary" onClick={handlePrint}><Printer size={18} /> Print Document</button>
          </div>
        </div>

        {/* --- PRINT CONTAINER --- */}
        <div className="print-only" style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', color: 'black', minHeight: '500px' }}>

          {/* 1. PATIENT CARD */}
          {printType === 'PATIENT_CARD' && patient && (
            <div style={{ border: '2px solid var(--primary-navy)', borderRadius: '16px', padding: '24px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-navy)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '2.2rem' }}>{settings.hospital_logo || '🏥'}</div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{settings.hospital_name}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{settings.address}</p>
                  </div>
                </div>
                <div style={{ background: 'var(--primary-navy)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {patient.patient_type} PATIENT
                </div>
              </div>

              {/* Card Body */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                <img src={patient.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={patient.name} style={{ width: '110px', height: '110px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{patient.name}</div>
                  <div><strong>Father/Husband:</strong> {patient.father_name}</div>
                  <div><strong>CNIC:</strong> {patient.cnic}</div>
                  <div><strong>Mobile:</strong> {patient.mobile}</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span><strong>DOB:</strong> {patient.dob}</span>
                    <span><strong>Blood:</strong> <strong style={{ color: 'var(--danger)' }}>{patient.blood_group}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Footer / QR Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Date: {patient.registered_date}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px' }}>{patient.patient_no}</div>
                </div>
                <div style={{ background: 'white', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <QRCodeSVG value={patient.patient_no} size={70} />
                </div>
              </div>
            </div>
          )}

          {/* 2. PRESCRIPTION SLIP */}
          {printType === 'PRESCRIPTION' && prescription && patient && (
            <div>
              {/* Hospital & Doctor Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--primary-navy)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '2.5rem' }}>{settings.hospital_logo || '🏥'}</div>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{settings.hospital_name}</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{settings.address} | Phone: {settings.phone}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    {doctorInfo ? doctorInfo.user.name : getDoctorName(prescription.doctor_id)}
                  </h2>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-teal)', margin: 0 }}>
                    {doctorInfo ? doctorInfo.doctor.specialization : 'Specialist'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    {doctorInfo ? doctorInfo.doctor.qualification : 'MBBS'}
                  </p>
                </div>
              </div>

              {/* Patient Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '28px', fontSize: '0.9rem' }}>
                <div><strong>Patient Name:</strong> <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{patient.name}</div></div>
                <div><strong>Patient ID:</strong> <div>{patient.patient_no}</div></div>
                <div><strong>Age / Gender:</strong> <div>{patient.dob} ({patient.gender})</div></div>
                <div><strong>Date & Time:</strong> <div>{prescription.created_at}</div></div>
              </div>

              {/* Clinical Details */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>Chief Complaint</h4>
                  <p style={{ fontSize: '0.95rem' }}>{prescription.complaint}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>Final Diagnosis</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>{prescription.diagnosis}</p>
                </div>

                {/* Medicines Table */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>Rx — Prescribed Medicines</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-navy)', color: 'white' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Medicine Name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Dose</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Frequency</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Duration</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medicines.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{m.name}</td>
                        <td style={{ padding: '12px 14px' }}>{m.dose}</td>
                        <td style={{ padding: '12px 14px' }}>{m.frequency}</td>
                        <td style={{ padding: '12px 14px' }}>{m.duration}</td>
                        <td style={{ padding: '12px 14px', fontStyle: 'italic' }}>{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Advice & Followup */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', borderTop: '2px solid var(--border-color)', paddingTop: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px' }}>Doctor's Advice / Notes</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{prescription.advice || 'None'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px' }}>Follow-up Date</h4>
                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-teal)' }}>{prescription.followup_date}</p>
                    <div style={{ marginTop: '32px', borderTop: '1px solid black', display: 'inline-block', paddingTop: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                      Doctor's Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. LAB REPORT */}
          {printType === 'LAB_REPORT' && labTest && patient && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--primary-teal)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '2.5rem' }}>{settings.hospital_logo || '🏥'}</div>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{settings.hospital_name}</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{settings.address}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-teal)', margin: 0 }}>LABORATORY REPORT</h2>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Report ID: {labTest.id}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Date: {labTest.report_date || new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Patient Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '28px', fontSize: '0.9rem' }}>
                <div><strong>Patient Name:</strong> <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>{patient.name}</div></div>
                <div><strong>Patient ID:</strong> <div>{patient.patient_no}</div></div>
                <div><strong>Referred By:</strong> <div>{getDoctorName(labTest.doctor_id)}</div></div>
                <div><strong>Sample Status:</strong> <div style={{ color: 'var(--success)', fontWeight: 700 }}>Verified</div></div>
              </div>

              {/* Test Results Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-navy)', color: 'white' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Test Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Observed Value</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Unit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Biological Normal Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.05rem' }}>{labTest.test_name}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: labTest.is_abnormal ? 'var(--danger)' : 'var(--success)' }}>
                        {labTest.result}
                      </span>
                      {labTest.is_abnormal && <span style={{ marginLeft: '8px', background: '#ffe4e6', color: '#be123c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>ABNORMAL</span>}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{labTest.unit}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{labTest.normal_range}</td>
                  </tr>
                </tbody>
              </table>

              {/* Remarks & Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', borderTop: '2px solid var(--border-color)', paddingTop: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px' }}>Pathologist Remarks / Interpretation</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{labTest.remarks || 'No abnormal findings observed in sample.'}</p>
                </div>
                <div style={{ textAlign: 'right', paddingRight: '20px' }}>
                  <div style={{ marginTop: '40px', borderTop: '1px solid black', display: 'inline-block', paddingTop: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                    Senior Lab Technologist / Pathologist
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Verified & Signed Electronically</div>
                </div>
              </div>
            </div>
          )}

          {/* 4 & 5. RECEIPTS & INVOICES */}
          {printType === 'RECEIPT' && receipt && patient && (
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{settings.hospital_logo || '🏥'}</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 4px' }}>{settings.hospital_name}</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>{settings.address} | Tel: {settings.phone}</p>
                <div style={{ background: 'var(--primary-navy)', color: 'white', padding: '6px 16px', borderRadius: '8px', display: 'inline-block', fontSize: '1rem', fontWeight: 700 }}>
                  {receipt.receipt_type === 'IPD' ? 'IPD FINAL BILL / DISCHARGE INVOICE' : 'OPD OFFICIAL CASH RECEIPT'}
                </div>
              </div>

              {/* Meta details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.95rem' }}>
                <div>
                  <div><strong>Receipt No:</strong> {receipt.id}</div>
                  <div><strong>Patient Name:</strong> {patient.name}</div>
                  <div><strong>Patient ID:</strong> {patient.patient_no}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Date:</strong> {receipt.created_at}</div>
                  <div><strong>Payment Mode:</strong> <span style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>{receipt.payment_mode}</span></div>
                  <div><strong>Cashier ID:</strong> {receipt.cashier_id}</div>
                </div>
              </div>

              {/* Line Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--primary-navy)' }}>
                    <th style={{ padding: '10px 0', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '10px 0', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 0', fontWeight: 600 }}>
                      {receipt.receipt_type === 'IPD' ? `IPD Hospitalization & Procedure Bill (Ref: ${receipt.reference_id})` : `OPD Doctor Consultation Fee (Ref: ${receipt.reference_id})`}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700 }}>Rs. {receipt.total_amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals & QR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--primary-navy)', paddingTop: '20px' }}>
                <div style={{ background: 'white', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <QRCodeSVG value={`REC:${receipt.id}|AMT:${receipt.total_amount}`} size={80} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Subtotal: Rs. {receipt.total_amount.toLocaleString()}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Discount: Rs. {receipt.discount.toLocaleString()}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>Paid Total: Rs. {receipt.paid_amount.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                Thank you for choosing MedCare General Hospital. Wishing you a speedy recovery!
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
