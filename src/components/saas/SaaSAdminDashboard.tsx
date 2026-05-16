import React, { useEffect, useState } from 'react';
import { Building2, Plus, TrendingUp, Users, DollarSign, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { TenantHospital, SubscriptionPlan, SubscriptionStatus } from '../../types';
import { getTenants, saveTenant, deleteTenant, getUsers } from '../../db/database';
import { showToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SaaSAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantHospital[]>(getTenants());
  const [usersCount, setUsersCount] = useState<number>(getUsers().length);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantHospital | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🏥');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('STANDARD');
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  // Delete Confirm State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refreshData = () => {
    setTenants(getTenants());
    setUsersCount(getUsers().length);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  // Calculate MRR (Monthly Recurring Revenue)
  const calculateMRR = () => {
    return tenants.filter(t => t.status === 'ACTIVE').reduce((sum, t) => {
      if (t.plan === 'BASIC') return sum + 5000;
      if (t.plan === 'STANDARD') return sum + 15000;
      if (t.plan === 'ENTERPRISE') return sum + 35000;
      return sum;
    }, 0);
  };

  const openAddModal = () => {
    setEditingTenant(null);
    setName('');
    setLogo('🏥');
    setAddress('');
    setPhone('');
    setPlan('STANDARD');
    setStatus('ACTIVE');
    setOwnerName('');
    setOwnerEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: TenantHospital) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setLogo(tenant.logo);
    setAddress(tenant.address);
    setPhone(tenant.phone);
    setPlan(tenant.plan);
    setStatus(tenant.status);
    setOwnerName(tenant.owner_name);
    setOwnerEmail(tenant.owner_email);
    setIsModalOpen(true);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName || !ownerEmail) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const maxDoctors = plan === 'BASIC' ? 2 : plan === 'STANDARD' ? 10 : 100;
    const maxStaff = plan === 'BASIC' ? 5 : plan === 'STANDARD' ? 25 : 500;

    const tenantData: TenantHospital = {
      id: editingTenant ? editingTenant.id : `hospital-${Date.now()}`,
      name,
      logo,
      address,
      phone,
      plan,
      status,
      joined_date: editingTenant ? editingTenant.joined_date : new Date().toISOString().split('T')[0],
      expiry_date: editingTenant ? editingTenant.expiry_date : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_name: ownerName,
      owner_email: ownerEmail,
      max_doctors: maxDoctors,
      max_staff: maxStaff,
    };

    saveTenant(tenantData);
    showToast(`Hospital Tenant ${editingTenant ? 'updated' : 'registered'} successfully!`, 'success');
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteTenant(deleteId);
      showToast('Hospital Tenant deleted successfully', 'success');
      setDeleteId(null);
      refreshData();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
          SaaS Master Administration
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage multi-tenant hospitals, subscription packages, and platform revenue.</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary-teal)' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{tenants.length}</h3>
            <p className="stat-label">Total Registered Hospitals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">Rs. {calculateMRR().toLocaleString()}</h3>
            <p className="stat-label">Monthly Recurring Revenue (MRR)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{usersCount}</h3>
            <p className="stat-label">Total Platform Users (All Staff)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{tenants.filter(t => t.status === 'ACTIVE').length}</h3>
            <p className="stat-label">Active Subscriptions</p>
          </div>
        </div>
      </div>

      {/* Tenants Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Building2 size={24} style={{ color: 'var(--primary-navy)' }} /> Hospital Tenants Directory</h2>
          <button className="btn btn-teal" onClick={openAddModal}>
            <Plus size={18} /> Register New Hospital
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Owner Info</th>
                <th>Subscription Plan</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{t.logo}</span>
                      <div>
                        <div>{t.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>ID: {t.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.owner_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.owner_email}</div>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.plan === 'ENTERPRISE' ? 'badge-danger' :
                      t.plan === 'STANDARD' ? 'badge-info' : 'badge-warning'
                    }`} style={{ fontWeight: 700 }}>
                      {t.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.status === 'ACTIVE' ? 'badge-success' :
                      t.status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.joined_date}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => openEditModal(t)}>
                      Edit Plan
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => setDeleteId(t.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tenant Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>
              {editingTenant ? 'Edit Hospital Subscription' : 'Onboard New Hospital Tenant'}
            </h2>

            <form onSubmit={handleSaveTenant}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. MedCare General Hospital" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital Logo (Emoji)</label>
                  <input type="text" className="form-input" value={logo} onChange={e => setLogo(e.target.value)} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Owner / Super Admin Name</label>
                  <input type="text" className="form-input" value={ownerName} onChange={e => setOwnerName(e.target.value)} required placeholder="e.g. Dr. Sarah Jenkins" />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Email (For Admin Login)</label>
                  <input type="email" className="form-input" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required placeholder="e.g. admin@hms.com" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Subscription Package</label>
                  <select className="form-select" value={plan} onChange={e => setPlan(e.target.value as SubscriptionPlan)}>
                    <option value="BASIC">🥉 Basic Plan (Rs. 5,000/mo - 2 Doctors)</option>
                    <option value="STANDARD">🥈 Standard Plan (Rs. 15,000/mo - 10 Doctors)</option>
                    <option value="ENTERPRISE">🥇 Enterprise Plan (Rs. 35,000/mo - Unlimited)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value as SubscriptionStatus)}>
                    <option value="ACTIVE">Active (Live)</option>
                    <option value="SUSPENDED">Suspended (Payment Overdue)</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Hospital Address</label>
                  <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Health Ave" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +92 21 34567890" />
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ℹ️ <strong>Automated Action:</strong> Onboarding a new hospital will automatically generate an isolated database partition and create a Super Admin account with the Owner Email provided above.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTenant ? 'Save Changes' : 'Complete Onboarding'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Hospital Tenant"
        message="Are you absolutely sure you want to delete this hospital? All isolated patient records, appointments, and staff accounts for this hospital will be permanently wiped."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
