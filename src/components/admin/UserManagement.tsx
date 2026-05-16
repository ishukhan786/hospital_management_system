import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Edit, Trash2, ShieldAlert, Settings as SettingsIcon, Save } from 'lucide-react';
import { User, UserRole, AuditLog, HospitalSettings } from '../../types';
import { getUsers, saveUser, deleteUser, getAuditLogs, getSettings, saveSettings, clearAllSystemData } from '../../db/database';
import { showToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const UserManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>(getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [settings, setSettingsState] = useState<HospitalSettings>(getSettings());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [fee, setFee] = useState<number>(1500);

  // Confirm Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleFactoryReset = async () => {
    await clearAllSystemData();
    showToast('All placeholder and system records wiped clean!', 'success');
    setIsResetConfirmOpen(false);
    refreshData();
  };

  const refreshData = () => {
    setUsers(getUsers());
    setAuditLogs(getAuditLogs());
    setSettingsState(getSettings());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('RECEPTIONIST');
    setSpecialization('');
    setQualification('');
    setFee(1500);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setSpecialization(user.specialization || '');
    setQualification(user.qualification || '');
    setFee(user.fee || 1500);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const userData: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      hospital_id: editingUser ? editingUser.hospital_id : 'hospital-1',
      name,
      email,
      password_hash: editingUser ? editingUser.password_hash : 'hashed_password',
      role,
      is_active: true,
      specialization: role === 'DOCTOR' ? specialization : undefined,
      qualification: role === 'DOCTOR' ? qualification : undefined,
      fee: role === 'DOCTOR' ? fee : undefined,
    };

    saveUser(userData);
    showToast(`User ${editingUser ? 'updated' : 'created'} successfully!`);
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteUser(deleteConfirmId);
      showToast('User deleted successfully', 'success');
      setDeleteConfirmId(null);
      refreshData();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    showToast('Hospital settings updated successfully!', 'success');
  };

  return (
    <div>
      {/* Sub navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`btn ${activeSubTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Users size={18} /> User Management
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`btn ${activeSubTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
        >
          <ShieldAlert size={18} /> Audit Logs
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`btn ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
        >
          <SettingsIcon size={18} /> Hospital Settings
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeSubTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><Users size={24} style={{ color: 'var(--primary-teal)' }} /> System Users</h2>
            <button className="btn btn-teal" onClick={openAddModal}>
              <UserPlus size={18} /> Add New User
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div>{u.name}</div>
                      {u.role === 'DOCTOR' && <span style={{ fontSize: '0.75rem', color: 'var(--primary-teal)' }}>{u.specialization}</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${
                        u.role === 'SUPER_ADMIN' ? 'badge-danger' :
                        u.role === 'DOCTOR' ? 'badge-success' :
                        u.role === 'RECEPTIONIST' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => openEditModal(u)}>
                        <Edit size={16} />
                      </button>
                      {u.role !== 'SUPER_ADMIN' && (
                        <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => setDeleteConfirmId(u.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><ShieldAlert size={24} style={{ color: 'var(--danger)' }} /> System Audit Logs</h2>
            <span className="badge badge-navy">Tracking User Activity</span>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{log.user_name}</td>
                    <td><span className="badge badge-navy">{log.role.replace('_', ' ')}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{log.action}</span></td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Hospital Settings */}
      {activeSubTab === 'settings' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <h2 className="card-title"><SettingsIcon size={24} style={{ color: 'var(--primary-teal)' }} /> Configure Hospital Settings</h2>
            <span className="badge badge-success">Global Config</span>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Hospital Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.hospital_name}
                  onChange={e => setSettingsState({ ...settings, hospital_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital Logo (Emoji / Icon)</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.hospital_logo}
                  onChange={e => setSettingsState({ ...settings, hospital_logo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.address}
                  onChange={e => setSettingsState({ ...settings, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.phone}
                  onChange={e => setSettingsState({ ...settings, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Departments (Comma separated)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={settings.departments.join(', ')}
                onChange={e => setSettingsState({ ...settings, departments: e.target.value.split(',').map(d => d.trim()) })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Settings
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setIsResetConfirmOpen(true)}>
                🧹 Factory Reset / Clear All System Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            <form onSubmit={handleSaveUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">User Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="LAB_STAFF">Lab Staff</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {role === 'DOCTOR' && (
                <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '16px' }}>Doctor Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input type="text" className="form-input" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Cardiology" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Qualification</label>
                      <input type="text" className="form-input" value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. MBBS, MD" required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Consultation Fee (Rs.)</label>
                    <input type="number" className="form-input" value={fee} onChange={e => setFee(Number(e.target.value))} required />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete User"
        message="Are you sure you want to delete this user? They will immediately lose access to the system."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Factory Reset / Clear All Data"
        message="Are you absolutely sure you want to wipe all patients, doctors, appointments, prescriptions, and billing records from both local storage and Supabase? This action cannot be undone."
        onConfirm={handleFactoryReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
