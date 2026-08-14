import React from 'react';
import { History, Trash2, RotateCw, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { MeterReading } from '../types';
import { api } from '../services/api';

interface HistoryTimelineProps {
  readings: MeterReading[];
  onRefresh: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ readings, onRefresh }) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro del historial?')) {
      await api.deleteReading(id);
      onRefresh();
    }
  };

  if (!readings || readings.length === 0) {
    return (
      <div className="m3-card" style={{ textAlign: 'center', padding: '40px' }}>
        <History size={40} opacity={0.3} style={{ margin: '0 auto 12px auto' }} />
        <h3 className="title-medium" style={{ margin: '0 0 6px 0' }}>
          No hay registros en el historial
        </h3>
        <p className="body-medium" style={{ margin: 0, fontSize: '0.88rem' }}>
          Realiza tu primer cálculo en la pestaña Medidor para comenzar a registrar tu historial.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 className="title-medium" style={{ margin: 0 }}>
          Historial de Mediciones ({readings.length})
        </h3>
        <span style={{ fontSize: '0.82rem', opacity: 0.75 }}>
          Orden cronológico inverso
        </span>
      </div>

      {readings.map((r) => {
        const dateFormatted = new Date(r.readingDate).toLocaleDateString('es-NI', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div
            key={r.id}
            className="m3-card"
            style={{
              padding: '16px',
              borderLeft: r.isOverSubsidyThreshold
                ? '4px solid var(--ion-color-danger)'
                : '4px solid var(--ion-color-primary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', opacity: 0.8, marginBottom: '4px' }}>
                  <Calendar size={14} />
                  <span>{dateFormatted}</span>
                  {r.hadRollover && (
                    <span className="m3-badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      <RotateCw size={10} />
                      Rollover Corregido
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {r.deltaNetConsumption} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kWh</span>
                  </span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                    (Lecturas: {r.readingPrevious} → {r.readingCurrent})
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
                  C$ {r.snapshotCalculatedCostNio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                  (${r.snapshotCalculatedCostUsd.toFixed(2)} USD)
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(0,0,0,0.06)'
            }}>
              <div>
                {r.isOverSubsidyThreshold ? (
                  <span className="m3-badge badge-danger">
                    <AlertTriangle size={12} />
                    Sin Subsidio (&gt; 150 kWh)
                  </span>
                ) : (
                  <span className="m3-badge badge-success">
                    <CheckCircle2 size={12} />
                    Tarifa Social (≤ 150 kWh)
                  </span>
                )}
                {r.notes && (
                  <span style={{ marginLeft: '8px', fontSize: '0.8rem', opacity: 0.8 }}>
                    {r.notes}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(r.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ion-color-danger)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem'
                }}
                title="Eliminar del historial"
              >
                <Trash2 size={15} />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
