import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart2, PieChart, TrendingUp, CheckCircle, AlertOctagon } from 'lucide-react';
import { SavingPlanSummary } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartsProps {
  stats: any;
  planSummary: SavingPlanSummary | null;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, planSummary }) => {
  if (!stats || !stats.historyTrend || stats.historyTrend.length === 0) {
    return null;
  }

  // 1. Bar Chart Data for History Trend
  const historyLabels = stats.historyTrend.map((t: any) => t.date);
  const historyKwh = stats.historyTrend.map((t: any) => t.kwh);
  const backgroundColors = stats.historyTrend.map((t: any) =>
    t.kwh > 150 ? 'rgba(186, 26, 26, 0.7)' : 'rgba(0, 108, 76, 0.75)'
  );

  const barData = {
    labels: historyLabels,
    datasets: [
      {
        label: 'Consumo (kWh)',
        data: historyKwh,
        backgroundColor: backgroundColors,
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const val = context.raw;
            return val > 150 ? '⚠️ Excede Tarifa Social' : '✅ Tarifa Social Aplicada';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // 2. Doughnut Chart for Appliance Breakdown
  const applianceLabels = planSummary?.items.map(i => i.customName) || [];
  const applianceKwh = planSummary?.items.map(i => i.monthlyKwh) || [];
  const paletteColors = [
    '#006C4C',
    '#51DBA8',
    '#4C6358',
    '#E28704',
    '#BA1A1A',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#6366F1'
  ];

  const doughnutData = {
    labels: applianceLabels,
    datasets: [
      {
        data: applianceKwh,
        backgroundColor: paletteColors.slice(0, applianceLabels.length),
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div className="m3-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: '2px' }}>Promedio Mensual</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
            {stats.averageMonthlyKwh} <span style={{ fontSize: '0.85rem' }}>kWh</span>
          </div>
        </div>

        <div className="m3-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: '2px' }}>Gasto Histórico</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            C$ {stats.totalSpentCordobas?.toLocaleString('es-NI')}
          </div>
        </div>

        <div className="m3-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: '2px' }}>Cumplimiento Subsidio</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.subsidyAdherenceRate >= 80 ? '#006C4C' : '#BA1A1A' }}>
            {stats.subsidyAdherenceRate}%
          </div>
        </div>
      </div>

      {/* History Trend Chart */}
      <div className="m3-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={20} color="var(--ion-color-primary)" />
          <h3 className="title-medium" style={{ margin: 0 }}>
            Tendencia de Consumo (Límite 150 kWh)
          </h3>
        </div>

        <div style={{ height: '220px', width: '100%' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Appliance Breakdown Doughnut */}
      {planSummary && planSummary.items.length > 0 && (
        <div className="m3-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <PieChart size={20} color="var(--ion-color-primary)" />
            <h3 className="title-medium" style={{ margin: 0 }}>
              ¿Qué Electrodoméstico Consume Más en Tu Hogar?
            </h3>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      )}
    </div>
  );
};
