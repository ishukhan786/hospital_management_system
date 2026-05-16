import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { User, UserRole } from '../../types';
import { getUsers, setCurrentUser } from '../../db/database';
import { showToast } from '../common/Toast';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const allUsers = getUsers();
  const [email, setEmail] = useState('admin@hms.com');
  const [password, setPassword] = useState('password123');
  const [selectedRoleDemo, setSelectedRoleDemo] = useState<UserRole>('SUPER_ADMIN');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRoleDemo(role);
    const u = allUsers.find(usr => usr.role === role);
    if (u) {
      setEmail(u.email);
      setPassword('password123'); // Demo password
      showToast(`Demo credentials filled for ${role.replace('_', ' ')}`, 'info');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (!found.is_active) {
        showToast('Your account has been deactivated by Super Admin', 'error');
        return;
      }
      setCurrentUser(found);
      showToast(`Welcome back, ${found.name}! (${found.role.replace('_', ' ')})`, 'success');
      onLoginSuccess();
    } else {
      showToast('Invalid email credentials. Please use the demo buttons below.', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, var(--primary-navy), var(--secondary-navy))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px', margin: 0, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--primary-teal)',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            margin: '0 auto 16px',
            boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.4)'
          }}>
            🏥
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>MedCare HMS Portal</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Secure Multi-Role Hospital Management System</p>
        </div>

        {/* Demo Fast Login Selector */}
        <div style={{ marginBottom: '28px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
            ⚡ Fast Demo Credentials Selector
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button type="button" className={`btn ${selectedRoleDemo === 'SAAS_MASTER_ADMIN' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem', gridColumn: 'span 3', background: selectedRoleDemo === 'SAAS_MASTER_ADMIN' ? 'var(--primary-navy)' : undefined, color: selectedRoleDemo === 'SAAS_MASTER_ADMIN' ? 'white' : undefined }} onClick={() => handleRoleSelect('SAAS_MASTER_ADMIN')}>
              🚀 SaaS Platform Owner (Master Dashboard)
            </button>
            <button type="button" className={`btn ${selectedRoleDemo === 'SUPER_ADMIN' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => handleRoleSelect('SUPER_ADMIN')}>
              👑 Admin
            </button>
            <button type="button" className={`btn ${selectedRoleDemo === 'RECEPTIONIST' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => handleRoleSelect('RECEPTIONIST')}>
              📋 Reception
            </button>
            <button type="button" className={`btn ${selectedRoleDemo === 'DOCTOR' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => handleRoleSelect('DOCTOR')}>
              🩺 Doctor
            </button>
            <button type="button" className={`btn ${selectedRoleDemo === 'CASHIER' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => handleRoleSelect('CASHIER')}>
              💵 Cashier
            </button>
            <button type="button" className={`btn ${selectedRoleDemo === 'LAB_STAFF' ? 'btn-teal' : 'btn-outline'}`} style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => handleRoleSelect('LAB_STAFF')}>
              🧪 Lab Staff
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Enter user email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            <UserCheck size={20} /> Secure Sign In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '28px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ShieldAlert size={16} style={{ color: 'var(--success)' }} />
          <span>Role-Based Access Control (RBAC) Active & Encrypted</span>
        </div>
      </div>
    </div>
  );
};
