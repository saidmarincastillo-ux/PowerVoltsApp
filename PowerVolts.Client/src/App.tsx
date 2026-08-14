import React, { useState, useEffect } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  setupIonicReact
} from '@ionic/react';
import {
  Zap,
  Sparkles,
  History,
  Settings,
  TrendingDown,
  BarChart2
} from 'lucide-react';

/* Core Ionic CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme variables and M3 styles */
import './theme/variables.css';
import './theme/m3-theme.css';

import { Header } from './components/Header';
import { CalculatorCard } from './components/CalculatorCard';
import { SavingPlanWizard } from './components/SavingPlanWizard';
import { HistoryTimeline } from './components/HistoryTimeline';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { SettingsView } from './components/SettingsView';

import { AppConfig, TariffConfig, MeterReading, Appliance, SavingPlanSummary } from './types';
import { api } from './services/api';

setupIonicReact({
  mode: 'md' // Force Material Design 3 mode across all devices
});

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'saving-plan' | 'history' | 'settings'>('calculator');
  const [historySubTab, setHistorySubTab] = useState<'list' | 'analytics'>('list');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [tariff, setTariff] = useState<TariffConfig | null>(null);
  const [latestReading, setLatestReading] = useState<MeterReading | null>(null);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [planSummary, setPlanSummary] = useState<SavingPlanSummary | null>(null);
  const [stats, setStats] = useState<any>(null);

  const loadData = async () => {
    try {
      const [cfg, trf, latest, allReadings, apps, plan, st] = await Promise.allSettled([
        api.getConfig(),
        api.getActiveTariff(),
        api.getLatestReading(),
        api.getAllReadings(),
        api.getAllAppliances(),
        api.getActiveSavingPlan(),
        api.getReadingStats()
      ]);

      if (cfg.status === 'fulfilled') setConfig(cfg.value);
      if (trf.status === 'fulfilled') setTariff(trf.value);
      if (latest.status === 'fulfilled') setLatestReading(latest.value);
      if (allReadings.status === 'fulfilled') setReadings(allReadings.value);
      if (apps.status === 'fulfilled') setAppliances(apps.value);
      if (plan.status === 'fulfilled') setPlanSummary(plan.value);
      if (st.status === 'fulfilled') setStats(st.value);
    } catch (err) {
      console.error('Error loading initial data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  return (
    <IonApp>
      <IonContent fullscreen className="ion-padding">
        <div className="app-container">
          <Header
            config={config}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          {/* Main Tab Content */}
          <main style={{ marginTop: '12px' }}>
            {activeTab === 'calculator' && (
              <CalculatorCard
                config={config}
                latestReading={latestReading}
                onCalculationSaved={() => {
                  loadData();
                }}
              />
            )}

            {activeTab === 'saving-plan' && (
              <SavingPlanWizard
                planSummary={planSummary}
                appliances={appliances}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Subtabs for List vs Analytics */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--m3-surface-variant)', padding: '4px', borderRadius: '14px' }}>
                  <button
                    onClick={() => setHistorySubTab('list')}
                    className={historySubTab === 'list' ? 'm3-btn-primary' : 'm3-btn-secondary'}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                  >
                    <History size={16} />
                    <span>Listado de Lecturas</span>
                  </button>
                  <button
                    onClick={() => setHistorySubTab('analytics')}
                    className={historySubTab === 'analytics' ? 'm3-btn-primary' : 'm3-btn-secondary'}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                  >
                    <BarChart2 size={16} />
                    <span>Gráficos y Estadísticas</span>
                  </button>
                </div>

                {historySubTab === 'list' ? (
                  <HistoryTimeline
                    readings={readings}
                    onRefresh={loadData}
                  />
                ) : (
                  <AnalyticsCharts
                    stats={stats}
                    planSummary={planSummary}
                  />
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsView
                config={config}
                tariff={tariff}
                onRefresh={loadData}
              />
            )}
          </main>
        </div>
      </IonContent>

      {/* Modern Material Design 3 Bottom Navigation Bar */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--m3-surface-card)',
        borderTop: '1px solid rgba(0, 108, 76, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 12px 14px 12px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            background: activeTab === 'calculator' ? 'rgba(112, 248, 195, 0.25)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '6px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'calculator' ? 'var(--ion-color-primary)' : 'var(--ion-text-color)',
            opacity: activeTab === 'calculator' ? 1 : 0.65,
            cursor: 'pointer',
            fontWeight: activeTab === 'calculator' ? 700 : 500,
            fontSize: '0.75rem',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={20} color={activeTab === 'calculator' ? 'var(--ion-color-primary)' : 'currentColor'} />
          <span>Medidor</span>
        </button>

        <button
          onClick={() => setActiveTab('saving-plan')}
          style={{
            background: activeTab === 'saving-plan' ? 'rgba(112, 248, 195, 0.25)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '6px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'saving-plan' ? 'var(--ion-color-primary)' : 'var(--ion-text-color)',
            opacity: activeTab === 'saving-plan' ? 1 : 0.65,
            cursor: 'pointer',
            fontWeight: activeTab === 'saving-plan' ? 700 : 500,
            fontSize: '0.75rem',
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={20} color={activeTab === 'saving-plan' ? 'var(--ion-color-primary)' : 'currentColor'} />
          <span>Plan Ahorro</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: activeTab === 'history' ? 'rgba(112, 248, 195, 0.25)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '6px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'history' ? 'var(--ion-color-primary)' : 'var(--ion-text-color)',
            opacity: activeTab === 'history' ? 1 : 0.65,
            cursor: 'pointer',
            fontWeight: activeTab === 'history' ? 700 : 500,
            fontSize: '0.75rem',
            transition: 'all 0.2s'
          }}
        >
          <History size={20} color={activeTab === 'history' ? 'var(--ion-color-primary)' : 'currentColor'} />
          <span>Historial</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            background: activeTab === 'settings' ? 'rgba(112, 248, 195, 0.25)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '6px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: activeTab === 'settings' ? 'var(--ion-color-primary)' : 'var(--ion-text-color)',
            opacity: activeTab === 'settings' ? 1 : 0.65,
            cursor: 'pointer',
            fontWeight: activeTab === 'settings' ? 700 : 500,
            fontSize: '0.75rem',
            transition: 'all 0.2s'
          }}
        >
          <Settings size={20} color={activeTab === 'settings' ? 'var(--ion-color-primary)' : 'currentColor'} />
          <span>Ajustes</span>
        </button>
      </footer>
    </IonApp>
  );
};

export default App;
