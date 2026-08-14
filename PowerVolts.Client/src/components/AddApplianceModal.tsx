import React, { useState } from 'react';
import { X, Plus, Zap, Check } from 'lucide-react';
import { Appliance, SavingPlanItem } from '../types';

interface AddApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliances: Appliance[];
  onAdd: (item: Partial<SavingPlanItem>) => Promise<void>;
}

export const AddApplianceModal: React.FC<AddApplianceModalProps> = ({
  isOpen,
  onClose,
  appliances,
  onAdd
}) => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<number | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [category, setCategory] = useState<string>('Hogar');
  const [watts, setWatts] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(7);
  const [scheduleRange, setScheduleRange] = useState<string>('Uso regular');
  const [notes, setNotes] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectAppliance = (app: Appliance) => {
    setSelectedApplianceId(app.id);
    setCustomName(app.name);
    setCategory(app.category);
    setWatts(app.defaultWatts);
    setHoursPerDay(Number(app.defaultDailyHours) || 4);
    setIsCustom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        applianceId: isCustom ? undefined : selectedApplianceId || undefined,
        customName: customName || 'Aparato Eléctrico',
        category: category,
        quantity: Math.max(1, quantity),
        watts: Math.max(1, watts),
        hoursPerDay: Math.max(0.1, hoursPerDay),
        daysPerWeek: Math.min(7, Math.max(1, daysPerWeek)),
        scheduleTimeRange: scheduleRange,
        notes: notes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="title-medium" style={{ margin: 0, color: 'var(--ion-color-primary)' }}>
            Añadir Electrodoméstico al Plan de Ahorro
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            className={!isCustom ? 'm3-btn-primary' : 'm3-btn-secondary'}
            onClick={() => setIsCustom(false)}
            style={{ flex: 1, padding: '10px' }}
          >
            Del Catálogo Típico
          </button>
          <button
            type="button"
            className={isCustom ? 'm3-btn-primary' : 'm3-btn-secondary'}
            onClick={() => {
              setIsCustom(true);
              setSelectedApplianceId(null);
              setCustomName('');
            }}
            style={{ flex: 1, padding: '10px' }}
          >
            Personalizado
          </button>
        </div>

        {!isCustom && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Selecciona un aparato frecuente en Nicaragua:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
              {appliances.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleSelectAppliance(app)}
                  style={{
                    border: selectedApplianceId === app.id ? '2px solid var(--ion-color-primary)' : '1px solid rgba(0,0,0,0.1)',
                    background: selectedApplianceId === app.id ? 'rgba(0,108,76,0.08)' : 'var(--m3-surface-variant)',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{app.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{app.defaultWatts} Watts · {app.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Nombre del Aparato / Habitación
            </label>
            <div className="m3-input-box">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej: Aire Acondicionado Cuarto Principal"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Potencia (Watts)
              </label>
              <div className="m3-input-box">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={watts}
                  onChange={(e) => setWatts(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Cantidad de Unidades
              </label>
              <div className="m3-input-box">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Horas de Uso al Día: {hoursPerDay}h
              </label>
              <input
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ion-color-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Días a la Semana: {daysPerWeek} días
              </label>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ion-color-primary)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Horario Programado (Opcional)
            </label>
            <div className="m3-input-box">
              <input
                type="text"
                value={scheduleRange}
                onChange={(e) => setScheduleRange(e.target.value)}
                placeholder="Ej: 21:00 a 05:00 o Solo fines de semana"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="m3-btn-primary"
            style={{ marginTop: '8px' }}
          >
            <Plus size={18} />
            <span>{loading ? 'Guardando...' : 'Agregar al Plan de Ahorro'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
