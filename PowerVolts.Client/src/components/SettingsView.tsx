import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { AppConfig, TariffConfig } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  config: AppConfig | null;
  tariff: TariffConfig | null;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, tariff, onRefresh }) => {
  const [currency, setCurrency] = useState<string>('NIO');
  const [exchangeRate, setExchangeRate] = useState<number>(36.70);
  const [meterDigits, setMeterDigits] = useState<number>(5);
  const [thresholdKwh, setThresholdKwh] = useState<number>(150);

  const [basePrice, setBasePrice] = useState<number>(6.45);
  const [fixedCharge, setFixedCharge] = useState<number>(45.50);
  const [lightingTax, setLightingTax] = useState<number>(8.5);
  const [extraRate, setExtraRate] = useState<number>(9.80);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (config) {
      setCurrency(config.defaultCurrency || 'NIO');
      setExchangeRate(Number(config.exchangeRateNioToUsd) || 36.70);
      setMeterDigits(Number(config.meterMaxDigits) || 5);
      setThresholdKwh(Number(config.socialTariffThresholdKwh) || 150);
    }
    if (tariff) {
      setBasePrice(Number(tariff.basePricePerKwh) || 6.45);
      setFixedCharge(Number(tariff.fixedCommercialCharge) || 45.50);
      setLightingTax(Number(tariff.publicLightingTaxPercentage) || 8.5);
      setExtraRate(Number(tariff.nonSubsidizedExtraRate) || 9.80);
    }
  }, [config, tariff]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage(null);
    try {
      if (config) {
        await api.updateConfig({
          id: config.id,
          defaultCurrency: currency,
          exchangeRateNioToUsd: exchangeRate,
          meterMaxDigits: meterDigits,
          socialTariffThresholdKwh: thresholdKwh
        });
      }

      if (tariff) {
        await api.updateTariff({
          ...tariff,
          basePricePerKwh: basePrice,
          fixedCommercialCharge: fixedCharge,
          publicLightingTaxPercentage: lightingTax,
          nonSubsidizedExtraRate: extraRate
        });
      }

      setSavedMessage('¡Configuración guardada exitosamente!');
      onRefresh();
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* General App Settings */}
      <div className="m3-card">
        <h2 className="title-medium" style={{ margin: '0 0 14px 0', color: 'var(--ion-color-primary)' }}>
          ⚙️ Preferencias y Medidor Físico
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Moneda Principal
            </label>
            <div className="m3-input-box">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  width: '100%',
                  color: 'var(--ion-text-color)'
                }}
              >
                <option value="NIO">Córdoba Nicaragüense (C$)</option>
                <option value="USD">Dólar Estadounidense ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Tipo de Cambio (C$ / 1 USD)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 36.70)}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Dígitos del Medidor Eléctrico
            </label>
            <div className="m3-input-box">
              <select
                value={meterDigits}
                onChange={(e) => setMeterDigits(parseInt(e.target.value) || 5)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  width: '100%',
                  color: 'var(--ion-text-color)'
                }}
              >
                <option value="5">5 dígitos (máx 99,999 kWh)</option>
                <option value="6">6 dígitos (máx 999,999 kWh)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Umbral Tarifa Social (kWh)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                value={thresholdKwh}
                onChange={(e) => setThresholdKwh(parseFloat(e.target.value) || 150)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tariff Regulatory Parameters (INE / DISNORTE-DISSUR) */}
      <div className="m3-card">
        <h2 className="title-medium" style={{ margin: '0 0 14px 0', color: 'var(--ion-color-primary)' }}>
          📋 Pliego Tarifario (Nicaragua INE)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Precio Base por kWh (C$)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Tarifa Plena &gt; 150 kWh (C$)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                step="0.01"
                value={extraRate}
                onChange={(e) => setExtraRate(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Cargo Fijo Comercialización (C$)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                step="0.01"
                value={fixedCharge}
                onChange={(e) => setFixedCharge(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Tasa Alumbrado Público (%)
            </label>
            <div className="m3-input-box">
              <input
                type="number"
                step="0.1"
                value={lightingTax}
                onChange={(e) => setLightingTax(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </div>

        {/* Subsidized blocks summary */}
        <div style={{
          marginTop: '16px',
          background: 'var(--m3-surface-variant)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '0.82rem'
        }}>
          <strong>Estratificación Legal de la Tarifa Social (Ley 971 / INE):</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
            <li>Bloque 1 (0 - 50 kWh): 50% de subsidio estatal</li>
            <li>Bloque 2 (51 - 100 kWh): 45% de subsidio estatal</li>
            <li>Bloque 3 (101 - 150 kWh): 25% de subsidio estatal</li>
          </ul>
        </div>
      </div>

      {savedMessage && (
        <div style={{
          background: 'rgba(112, 248, 195, 0.25)',
          color: '#004d36',
          border: '1px solid #70f8c3',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <Check size={18} />
          <span>{savedMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="m3-btn-primary"
      >
        <Save size={18} />
        <span>{loading ? 'Guardando...' : 'Guardar Cambios de Configuración'}</span>
      </button>
    </form>
  );
};
