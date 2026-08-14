import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingDown, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { SavingPlanItem, SavingSimulationResult } from '../types';
import { api } from '../services/api';

interface SavingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SavingPlanItem | null;
  onApplyChanges: (itemId: number, newHours: number, newDays: number) => Promise<void>;
}

export const SavingSimulatorModal: React.FC<SavingSimulatorModalProps> = ({
  isOpen,
  onClose,
  item,
  onApplyChanges
}) => {
  if (!isOpen || !item) return null;

  const [simHours, setSimHours] = useState<number>(Math.max(1, Number(item.hoursPerDay) - 2));
  const [simDays, setSimDays] = useState<number>(Number(item.daysPerWeek));
  const [simulation, setSimulation] = useState<SavingSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setSimHours(Math.max(1, Number(item.hoursPerDay) > 2 ? Number(item.hoursPerDay) - 2 : 1));
      setSimDays(Number(item.daysPerWeek));
    }
  }, [item]);

  useEffect(() => {
    const runSimulation = async () => {
      if (!item) return;
      setLoading(true);
      try {
        const res = await api.simulateSaving({
          savingPlanItemId: item.id,
          newHoursPerDay: simHours,
          newDaysPerWeek: simDays
        });
        setSimulation(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    runSimulation();
  }, [item, simHours, simDays]);

  const handleApply = async () => {
    if (!item) return;
    setApplying(true);
    try {
      await onApplyChanges(item.id, simHours, simDays);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="m3-card" style={{
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--ion-color-primary)" />
            <h2 className="title-medium" style={{ margin: 0, color: 'var(--ion-color-primary)' }}>
              Simulador de Ahorro Energético
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: 'var(--m3-surface-variant)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700 }}>
            {item.customName}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            Potencia: <strong>{item.watts} Watts</strong> · Cantidad: <strong>{item.quantity}</strong>
          </p>
        </div>

        {/* Sliders to simulate reduction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Horas de uso al día:</span>
              <strong style={{ color: 'var(--ion-color-primary)' }}>
                {item.hoursPerDay}h <ArrowRight size={14} style={{ display: 'inline', margin: '0 4px' }} /> {simHours}h
              </strong>
            </div>
            <input
              type="range"
              min="0.5"
              max={Math.max(24, Number(item.hoursPerDay))}
              step="0.5"
              value={simHours}
              onChange={(e) => setSimHours(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ion-color-primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Días de uso a la semana:</span>
              <strong style={{ color: 'var(--ion-color-primary)' }}>
                {item.daysPerWeek} días <ArrowRight size={14} style={{ display: 'inline', margin: '0 4px' }} /> {simDays} días
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={simDays}
              onChange={(e) => setSimDays(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ion-color-primary)' }}
            />
          </div>
        </div>

        {/* Simulation Results Card */}
        {simulation && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,108,76,0.1), rgba(112,248,195,0.15))',
            border: '1.5px solid var(--ion-color-primary)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <TrendingDown size={20} color="var(--ion-color-primary)" />
              <strong style={{ fontSize: '1rem', color: 'var(--ion-color-primary)' }}>
                Impacto Proyectado de tu Ahorro:
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--m3-surface-card)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Ahorro Energético</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
                  -{simulation.savedKwh.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>kWh/mes</span>
                </div>
              </div>

              <div style={{ background: 'var(--m3-surface-card)', padding: '10px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Ahorro en Dinero</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#006C4C' }}>
                  +C$ {simulation.savedCostNio.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>(${simulation.savedCostUsd.toFixed(2)} USD)</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ion-text-color)' }}>
              <ShieldCheck size={16} color="#006C4C" />
              <span>{simulation.advice}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="m3-btn-secondary"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="m3-btn-primary"
            style={{ flex: 1.5 }}
          >
            <Check size={18} />
            <span>{applying ? 'Aplicando...' : 'Aplicar al Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
