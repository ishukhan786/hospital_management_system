import React, { useEffect, useState } from 'react';
import { Bell, Clock, Building } from 'lucide-react';
import { HospitalSettings, User } from '../../types';
import { getSettings } from '../../db/database';

interface NavbarProps {
  currentUser: User;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<HospitalSettings>(getSettings());
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = () => setSettings(getSettings());
    window.addEventListener('hms_settings_update', handleSettingsUpdate);
    return () => window.removeEventListener('hms_settings_update', handleSettingsUpdate);
  }, []);

  return (
    <header style={{
      height: '76px',
      background: 'white',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }} className="no-print">
      {/* Left: Hospital Name & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          fontSize: '2rem',
          background: 'var(--light-teal)',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)'
        }}>
          {settings.hospital_logo || '🏥'}
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            {settings.hospital_name || 'MedCare General Hospital'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            <Building size={14} />
            <span>{settings.address || 'Medical District, City'}</span>
          </div>
        </div>
      </div>

      {/* Right: Date/Time & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-main)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Clock size={18} style={{ color: 'var(--primary-teal)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{time}</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--primary-navy)',
            transition: 'var(--transition)'
          }}>
            <Bell size={20} />
          </button>
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'var(--danger)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        </div>
      </div>
    </header>
  );
};
