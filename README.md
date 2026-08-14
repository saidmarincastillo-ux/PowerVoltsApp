# ⚡ Power Volts - Control de Consumo Eléctrico y Plan de Ahorro Energético

[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Ionic Framework](https://img.shields.io/badge/Ionic-8.0-3880FF?logo=ionic&logoColor=white)](https://ionicframework.com/)
[![SQLite](https://img.shields.io/badge/SQLite-EF_Core-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Material Design 3](https://img.shields.io/badge/Design-Material_3-006C4C)](https://m3.material.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Power Volts** es una plataforma móvil e integral diseñada para empoderar a hogares y pequeños comercios mediante el control analítico, predictivo y en tiempo real de su facturación eléctrica. Diseñada con prioridad en el pliego tarifario nicaragüense (**INE / DISNORTE-DISSUR**) y adaptable a cualquier jurisdicción, incorpora un **motor de detección de rollover de medidores** y un **módulo avanzado de Plan de Ahorro Energético**.

---

## 🎯 Características Principales

- **⚡ Calculadora Rápida y Medidor Físico**:
  - Interfaz de entrada minimalista (Lectura Anterior y Lectura Actual).
  - Autocompletado inteligente de lecturas previas desde la base de datos local.
  - **Algoritmo de Rollover (Desbordamiento)**: Compensación automática en medidores mecánicos o digitales de 5 y 6 dígitos cuando el contador pasa de 99999 a 00000.
- **🇳🇮 Pliego Tarifario de Nicaragua (INE / DISNORTE-DISSUR)**:
  - Soporte de **Tarifa Social ($\le 150\text{ kWh}$)** con estratificación legal de subsidios (Bloques al 50%, 45% y 25%).
  - Detección de pérdida de subsidio con semáforo visual punitivo en **Rojo Carmesí (`#BA1A1A`)** y cargos fijos por comercialización.
  - Soporte en moneda local **Córdobas (`C$ NIO`)** y conversión automática a **Dólares (`$ USD`)**.
- **💡 Plan de Ahorro Energético**:
  - Catálogo precargado de electrodomésticos (Aires Acondicionados Inverter y Convencionales, Refrigeradores, Abanicos, TVs, Bombillos LED, etc.).
  - Programación horaria diaria y días de uso por aparato.
  - **Simulador Interactivo "¿Qué pasa si reduzco horas?"**: Simula recortes de horas en equipos pesados y proyecta Córdobas ahorrados al mes.
  - Recomendaciones inteligentes para eliminar cargas fantasma y migrar a tecnologías eficientes.
- **📊 Historial y Analítica Visual**:
  - Registro de mediciones con fecha, delta de consumo, costos y notas.
  - Gráficos interactivos de tendencias con **Chart.js** y distribución de consumo por aparato.

---

## 🏗️ Arquitectura del Sistema

```
PowerVoltsApp/
├── backend/                                 # Backend .NET Core 8 Web API (C#)
│   ├── Controllers/                         # Endpoints REST API
│   │   ├── MeterReadingsController.cs       # Cálculo y guardado de lecturas
│   │   ├── SavingPlansController.cs         # Gestión de planes y simulaciones
│   │   ├── AppliancesController.cs          # Catálogo de electrodomésticos
│   │   ├── TariffsController.cs             # Tarifas y bloques de subsidio
│   │   └── AppConfigController.cs           # Ajustes de moneda y hardware
│   ├── Data/
│   │   ├── AppDbContext.cs                  # Contexto Entity Framework Core
│   │   └── DbInitializer.cs                 # Seed de tarifas INE y catálogo inicial
│   ├── Models/                              # Modelos de Dominio
│   ├── Services/
│   │   ├── TariffCalculationEngine.cs       # Motor matemático de cálculo y rollover
│   │   └── EnergySavingService.cs           # Motor de cálculo y optimización de ahorro
│   └── Program.cs                           # Inyección de dependencias y CORS
│
└── frontend/                                # Frontend React 18 + Ionic Framework
    ├── src/
    │   ├── components/                      # Componentes modulares M3
    │   ├── services/                        # Cliente API REST
    │   ├── theme/                           # Tokens de diseño Material Design 3
    │   ├── App.tsx                          # Navegación con Ionic Tabs
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Requisitos Previos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (incluye `npm`)

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/PowerVolts.git
cd PowerVolts
```

### 2. Ejecutar el Backend (.NET API)
```bash
cd backend
dotnet run --urls "http://localhost:5000"
```
*La base de datos SQLite `power_volts.db` se creará e inicializará automáticamente en el primer arranque.*  
Documentación interactiva disponible en: `http://localhost:5000/swagger`

### 3. Ejecutar el Frontend (React + Ionic)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web y móvil estará disponible en: `http://localhost:5173`

---

## 📡 Endpoints Principales de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/meterreadings/calculate` | Calcula consumo neto (con compensación de rollover) y costo estimado |
| `GET` | `/api/meterreadings/latest` | Obtiene la última lectura para autocompletar el campo anterior |
| `GET` | `/api/meterreadings` | Historial completo de mediciones |
| `GET` | `/api/meterreadings/stats` | Estadísticas y métricas de cumplimiento de Tarifa Social |
| `GET` | `/api/savingplans/active` | Resumen activo del plan de ahorro con aparatos y recomendaciones |
| `POST` | `/api/savingplans/simulate` | Simula reducción de horas/días y calcula ahorro en $C\$$ |
| `GET` | `/api/appliances` | Catálogo de electrodomésticos y potencias estándar |
| `GET` | `/api/tariffs/active` | Pliego tarifario activo de Nicaragua (INE) |
| `PUT` | `/api/appconfig` | Actualiza moneda (NIO/USD), tasa de cambio y dígitos de medidor |

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
