import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  Calendar,
  Stethoscope,
  FileText,
  DollarSign,
  Receipt,
  TestTube,
  Settings,
  LogOut,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { logoutUser, setCurrentUser, getUsers } from '../../db/database';
import { showToast } from './Toast';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, setActiveTab }) => {
  const allUsers = getUsers();

  const handleRoleSwitch = (role: UserRole) => {
    const userForRole = allUsers.find(u => u.role === role) || allUsers[0];
    setCurrentUser(userForRole);
    showToast(`Switched to ${role} (${userForRole.name})`, 'info');
    setActiveTab('dashboard');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'CASHIER', 'LAB_STAFF'] },

    // Super Admin
    { id: 'users', label: 'User Management', icon: Users, roles: ['SUPER_ADMIN'] },
    { id: 'audit_logs', label: 'Audit Logs', icon: ShieldAlert, roles: ['SUPER_ADMIN'] },
    { id: 'settings', label: 'Hospital Settings', icon: Settings, roles: ['SUPER_ADMIN'] },

    // Receptionist / Admin
    { id: 'register_patient', label: 'Register Patient', icon: UserPlus, roles: ['SUPER_ADMIN', 'RECEPTIONIST'] },
    { id: 'search_patient', label: 'Patient Search', icon: Search, roles: ['SUPER_ADMIN', 'RECEPTIONIST', 'CASHIER'] },
    { id: 'book_appointment', label: 'Appointments', icon: Calendar, roles: ['SUPER_ADMIN', 'RECEPTIONIST'] },

    // Doctor
    { id: 'doctor_panel', label: 'My Appointments', icon: Stethoscope, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    { id: 'examination', label: 'Patient Examination', icon: FileText, roles: ['SUPER_ADMIN', 'DOCTOR'] },

    // Cashier
    { id: 'opd_fee', label: 'OPD Fee Management', icon: DollarSign, roles: ['SUPER_ADMIN', 'CASHIER'] },
    { id: 'ipd_fee', label: 'IPD Admissions & Fee', icon: Activity, roles: ['SUPER_ADMIN', 'CASHIER'] },
    { id: 'fee_reports', label: 'Fee Reports', icon: Receipt, roles: ['SUPER_ADMIN', 'CASHIER'] },

    // Lab Staff
    { id: 'lab_management', label: 'Laboratory Module', icon: TestTube, roles: ['SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return { label: 'Super Admin', bg: '#ffe4e6', color: '#be123c' };
      case 'RECEPTIONIST': return { label: 'Receptionist', bg: '#e0f2fe', color: '#0369a1' };
      case 'DOCTOR': return { label: 'Doctor', bg: '#dcfce7', color: '#15803d' };
      case 'CASHIER': return { label: 'Cashier', bg: '#fef3c7', color: '#b45309' };
      case 'LAB_STAFF': return { label: 'Lab Staff', bg: '#f3e8ff', color: '#6b21a8' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <aside style={{
      width: '280px',
      background: 'var(--primary-navy)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 10px rgba(0,0,0,0.15)',
      zIndex: 100,
      transition: 'var(--transition)',
      flexShrink: 0
    }} className="no-print">
      {/* Header / App Logo */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--primary-teal)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
        }}>
          🏥
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>HMS Portal</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-teal)', fontWeight: 600 }}>Multi-Role System</p>
        </div>
      </div>

      {/* User Info & Role Badge */}
      <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{currentUser.name}</span>
          <span style={{
            background: badge.bg,
            color: badge.color,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            {badge.label}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '12px', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px' }}>
          Navigation Menu
        </p>
        {filteredMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isActive ? 'linear-gradient(135deg, var(--primary-teal), var(--secondary-teal))' : 'transparent',
                color: isActive ? 'white' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'var(--transition)',
                boxShadow: isActive ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none'
              }}
            >
              <Icon size={20} style={{ color: isActive ? 'white' : 'var(--secondary-teal)' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Quick Role Switcher for Testing/Evaluation */}
      <div style={{
        padding: '16px',
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ Quick Role Switcher
        </label>
        <select
          value={currentUser.role}
          onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--primary-navy)',
            color: 'white',
            border: '1px solid var(--secondary-teal)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="SUPER_ADMIN">👑 Super Admin</option>
          <option value="RECEPTIONIST">📋 Receptionist</option>
          <option value="DOCTOR">🩺 Doctor</option>
          <option value="CASHIER">💵 Cashier</option>
          <option value="LAB_STAFF">🧪 Lab Staff</option>
        </select>

        <button
          onClick={() => logoutUser()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginTop: '4px',
            transition: 'var(--transition)'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
