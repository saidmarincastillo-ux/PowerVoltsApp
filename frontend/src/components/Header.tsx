import React from 'react';
import { Zap, Moon, Sun, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, darkMode, onToggleDarkMode }) => {
  return (
    <header className="flex items-center justify-between py-4 mb-4 border-b border-gray-200 dark:border-gray-800">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #006C4C, #51DBA8)',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 108, 76, 0.3)'
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
                Power Volts
              </h1>
              <span className="m3-badge badge-success" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                Nicaragua INE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.75 }}>
              Control de Medidor & Plan de Ahorro
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--m3-surface-variant)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            <ShieldCheck size={16} color="var(--ion-color-primary)" />
            <span>≤ 150 kWh Subsidio</span>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="m3-btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', minWidth: '38px', height: '38px' }}
            title="Cambiar tema claro / oscuro"
          >
            {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
