import React, { useState, useEffect } from 'react';
import {
  History,
  Zap,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { AppConfig, CalculationResponse, MeterReading, TierBreakdownItem } from '../types';
import { api } from '../services/api';

interface CalculatorCardProps {
  config: AppConfig | null;
  latestReading: MeterReading | null;
  onCalculationSaved: () => void;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  config,
  latestReading,
  onCalculationSaved
}) => {
  const [previousReading, setPreviousReading] = useState<string>('');
  const [currentReading, setCurrentReading] = useState<string>('');
  const [daysElapsed, setDaysElapsed] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isAutoPrefilled, setIsAutoPrefilled] = useState<boolean>(false);
  const [saveAutomatically, setSaveAutomatically] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill previous reading from latest saved record
  useEffect(() => {
    if (latestReading && !previousReading) {
      setPreviousReading(latestReading.readingCurrent.toString());
      setIsAutoPrefilled(true);
    }
  }, [latestReading]);

  const numPrev = parseFloat(previousReading) || 0;
  const numCurr = parseFloat(currentReading) || 0;
  const isRolloverCandidate = previousReading !== '' && currentReading !== '' && numCurr < numPrev;
  const meterDigits = config?.meterMaxDigits || 5;
  const maxMeterLimit = Math.pow(10, meterDigits);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (previousReading === '' || currentReading === '') {
      setError('Por favor ingresa tanto la lectura anterior como la actual.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await api.calculateReading({
        readingPrevious: numPrev,
        readingCurrent: numCurr,
        meterMaxDigits: meterDigits,
        daysBetweenReadings: daysElapsed,
        notes: notes.trim() || undefined,
        saveToHistory: saveAutomatically
      });
      setResult(res);
      if (saveAutomatically) {
        onCalculationSaved();
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el cálculo');
    } finally {
      setLoading(false);
    }
  };

  const threshold = config?.socialTariffThresholdKwh || 150;
  const progressPercent = result
    ? Math.min(100, Math.round((result.netConsumptionKwh / threshold) * 100))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Main Input Card (Elevated M3) */}
      <div className="m3-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="title-medium" style={{ margin: 0, color: 'var(--ion-color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} />
              Registro y Cálculo de Medidor
            </h2>
            <p className="body-medium" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Ingresa los valores numéricos del medidor en kWh ({meterDigits} dígitos)
            </p>
          </div>
          {isAutoPrefilled && (
            <span className="m3-badge badge-success" title="Valor recuperado automáticamente de tu última lectura guardada">
              <CheckCircle2 size={13} />
              Lectura Precargada
            </span>
          )}
        </div>

        <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Previous Reading Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', opacity: 0.85 }}>
                Lectura Anterior (kWh)
              </label>
              <div className="m3-input-box">
                <History size={18} opacity={0.6} />
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={maxMeterLimit}
                  placeholder="00000"
                  value={previousReading}
                  onChange={(e) => {
                    setPreviousReading(e.target.value);
                    setIsAutoPrefilled(false);
                  }}
                  required
                />
              </div>
            </div>

            {/* Current Reading Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', opacity: 0.85 }}>
                Lectura Actual (kWh)
              </label>
              <div className="m3-input-box">
                <Zap size={18} color="var(--ion-color-primary)" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={maxMeterLimit}
                  placeholder="00000"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Rollover Alert Notice (Mathematical Compensation) */}
          {isRolloverCandidate && (
            <div style={{
              background: 'rgba(0, 108, 76, 0.08)',
              border: '1px solid var(--ion-color-primary)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <RotateCw size={18} color="var(--ion-color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Reinicio de Medidor Detectado (Rollover):</strong>
                <div style={{ opacity: 0.85, marginTop: '2px' }}>
                  La lectura actual ({currentReading}) es menor que la anterior ({previousReading}). El algoritmo corregirá automáticamente el desbordamiento sumando la capacidad del medidor ({maxMeterLimit.toLocaleString()} kWh).
                </div>
              </div>
            </div>
          )}

          {/* Additional Options Accordion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '4px', opacity: 0.75 }}>
                Días del Periodo
              </label>
              <div className="m3-input-box" style={{ padding: '8px 12px' }}>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={daysElapsed}
                  onChange={(e) => setDaysElapsed(parseInt(e.target.value) || 30)}
                  style={{ fontSize: '1rem' }}
                />
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>días</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '4px', opacity: 0.75 }}>
                Nota / Ubicación
              </label>
              <div className="m3-input-box" style={{ padding: '8px 12px' }}>
                <input
                  type="text"
                  placeholder="Ej: Casa, Negocio..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={saveAutomatically}
                onChange={(e) => setSaveAutomatically(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--ion-color-primary)' }}
              />
              Guardar automáticamente en el Historial
            </label>
          </div>

          {error && (
            <div style={{ color: 'var(--ion-color-danger)', fontSize: '0.88rem', background: 'var(--m3-error-container)', padding: '10px 14px', borderRadius: '10px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="m3-btn-primary"
          >
            {loading ? (
              <span>Calculando...</span>
            ) : (
              <>
                <Zap size={20} />
                <span>Calcular Gasto Estimado</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Card (Material 3 Dynamic State) */}
      {result && (
        <div className={result.isEligibleForSocialTariff ? 'm3-card-primary' : 'm3-card-danger'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                Gasto Total Estimado
              </span>
              <div className="display-huge" style={{ margin: '4px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span>C$ {result.calculatedCostNio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.85 }}>
                  (${result.calculatedCostUsd.toFixed(2)} USD)
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Consumo Neto</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {result.netConsumptionKwh} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kWh</span>
              </div>
            </div>
          </div>

          {/* Subsidized Savings Highlight */}
          {result.isEligibleForSocialTariff && result.subsidySavedAmountNio > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#70F8C3" />
                <span>Ahorro por Subsidio Tarifa Social (INE):</span>
              </div>
              <strong style={{ fontSize: '1rem', color: '#70F8C3' }}>
                + C$ {result.subsidySavedAmountNio.toFixed(2)}
              </strong>
            </div>
          )}

          {/* Linear Progress Bar to 150 kWh */}
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', opacity: 0.95 }}>
              <span>Límite Tarifa Social (150 kWh): <strong>{result.netConsumptionKwh} / {threshold} kWh</strong></span>
              <span><strong>{progressPercent}%</strong></span>
            </div>
            <div className="m3-progress-track" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
              <div
                className="m3-progress-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: result.netConsumptionKwh > threshold
                    ? '#ffffff'
                    : progressPercent > 80
                    ? '#f59e0b'
                    : '#70F8C3'
                }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.15)',
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}>
            {result.statusMessage}
          </div>

          {/* Breakdown Toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={{
              marginTop: '14px',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>Ver Desglose de Bloques Tarifarios</span>
            {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Detailed Breakdown */}
          {showBreakdown && result.breakdown && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {result.breakdown.map((tier: TierBreakdownItem, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                  <div>
                    <div><strong>{tier.tierName}</strong></div>
                    <div style={{ opacity: 0.8 }}>{tier.kwhInTier} kWh @ C$ {tier.ratePerKwh.toFixed(2)} {tier.subsidyPercentage > 0 ? `(-${tier.subsidyPercentage}%)` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>C$ {tier.subtotalNio.toFixed(2)}</strong>
                    {tier.subsidyDiscountNio > 0 && (
                      <div style={{ color: '#70F8C3', fontSize: '0.75rem' }}>Desc: -C$ {tier.subsidyDiscountNio.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              ))}

              {result.fixedCommercialChargeNio > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span>Cargo Fijo Comercialización:</span>
                  <strong>C$ {result.fixedCommercialChargeNio.toFixed(2)}</strong>
                </div>
              )}

              {result.publicLightingTaxNio > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tasa de Alumbrado Público:</span>
                  <strong>C$ {result.publicLightingTaxNio.toFixed(2)}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
