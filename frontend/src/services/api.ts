import {
  AppConfig,
  TariffConfig,
  MeterReading,
  CalculationResponse,
  Appliance,
  SavingPlanSummary,
  SavingPlanItem,
  SavingSimulationResult
} from '../types';

const API_BASE = '/api';

export const api = {
  // Config
  async getConfig(): Promise<AppConfig> {
    const res = await fetch(`${API_BASE}/appconfig`);
    if (!res.ok) throw new Error('Error al obtener configuración');
    return res.json();
  },

  async updateConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    const res = await fetch(`${API_BASE}/appconfig`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Error al actualizar configuración');
    return res.json();
  },

  // Tariffs
  async getActiveTariff(): Promise<TariffConfig> {
    const res = await fetch(`${API_BASE}/tariffs/active`);
    if (!res.ok) throw new Error('Error al obtener tarifa activa');
    return res.json();
  },

  async updateTariff(tariff: TariffConfig): Promise<TariffConfig> {
    const res = await fetch(`${API_BASE}/tariffs/${tariff.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tariff)
    });
    if (!res.ok) throw new Error('Error al actualizar tarifa');
    return res.json();
  },

  // Meter Readings
  async getLatestReading(): Promise<MeterReading | null> {
    const res = await fetch(`${API_BASE}/meterreadings/latest`);
    if (!res.ok) return null;
    return res.json();
  },

  async getAllReadings(): Promise<MeterReading[]> {
    const res = await fetch(`${API_BASE}/meterreadings`);
    if (!res.ok) throw new Error('Error al obtener lecturas');
    return res.json();
  },

  async calculateReading(payload: {
    readingPrevious: number;
    readingCurrent: number;
    meterMaxDigits?: number;
    daysBetweenReadings?: number;
    notes?: string;
    saveToHistory?: boolean;
  }): Promise<CalculationResponse> {
    const res = await fetch(`${API_BASE}/meterreadings/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error en el cálculo');
    return res.json();
  },

  async deleteReading(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/meterreadings/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar lectura');
  },

  async getReadingStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/meterreadings/stats`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    return res.json();
  },

  // Appliances
  async getAllAppliances(): Promise<Appliance[]> {
    const res = await fetch(`${API_BASE}/appliances`);
    if (!res.ok) throw new Error('Error al obtener electrodomésticos');
    return res.json();
  },

  // Saving Plans
  async getActiveSavingPlan(): Promise<SavingPlanSummary> {
    const res = await fetch(`${API_BASE}/savingplans/active`);
    if (!res.ok) throw new Error('Error al obtener plan de ahorro');
    return res.json();
  },

  async addPlanItem(planId: number, item: Partial<SavingPlanItem>): Promise<SavingPlanItem> {
    const res = await fetch(`${API_BASE}/savingplans/${planId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Error al agregar electrodoméstico al plan');
    return res.json();
  },

  async updatePlanItem(itemId: number, item: Partial<SavingPlanItem>): Promise<SavingPlanItem> {
    const res = await fetch(`${API_BASE}/savingplans/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Error al actualizar electrodoméstico');
    return res.json();
  },

  async deletePlanItem(itemId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/savingplans/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar electrodoméstico del plan');
  },

  async simulateSaving(payload: {
    savingPlanItemId: number;
    newHoursPerDay: number;
    newDaysPerWeek: number;
  }): Promise<SavingSimulationResult> {
    const res = await fetch(`${API_BASE}/savingplans/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al simular ahorro');
    return res.json();
  }
};
