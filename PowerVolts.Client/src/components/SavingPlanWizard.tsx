import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Clock,
  Zap,
  TrendingDown,
  Info
} from 'lucide-react';
import { SavingPlanSummary, SavingPlanItem, Appliance } from '../types';
import { api } from '../services/api';
import { AddApplianceModal } from './AddApplianceModal';
import { SavingSimulatorModal } from './SavingSimulatorModal';

interface SavingPlanWizardProps {
  planSummary: SavingPlanSummary | null;
  appliances: Appliance[];
  onRefresh: () => void;
}

export const SavingPlanWizard: React.FC<SavingPlanWizardProps> = ({
  planSummary,
  appliances,
  onRefresh
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [simulatingItem, setSimulatingItem] = useState<SavingPlanItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  if (!planSummary) {
    return (
      <div className="m3-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando plan de ahorro...</p>
      </div>
    );
  }

  const handleAddAppliance = async (item: Partial<SavingPlanItem>) => {
    await api.addPlanItem(planSummary.id, item);
    onRefresh();
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('¿Seguro que deseas remover este electrodoméstico del plan?')) {
      await api.deletePlanItem(itemId);
      onRefresh();
    }
  };

  const handleApplySimulatedChanges = async (itemId: number, newHours: number, newDays: number) => {
    await api.updatePlanItem(itemId, {
      hoursPerDay: newHours,
      daysPerWeek: newDays
    });
    onRefresh();
  };

  const threshold = planSummary.targetKwhLimit || 150;
  const isOver = planSummary.totalCalculatedKwh > threshold;
  const percentOfTarget = Math.min(100, Math.round((planSummary.totalCalculatedKwh / threshold) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Plan Header Summary Card */}
      <div className={!isOver ? 'm3-card-primary' : 'm3-card-danger'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9, fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>PLAN DE AHORRO ENERGÉTICO (NICARAGUA)</span>
            </div>
            <h2 className="headline-large" style={{ margin: '4px 0 8px 0', fontSize: '1.6rem' }}>
              {planSummary.planName}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.85 }}>
              {planSummary.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Presupuesto Proyectado</span>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>
              C$ {planSummary.totalCalculatedCostNio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              (${planSummary.totalCalculatedCostUsd.toFixed(2)} USD)
            </div>
          </div>
        </div>

        {/* Progress Toward 150 kWh Subsidized Limit */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
            <span>
              Consumo Planificado: <strong>{planSummary.totalCalculatedKwh} / {threshold} kWh</strong>
            </span>
            <span>
              {isOver ? (
                <strong style={{ color: '#ffdad6' }}>¡Excede por +{(planSummary.totalCalculatedKwh - threshold).toFixed(1)} kWh!</strong>
              ) : (
                <strong style={{ color: '#70F8C3' }}>Margen Seguro: {planSummary.remainingKwhMargin} kWh libres</strong>
              )}
            </span>
          </div>

          <div className="m3-progress-track" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
            <div
              className="m3-progress-fill"
              style={{
                width: `${percentOfTarget}%`,
                background: isOver ? '#ffffff' : percentOfTarget > 85 ? '#f59e0b' : '#70F8C3'
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="title-medium" style={{ margin: 0 }}>
            Electrodomésticos y Horarios de Uso ({planSummary.items.length})
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', opacity: 0.75 }}>
            Ajusta los tiempos de encendido diario para optimizar tu factura
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="m3-btn-primary"
          style={{ width: 'auto', padding: '10px 18px', fontSize: '0.9rem' }}
        >
          <Plus size={18} />
          <span>Añadir Aparato</span>
        </button>
      </div>

      {/* Appliance Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {planSummary.items.map((item) => (
          <div
            key={item.id}
            className="m3-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderLeft: item.watts >= 1000 ? '4px solid var(--ion-color-danger)' : '4px solid var(--ion-color-primary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'var(--m3-surface-variant)',
                  padding: '10px',
                  borderRadius: '12px',
                  color: 'var(--ion-color-primary)'
                }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    {item.customName}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.8rem', opacity: 0.75 }}>
                    <span>{item.quantity} unid. × {item.watts}W</span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
                  C$ {item.monthlyCostNio.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                  {item.monthlyKwh} kWh/mes ({item.percentageOfTotalPlan}% del total)
                </div>
              </div>
            </div>

            {/* Time schedule & Hours Controls */}
            <div style={{
              background: 'var(--m3-surface-variant)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} opacity={0.7} />
                <span>
                  <strong>{item.hoursPerDay}h</strong>/día · <strong>{item.daysPerWeek}</strong> días/sem
                </span>
                {item.scheduleTimeRange && (
                  <span className="m3-badge badge-success" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {item.scheduleTimeRange}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setSimulatingItem(item)}
                  className="m3-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  title="Simular cuánto ahorras si reduces horas"
                >
                  <TrendingDown size={14} color="var(--ion-color-primary)" />
                  <span>Simular Ahorro</span>
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ion-color-danger)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                  title="Eliminar del plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {item.efficiencyTip && (
              <div style={{ fontSize: '0.78rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="var(--ion-color-primary)" style={{ flexShrink: 0 }} />
                <span>{item.efficiencyTip}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Smart Recommendations Engine */}
      {planSummary.recommendations && planSummary.recommendations.length > 0 && (
        <div className="m3-card" style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Lightbulb size={22} color="var(--ion-color-warning)" />
            <h3 className="title-medium" style={{ margin: 0 }}>
              Recomendaciones Inteligentes para Reducir tu Factura
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {planSummary.recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--m3-surface-variant)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  borderLeft: rec.impactLevel === 'Alta' ? '4px solid var(--ion-color-danger)' : '4px solid var(--ion-color-primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{rec.title}</strong>
                  {rec.potentialCordobasSaved > 0 && (
                    <span className="m3-badge badge-success">
                      Ahorra ~C$ {rec.potentialCordobasSaved.toFixed(0)}/mes
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.85, lineHeight: 1.4 }}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddApplianceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        appliances={appliances}
        onAdd={handleAddAppliance}
      />

      <SavingSimulatorModal
        isOpen={!!simulatingItem}
        onClose={() => setSimulatingItem(null)}
        item={simulatingItem}
        onApplyChanges={handleApplySimulatedChanges}
      />
    </div>
  );
};
