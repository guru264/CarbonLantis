import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Waves,
  Calendar,
  ChevronDown,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Droplets,
  Wind,
  Thermometer,
  Zap,
  Activity,
  Layers,
  MapPin,
  SlidersHorizontal,
  X,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { MonitoringAssetMap } from './MonitoringAssetMap';

interface AssetProfileData {
  name: string;
  assetId: string;
  type: string;
  location: string;
  baseEc: number;
  baseTurbidity: number;
  timeseries: { hour: string; ph: number; pco2: number; do: number; temp: number }[];
}

const ASSET_TELEMETRY_MAP: Record<string, AssetProfileData> = {
  'AquaDrone_MVP_001': {
    name: 'AquaDrone_MVP_001',
    assetId: 'ADR-MVP-001',
    type: 'Mobile Dosing Platform',
    location: 'Kesinapalli, AP',
    baseEc: 3120,
    baseTurbidity: 8.4,
    timeseries: [
      { hour: '00:00', ph: 7.5, pco2: 2450, do: 4.5, temp: 2.1 },
      { hour: '01:00', ph: 7.7, pco2: 2460, do: 4.6, temp: 2.1 },
      { hour: '02:00', ph: 8.0, pco2: 2480, do: 4.8, temp: 2.1 },
      { hour: '03:00', ph: 8.2, pco2: 2470, do: 5.2, temp: 2.2 },
      { hour: '04:00', ph: 8.5, pco2: 2500, do: 5.4, temp: 2.2 },
      { hour: '05:00', ph: 8.8, pco2: 2520, do: 5.6, temp: 2.2 },
      { hour: '06:00', ph: 7.9, pco2: 2500, do: 4.6, temp: 2.2 },
      { hour: '07:00', ph: 8.0, pco2: 2600, do: 4.4, temp: 2.3 },
      { hour: '08:00', ph: 9.1, pco2: 2950, do: 4.1, temp: 2.3 },
      { hour: '09:00', ph: 9.8, pco2: 2700, do: 4.3, temp: 2.3 },
      { hour: '10:00', ph: 10.3, pco2: 2300, do: 5.1, temp: 2.3 },
      { hour: '11:00', ph: 9.7, pco2: 2150, do: 4.5, temp: 2.3 },
      { hour: '12:00', ph: 8.4, pco2: 1980, do: 4.1, temp: 2.2 },
      { hour: '13:00', ph: 8.2, pco2: 2020, do: 4.1, temp: 2.2 },
      { hour: '14:00', ph: 8.2, pco2: 2050, do: 4.1, temp: 2.2 },
      { hour: '15:00', ph: 8.6, pco2: 2100, do: 3.9, temp: 2.2 },
      { hour: '16:00', ph: 10.2, pco2: 2450, do: 4.3, temp: 2.3 },
      { hour: '17:00', ph: 11.1, pco2: 3000, do: 4.7, temp: 2.5 },
      { hour: '18:00', ph: 10.9, pco2: 2900, do: 5.2, temp: 2.8 },
      { hour: '19:00', ph: 10.1, pco2: 2450, do: 5.3, temp: 2.8 },
      { hour: '20:00', ph: 9.3, pco2: 2800, do: 4.9, temp: 2.7 },
      { hour: '21:00', ph: 9.4, pco2: 2750, do: 5.1, temp: 2.7 },
      { hour: '22:00', ph: 9.5, pco2: 2650, do: 5.0, temp: 2.6 },
    ]
  },
  'AquaNode_ATV_001': {
    name: 'AquaNode_ATV_001',
    assetId: 'AN-ATV-001',
    type: 'MRV Station',
    location: 'Andaveli, AP',
    baseEc: 2980,
    baseTurbidity: 6.1,
    timeseries: [
      { hour: '00:00', ph: 7.9, pco2: 2320, do: 5.9, temp: 1.7 },
      { hour: '01:00', ph: 7.9, pco2: 2340, do: 5.9, temp: 1.7 },
      { hour: '02:00', ph: 7.8, pco2: 2350, do: 5.8, temp: 1.7 },
      { hour: '03:00', ph: 7.8, pco2: 2360, do: 5.8, temp: 1.8 },
      { hour: '04:00', ph: 7.8, pco2: 2380, do: 5.7, temp: 1.8 },
      { hour: '05:00', ph: 7.9, pco2: 2370, do: 5.8, temp: 1.8 },
      { hour: '06:00', ph: 7.9, pco2: 2350, do: 5.9, temp: 1.8 },
      { hour: '07:00', ph: 8.0, pco2: 2310, do: 6.0, temp: 1.9 },
      { hour: '08:00', ph: 8.0, pco2: 2280, do: 6.1, temp: 1.9 },
      { hour: '09:00', ph: 8.1, pco2: 2250, do: 6.2, temp: 1.9 },
      { hour: '10:00', ph: 8.0, pco2: 2260, do: 6.1, temp: 1.9 },
      { hour: '11:00', ph: 8.1, pco2: 2240, do: 6.2, temp: 2.0 },
      { hour: '12:00', ph: 8.1, pco2: 2220, do: 6.3, temp: 2.0 },
      { hour: '13:00', ph: 8.2, pco2: 2200, do: 6.3, temp: 2.0 },
      { hour: '14:00', ph: 8.1, pco2: 2210, do: 6.2, temp: 2.0 },
      { hour: '15:00', ph: 8.0, pco2: 2230, do: 6.1, temp: 2.0 },
      { hour: '16:00', ph: 8.0, pco2: 2250, do: 6.1, temp: 1.9 },
      { hour: '17:00', ph: 8.0, pco2: 2270, do: 6.0, temp: 1.9 },
      { hour: '18:00', ph: 7.9, pco2: 2290, do: 5.9, temp: 1.8 },
      { hour: '19:00', ph: 7.9, pco2: 2310, do: 5.9, temp: 1.8 },
      { hour: '20:00', ph: 7.9, pco2: 2320, do: 5.9, temp: 1.8 },
      { hour: '21:00', ph: 7.9, pco2: 2330, do: 5.8, temp: 1.7 },
      { hour: '22:00', ph: 7.8, pco2: 2340, do: 5.8, temp: 1.7 },
    ]
  },
  'RiverNode_RJY_001': {
    name: 'RiverNode_RJY_001',
    assetId: 'RN-RJY-001',
    type: 'MRV Station',
    location: 'Rajahmundry, AP',
    baseEc: 3015,
    baseTurbidity: 6.3,
    timeseries: [
      { hour: '00:00', ph: 7.8, pco2: 2210, do: 6.2, temp: 1.9 },
      { hour: '01:00', ph: 7.8, pco2: 2220, do: 6.2, temp: 1.9 },
      { hour: '02:00', ph: 7.8, pco2: 2230, do: 6.2, temp: 1.9 },
      { hour: '03:00', ph: 7.8, pco2: 2240, do: 6.1, temp: 1.9 },
      { hour: '04:00', ph: 7.8, pco2: 2250, do: 6.1, temp: 1.9 },
      { hour: '05:00', ph: 7.8, pco2: 2240, do: 6.2, temp: 2.0 },
      { hour: '06:00', ph: 7.9, pco2: 2220, do: 6.3, temp: 2.0 },
      { hour: '07:00', ph: 7.9, pco2: 2190, do: 6.4, temp: 2.0 },
      { hour: '08:00', ph: 7.9, pco2: 2170, do: 6.4, temp: 2.1 },
      { hour: '09:00', ph: 8.0, pco2: 2150, do: 6.5, temp: 2.1 },
      { hour: '10:00', ph: 7.9, pco2: 2160, do: 6.3, temp: 2.1 },
      { hour: '11:00', ph: 8.0, pco2: 2140, do: 6.4, temp: 2.2 },
      { hour: '12:00', ph: 8.0, pco2: 2120, do: 6.5, temp: 2.2 },
      { hour: '13:00', ph: 8.0, pco2: 2110, do: 6.5, temp: 2.2 },
      { hour: '14:00', ph: 8.0, pco2: 2130, do: 6.4, temp: 2.2 },
      { hour: '15:00', ph: 7.9, pco2: 2150, do: 6.3, temp: 2.1 },
      { hour: '16:00', ph: 7.9, pco2: 2170, do: 6.3, temp: 2.1 },
      { hour: '17:00', ph: 7.9, pco2: 2180, do: 6.2, temp: 2.0 },
      { hour: '18:00', ph: 7.9, pco2: 2190, do: 6.2, temp: 2.0 },
      { hour: '19:00', ph: 7.8, pco2: 2200, do: 6.2, temp: 1.9 },
      { hour: '20:00', ph: 7.8, pco2: 2210, do: 6.2, temp: 1.9 },
      { hour: '21:00', ph: 7.8, pco2: 2220, do: 6.2, temp: 1.9 },
      { hour: '22:00', ph: 7.8, pco2: 2220, do: 6.2, temp: 1.9 },
    ]
  },
  'AquaDrone_DOS_002': {
    name: 'AquaDrone_DOS_002',
    assetId: 'ADR-DOS-002',
    type: 'Mobile Dosing Platform',
    location: 'Nidamanuru, AP',
    baseEc: 3210,
    baseTurbidity: 5.5,
    timeseries: [
      { hour: '00:00', ph: 7.6, pco2: 2550, do: 4.8, temp: 2.8 },
      { hour: '01:00', ph: 7.7, pco2: 2540, do: 4.8, temp: 2.8 },
      { hour: '02:00', ph: 7.8, pco2: 2520, do: 5.0, temp: 2.8 },
      { hour: '03:00', ph: 7.9, pco2: 2510, do: 5.1, temp: 2.9 },
      { hour: '04:00', ph: 8.0, pco2: 2500, do: 5.2, temp: 2.9 },
      { hour: '05:00', ph: 8.1, pco2: 2490, do: 5.3, temp: 2.9 },
      { hour: '06:00', ph: 8.0, pco2: 2520, do: 5.2, temp: 2.9 },
      { hour: '07:00', ph: 8.2, pco2: 2580, do: 5.1, temp: 3.0 },
      { hour: '08:00', ph: 8.8, pco2: 2750, do: 4.9, temp: 3.1 },
      { hour: '09:00', ph: 9.3, pco2: 2880, do: 4.8, temp: 3.1 },
      { hour: '10:00', ph: 8.3, pco2: 2600, do: 5.5, temp: 3.1 },
      { hour: '11:00', ph: 8.9, pco2: 2700, do: 5.2, temp: 3.0 },
      { hour: '12:00', ph: 8.3, pco2: 2520, do: 5.4, temp: 3.0 },
      { hour: '13:00', ph: 8.1, pco2: 2480, do: 5.5, temp: 2.9 },
      { hour: '14:00', ph: 8.0, pco2: 2460, do: 5.6, temp: 2.9 },
      { hour: '15:00', ph: 8.3, pco2: 2540, do: 5.3, temp: 2.9 },
      { hour: '16:00', ph: 8.7, pco2: 2680, do: 5.0, temp: 3.0 },
      { hour: '17:00', ph: 8.9, pco2: 2720, do: 4.9, temp: 3.0 },
      { hour: '18:00', ph: 8.5, pco2: 2600, do: 5.2, temp: 2.9 },
      { hour: '19:00', ph: 8.2, pco2: 2540, do: 5.4, temp: 2.8 },
      { hour: '20:00', ph: 8.0, pco2: 2510, do: 5.5, temp: 2.8 },
      { hour: '21:00', ph: 7.9, pco2: 2500, do: 5.5, temp: 2.8 },
      { hour: '22:00', ph: 7.8, pco2: 2520, do: 5.4, temp: 2.8 },
    ]
  },
  'AquaDrone_DWN_003': {
    name: 'AquaDrone_DWN_003',
    assetId: 'ADR-DWN-003',
    type: 'Mobile Dosing Platform (Maintenance)',
    location: 'Dowleswaram, AP',
    baseEc: 2850,
    baseTurbidity: 5.1,
    timeseries: [
      { hour: '00:00', ph: 7.6, pco2: 2420, do: 5.0, temp: 1.5 },
      { hour: '01:00', ph: 7.6, pco2: 2420, do: 5.0, temp: 1.5 },
      { hour: '02:00', ph: 7.6, pco2: 2430, do: 5.0, temp: 1.5 },
      { hour: '03:00', ph: 7.6, pco2: 2430, do: 4.9, temp: 1.5 },
      { hour: '04:00', ph: 7.7, pco2: 2410, do: 5.0, temp: 1.5 },
      { hour: '05:00', ph: 7.7, pco2: 2400, do: 5.0, temp: 1.5 },
      { hour: '06:00', ph: 7.7, pco2: 2400, do: 5.1, temp: 1.5 },
      { hour: '07:00', ph: 7.7, pco2: 2390, do: 5.1, temp: 1.5 },
      { hour: '08:00', ph: 7.7, pco2: 2390, do: 5.1, temp: 1.5 },
      { hour: '09:00', ph: 7.7, pco2: 2380, do: 5.1, temp: 1.5 },
      { hour: '10:00', ph: 7.7, pco2: 2380, do: 5.1, temp: 1.5 },
      { hour: '11:00', ph: 7.7, pco2: 2370, do: 5.2, temp: 1.6 },
      { hour: '12:00', ph: 7.7, pco2: 2370, do: 5.2, temp: 1.6 },
      { hour: '13:00', ph: 7.8, pco2: 2360, do: 5.2, temp: 1.6 },
      { hour: '14:00', ph: 7.7, pco2: 2370, do: 5.2, temp: 1.6 },
      { hour: '15:00', ph: 7.7, pco2: 2380, do: 5.1, temp: 1.5 },
      { hour: '16:00', ph: 7.7, pco2: 2390, do: 5.1, temp: 1.5 },
      { hour: '17:00', ph: 7.7, pco2: 2390, do: 5.1, temp: 1.5 },
      { hour: '18:00', ph: 7.6, pco2: 2400, do: 5.0, temp: 1.5 },
      { hour: '19:00', ph: 7.6, pco2: 2410, do: 5.0, temp: 1.5 },
      { hour: '20:00', ph: 7.6, pco2: 2420, do: 5.0, temp: 1.5 },
      { hour: '21:00', ph: 7.6, pco2: 2420, do: 5.0, temp: 1.5 },
      { hour: '22:00', ph: 7.6, pco2: 2430, do: 4.9, temp: 1.5 },
    ]
  }
};

export interface AssetAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  time: string;
  description: string;
}

export const ASSET_ALERTS_MAP: Record<string, AssetAlert[]> = {
  'AquaDrone_MVP_001': [
    {
      id: 'a1',
      type: 'danger',
      title: 'High pH Alert',
      time: '10:24 AM',
      description: 'pH higher than threshold (8.5)'
    },
    {
      id: 'a2',
      type: 'warning',
      title: 'DO Drop',
      time: '09:15 AM',
      description: 'Dissolved oxygen below threshold (3.0 mg/L)'
    },
    {
      id: 'a3',
      type: 'info',
      title: 'Dosing Cycle Started',
      time: '06:00 AM',
      description: 'Dosing rate: 8.5 L/hr'
    },
    {
      id: 'a4',
      type: 'success',
      title: 'Sensor Calibration',
      time: '05:30 AM',
      description: 'pH sensor calibration completed'
    },
    {
      id: 'a5',
      type: 'info',
      title: 'Waypoint 4 Reach Completed',
      time: '04:15 AM',
      description: 'Autonomous waypoint transit reached along Kesinapalli reach'
    }
  ],
  'AquaNode_ATV_001': [
    {
      id: 'b1',
      type: 'warning',
      title: 'Salinity / EC Spike Detected',
      time: '11:15 AM',
      description: 'EC reached 2,980 µS/cm near tidal brackish interface'
    },
    {
      id: 'b2',
      type: 'info',
      title: 'Upstream Gate Released',
      time: '08:30 AM',
      description: 'Godavari tidal flood gate released upstream freshwater flush'
    },
    {
      id: 'b3',
      type: 'success',
      title: 'Optical DO Sensor Calibrated',
      time: '06:00 AM',
      description: 'Auto-cleaning wiper cycle completed with 99.8% optical transmission'
    },
    {
      id: 'b4',
      type: 'info',
      title: 'Satellite Burst Transmitted',
      time: '05:00 AM',
      description: '24-hour telemetry bundle successfully synced to cloud'
    }
  ],
  'RiverNode_RJY_001': [
    {
      id: 'c1',
      type: 'warning',
      title: 'Elevated River Silt Alert',
      time: '12:30 PM',
      description: 'Turbidity elevated to 6.3 NTU due to barrage sluice adjustment'
    },
    {
      id: 'c2',
      type: 'info',
      title: 'Water Velocity Update',
      time: '09:40 AM',
      description: 'Rajahmundry Barrage discharge increased flow to 1.4 m/s'
    },
    {
      id: 'c3',
      type: 'warning',
      title: 'Solar Auxiliary Switch',
      time: '06:15 AM',
      description: 'Solar irradiance below 150 W/m²; switched to auxiliary battery'
    },
    {
      id: 'c4',
      type: 'success',
      title: 'Baseline Validation Complete',
      time: '05:00 AM',
      description: 'Stationary baseline pH validated at 7.80'
    }
  ],
  'AquaDrone_DOS_002': [
    {
      id: 'd1',
      type: 'danger',
      title: 'High pCO₂ Level Recorded',
      time: '10:45 AM',
      description: 'pCO₂ rose to 2,880 µatm prior to secondary dosing phase'
    },
    {
      id: 'd2',
      type: 'warning',
      title: 'Alkaline Tank at 18%',
      time: '08:20 AM',
      description: 'Dosing chemical inventory reserve reaching refill threshold'
    },
    {
      id: 'd3',
      type: 'info',
      title: 'Dosing Cycle 1 Activated',
      time: '07:00 AM',
      description: 'Dispersion started at 9.2 L/hr along Nidamanuru transect'
    },
    {
      id: 'd4',
      type: 'success',
      title: 'RTK GPS Fix Established',
      time: '06:10 AM',
      description: 'Centimeter-grade RTK positioning locked with 14 satellites'
    }
  ],
  'AquaDrone_DWN_003': [
    {
      id: 'e1',
      type: 'info',
      title: 'Scheduled Maintenance Mode',
      time: '09:30 AM',
      description: 'Docked at Dowleswaram pier for propeller inspection'
    },
    {
      id: 'e2',
      type: 'success',
      title: 'Battery Diagnostics Passed',
      time: '07:15 AM',
      description: 'LiFePO4 cells balanced; state of charge at 98.4%'
    },
    {
      id: 'e3',
      type: 'info',
      title: 'LoRaWAN Relay Synced',
      time: '06:00 AM',
      description: 'Bridge uplink confirmed with RiverNode_RJY'
    },
    {
      id: 'e4',
      type: 'success',
      title: 'Firmware Check Completed',
      time: '04:00 AM',
      description: 'Navigation kernel validated (v2.4.1-patch)'
    }
  ]
};

export interface ParamMeta {
  key: string;
  name: string;
  shortLabel: string;
  unit: string;
  color: string;
  normalRange: string;
}

export const ALL_PARAM_CONFIGS: Record<string, ParamMeta> = {
  ph: { key: 'ph', name: 'pH Buffer', shortLabel: 'pH', unit: 'pH', color: '#0284C7', normalRange: '6.5 – 8.5' },
  pco2: { key: 'pco2', name: 'pCO₂ Drawdown', shortLabel: 'pCO₂', unit: 'µatm', color: '#10B981', normalRange: '1800 – 2600' },
  do: { key: 'do', name: 'Dissolved Oxygen', shortLabel: 'DO', unit: 'mg/L', color: '#8B5CF6', normalRange: '4.5 – 7.0' },
  temperature: { key: 'temperature', name: 'Temperature', shortLabel: 'Temp', unit: '°C', color: '#F59E0B', normalRange: '22.0 – 30.0' },
  ec: { key: 'ec', name: 'Conductivity', shortLabel: 'EC', unit: 'µS/cm', color: '#06B6D4', normalRange: '2400 – 3400' },
  turbidity: { key: 'turbidity', name: 'Turbidity', shortLabel: 'Turbidity', unit: 'NTU', color: '#D97706', normalRange: '3.0 – 12.0' },
  dco2: { key: 'dco2', name: 'Dissolved CO₂', shortLabel: 'dCO₂', unit: 'mg/L', color: '#0D9488', normalRange: '1.2 – 2.8' },
  tds: { key: 'tds', name: 'Total Dissolved Solids', shortLabel: 'TDS', unit: 'ppm', color: '#6366F1', normalRange: '1500 – 2200' },
  salinity: { key: 'salinity', name: 'Salinity', shortLabel: 'Salinity', unit: 'PSU', color: '#2563EB', normalRange: '1.2 – 2.6' },
  dic: { key: 'dic', name: 'Dissolved Inorganic Carbon', shortLabel: 'DIC', unit: 'µmol/kg', color: '#059669', normalRange: '1900 – 2400' },
  ta: { key: 'ta', name: 'Total Alkalinity', shortLabel: 'TA', unit: 'µmol/kg', color: '#3B82F6', normalRange: '2000 – 2700' },
  hco3: { key: 'hco3', name: 'Bicarbonate', shortLabel: 'HCO₃⁻', unit: 'µmol/kg', color: '#9333EA', normalRange: '1800 – 2400' },
  co3: { key: 'co3', name: 'Carbonate Ion', shortLabel: 'CO₃²⁻', unit: 'µmol/kg', color: '#E11D48', normalRange: '25 – 120' },
  calcite: { key: 'calcite', name: 'Calcite Saturation', shortLabel: 'Ωcal', unit: 'Ω', color: '#EA580C', normalRange: '1.0 – 4.5' },
  aragonite: { key: 'aragonite', name: 'Aragonite Saturation', shortLabel: 'Ωarag', unit: 'Ω', color: '#C026D3', normalRange: '0.8 – 3.2' },
};

export const MonitoringTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAsset = searchParams.get('asset');
  const [selectedAsset, setSelectedAsset] = useState<string>(
    urlAsset && ASSET_TELEMETRY_MAP[urlAsset] ? urlAsset : 'AquaDrone_MVP_001'
  );

  useEffect(() => {
    if (urlAsset && ASSET_TELEMETRY_MAP[urlAsset] && urlAsset !== selectedAsset) {
      setSelectedAsset(urlAsset);
    }
  }, [urlAsset]);

  // Asset type detection: River Node & AquaNode are stationary MRV stations; Aqua Drone is mobile dosing vessel
  const isStationaryNode = selectedAsset.includes('Node') || selectedAsset.startsWith('AquaNode') || selectedAsset.startsWith('RiverNode');

  const currentAssetData = ASSET_TELEMETRY_MAP[selectedAsset] || ASSET_TELEMETRY_MAP['AquaDrone_MVP_001'];
  const timeseriesData = currentAssetData.timeseries;
  const [selectedStream, setSelectedStream] = useState<'Upstream' | 'Dosing' | 'Downstream'>('Dosing');
  const [selectedDateIso, setSelectedDateIso] = useState('2026-10-16');
  const [selectedDate, setSelectedDate] = useState('16 Oct 2026');
  const urlMode = searchParams.get('mode');
  const [visualizationMode, setVisualizationMode] = useState<'standard' | 'timeseries'>(
    urlMode === 'standard' ? 'standard' : 'timeseries'
  );
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Available parameters tailored strictly by asset type and stream
  const availableParamKeys = useMemo(() => {
    if (isStationaryNode) {
      // River Node or AquaNode: ONLY pH, EC, Turbidity, DO, dCO2, TDS, Salinity
      return ['ph', 'ec', 'turbidity', 'do', 'dco2', 'tds', 'salinity'];
    }
    // Aqua Drone:
    if (selectedStream === 'Dosing') {
      // Dosing stream: ONLY pH, DO, EC, Turbidity
      return ['ph', 'do', 'ec', 'turbidity'];
    }
    // Downstream and Upstream: existing features + Turbidity
    return [
      'ph',
      'pco2',
      'do',
      'temperature',
      'ec',
      'turbidity',
      'dic',
      'ta',
      'hco3',
      'co3',
      'calcite',
      'aragonite'
    ];
  }, [isStationaryNode, selectedStream]);

  // Dynamic parameters on/off toggles
  const [params, setParams] = useState<Record<string, boolean>>({
    ph: true,
    ec: true,
    turbidity: true,
    do: true,
    dco2: true,
    tds: false,
    salinity: false,
    pco2: true,
    temperature: true,
    dic: true,
    ta: true,
    hco3: false,
    co3: false,
    calcite: false,
    aragonite: false,
  });

  // Keep active params valid whenever availableParamKeys changes
  useEffect(() => {
    setParams((prev) => {
      const next: Record<string, boolean> = { ...prev };
      let activeCount = 0;
      availableParamKeys.forEach((key) => {
        if (next[key] === undefined) {
          next[key] = true;
        }
        if (next[key]) activeCount++;
      });
      if (activeCount === 0) {
        availableParamKeys.slice(0, 3).forEach((key) => {
          next[key] = true;
        });
      }
      return next;
    });
  }, [availableParamKeys]);

  // Active parameter configurations currently selected and visible
  const activeVisibleParams = useMemo(() => {
    return availableParamKeys
      .filter((k) => params[k])
      .map((k) => ALL_PARAM_CONFIGS[k])
      .filter(Boolean);
  }, [availableParamKeys, params]);

  const [isParamDropdownOpen, setIsParamDropdownOpen] = useState(false);
  const [hoveredParamKey, setHoveredParamKey] = useState<string | null>(null);

  // Current Telemetry Reference Time
  const scrubberProgress = 0.466; // ~10:15 am reference time
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  // Time format helper: convert ratio (0 to 1) into hh:mm:ss across 00:00 to 22:00
  const formatTimeFromProgress = (ratio: number) => {
    const totalSeconds = Math.round(ratio * 22 * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeString = formatTimeFromProgress(scrubberProgress);

  // Handle Export Trigger (Direct CSV Export)
  const handleExport = () => {
    setExportToast(`Generating CSV export for ${selectedAsset} (${selectedDate})...`);
    setTimeout(() => {
      setExportToast(null);
    }, 2500);
  };

  // Toggle Parameter Visibility
  const toggleParam = (key: string) => {
    setParams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false);
  const assetAlerts = ASSET_ALERTS_MAP[selectedAsset] || ASSET_ALERTS_MAP['AquaDrone_MVP_001'];

  // Chart Ref for non-passive event listeners & fullscreen toggle
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Chart Dimensions & Coordinate Mapping (Full width chart)
  const chartWidth = 1000;
  const chartHeight = 280;
  const padding = { top: 35, right: 65, bottom: 35, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // 22-Hour Telemetry Dataset (Dynamic based on selectedAsset)
  const TOTAL_DAY_SECONDS = 22 * 3600; // 79,200 seconds (00:00 to 22:00)

  // Interactive Zoom Window in seconds [startSec, endSec]
  const [zoomWindow, setZoomWindow] = useState<{ startSec: number; endSec: number }>({
    startSec: 0,
    endSec: TOTAL_DAY_SECONDS,
  });

  const [activeZoomPreset, setActiveZoomPreset] = useState<'24h' | '6h' | '1h' | '15m' | 'full' | 'custom'>('24h');
  const [focusedParam] = useState<'all' | 'ph' | 'pco2' | 'do' | 'temp'>('all');
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWindow, setDragStartWindow] = useState<{ startSec: number; endSec: number }>({
    startSec: 0,
    endSec: TOTAL_DAY_SECONDS,
  });

  // Crosshair cursor on hover
  const [hoverCursor, setHoverCursor] = useState<{
    active: boolean;
    x: number;
    y: number;
    sec: number;
    telem: Record<string, any>;
  } | null>(null);

  // Time format helper: returns HH:mm or HH:mm:ss based on depth
  const formatSecondsToClock = (sec: number, includeSeconds: boolean = true) => {
    const sClamped = Math.max(0, Math.min(TOTAL_DAY_SECONDS, Math.round(sec)));
    const h = Math.floor(sClamped / 3600);
    const m = Math.floor((sClamped % 3600) / 60);
    const s = sClamped % 60;
    if (!includeSeconds) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getZoomSpanDescription = () => {
    const span = zoomWindow.endSec - zoomWindow.startSec;
    if (span >= 50000) return '24h View (Normal • Hours)';
    if (span >= 14400) return `${Math.round(span / 3600)}h View (Hourly)`;
    if (span >= 3600) return `${(span / 3600).toFixed(1)}h View (30m Interval)`;
    if (span >= 600) return `${Math.round(span / 60)}m View (Minute Depth)`;
    if (span >= 120) return `${Math.round(span / 60)}m View (30s Depth)`;
    return `${span}s View (Full Depth • Seconds)`;
  };

  // High-fidelity continuous telemetry interpolation at any second (Dynamic based on selectedStream reach and asset type)
  const getInterpolatedTelemetryAtSecond = (sec: number) => {
    const clampedSec = Math.max(0, Math.min(TOTAL_DAY_SECONDS, sec));
    const hourFloat = clampedSec / 3600;
    const idx0 = Math.floor(hourFloat);
    const idx1 = Math.min(idx0 + 1, timeseriesData.length - 1);
    const u = hourFloat - idx0;
    const smoothU = u * u * (3 - 2 * u);

    const d0 = timeseriesData[idx0];
    const d1 = timeseriesData[idx1];

    let basePh = d0.ph + (d1.ph - d0.ph) * smoothU;
    let basePco2 = d0.pco2 + (d1.pco2 - d0.pco2) * smoothU;
    let baseDo = d0.do + (d1.do - d0.do) * smoothU;
    let baseTemp = 25.0 + (d0.temp + (d1.temp - d0.temp) * smoothU) * 1.3;

    // Realistic in-situ hydrodynamic wavelets for minute and seconds depth:
    const microPhase = clampedSec * 0.12;
    const wave1 = Math.sin(microPhase) * 0.12;
    const wave2 = Math.cos(microPhase * 2.3) * 0.06;

    let ph: number;
    let pco2: number;
    let doVal: number;
    let temp: number;
    let ec: number;
    let turbidity: number;
    let dco2: number;
    let tds: number;
    let salinity: number;
    let ta: number;
    let dic: number;
    let hco3: number;
    let co3: number;
    let calcite: number;
    let aragonite: number;

    if (isStationaryNode) {
      // Stationary MRV Node (RiverNode_RJY or AquaNode_ATV): High-precision continuous baseline monitoring
      const isRiver = selectedAsset.includes('River');
      ph = +(isRiver ? 7.82 + wave1 * 0.22 : 7.95 + wave1 * 0.18).toFixed(2);
      ec = Math.round((currentAssetData.baseEc || 3000) + wave1 * 30 + Math.sin(hourFloat * 0.4) * 40);
      turbidity = +((currentAssetData.baseTurbidity || 6.2) + wave2 * 0.4 + Math.sin(hourFloat * 0.3) * 0.5).toFixed(1);
      doVal = +(5.9 + wave2 * 0.2 + (isRiver ? 0.3 : 0)).toFixed(2);
      dco2 = +(2.15 - wave1 * 0.15 + (isRiver ? 0.2 : 0)).toFixed(2);
      tds = Math.round(ec * 0.64);
      salinity = +(1.82 + (ec - 3000) * 0.0012).toFixed(2);
      temp = +(25.6 + wave1 * 0.2).toFixed(1);
      pco2 = 2240;
      ta = 2190;
      dic = 2110;
      hco3 = 2030;
      co3 = 38;
      calcite = 1.35;
      aragonite = 0.94;
    } else if (selectedStream === 'Dosing') {
      // Aqua Drone Dosing Plume (Active dispersion peaks at 06:00-09:00 and 15:00-18:00)
      ph = +Math.max(6.8, Math.min(11.2, basePh + wave1 + wave2 * 0.5)).toFixed(2);
      pco2 = Math.round(basePco2 - (wave1 * 85 + wave2 * 40));
      doVal = +Math.max(3.5, Math.min(6.8, baseDo + wave2 * 0.25)).toFixed(2);
      temp = +Math.max(24.5, Math.min(29.5, baseTemp + wave1 * 0.1)).toFixed(1);
      const isDosingWindow = (clampedSec >= 21600 && clampedSec <= 32400) || (clampedSec >= 54000 && clampedSec <= 64800);
      ec = Math.round((currentAssetData.baseEc || 3120) + (isDosingWindow ? 180 : 0) + wave1 * 25);
      turbidity = +((currentAssetData.baseTurbidity || 8.4) + (isDosingWindow ? 2.8 : 0) + wave2 * 0.4).toFixed(1);
      dco2 = +(1.9 + wave1 * 0.2).toFixed(2);
      tds = Math.round(ec * 0.65);
      salinity = +(1.95 + wave1 * 0.1).toFixed(2);

      const deltaPhFromBase = Math.max(0, ph - 7.8);
      ta = Math.round(2180 + deltaPhFromBase * 220 + (ph > 9.0 ? 180 : 0) + wave1 * 20);
      dic = Math.round(2110 + deltaPhFromBase * 60 + wave2 * 15);
      hco3 = Math.round(dic * (ph > 9.5 ? 0.88 : 0.95));
      co3 = Math.round(Math.max(25, 35 + deltaPhFromBase * 65 + (ph > 9.5 ? 50 : 0)));
      calcite = +(1.35 + deltaPhFromBase * 1.15 + (ph > 9.5 ? 0.8 : 0)).toFixed(2);
      aragonite = +(0.92 + deltaPhFromBase * 0.78 + (ph > 9.5 ? 0.55 : 0)).toFixed(2);
    } else if (selectedStream === 'Upstream') {
      // Aqua Drone Upstream Baseline
      ph = +Math.max(7.4, Math.min(8.0, 7.72 + wave1 * 0.4 + Math.sin(hourFloat * 0.25) * 0.08)).toFixed(2);
      pco2 = Math.round(2420 + wave2 * 30 + Math.sin(hourFloat * 0.3) * 45);
      doVal = +Math.max(5.1, Math.min(6.2, 5.7 + wave2 * 0.15)).toFixed(2);
      temp = +Math.max(24.8, Math.min(27.2, baseTemp - 0.4)).toFixed(1);
      ec = Math.round(2950 + wave1 * 20);
      turbidity = +(6.5 + wave2 * 0.3).toFixed(1);
      dco2 = 2.2;
      tds = Math.round(ec * 0.64);
      salinity = 1.75;
      ta = Math.round(2140 + Math.sin(hourFloat * 0.2) * 15 + wave1 * 10);
      dic = Math.round(2085 + Math.sin(hourFloat * 0.2) * 12 + wave1 * 8);
      hco3 = Math.round(dic * 0.965);
      co3 = Math.round(Math.max(20, Math.min(50, 32 + (ph - 7.7) * 40)));
      calcite = +(1.22 + (ph - 7.7) * 0.8).toFixed(2);
      aragonite = +(0.84 + (ph - 7.7) * 0.55).toFixed(2);
    } else {
      // Aqua Drone Downstream Reach
      const isPostDosing = (clampedSec > 25200 && clampedSec < 43200) || clampedSec > 57600;
      ph = +Math.max(7.85, Math.min(8.4, 8.12 + (isPostDosing ? 0.12 : 0) + wave1 * 0.3)).toFixed(2);
      pco2 = Math.round(2080 - (isPostDosing ? 110 : 0) + wave2 * 35);
      doVal = +Math.max(4.8, Math.min(6.5, 5.8 + wave2 * 0.18)).toFixed(2);
      temp = +Math.max(24.9, Math.min(27.8, baseTemp)).toFixed(1);
      ec = Math.round(3080 + wave1 * 25);
      turbidity = +(6.8 + wave2 * 0.3).toFixed(1);
      dco2 = 1.75;
      tds = Math.round(ec * 0.64);
      salinity = 1.88;
      ta = Math.round(2395 + (isPostDosing ? 45 : 0) + wave1 * 12);
      dic = Math.round(2270 + (isPostDosing ? 35 : 0) + wave2 * 10);
      hco3 = Math.round(dic * 0.955);
      co3 = Math.round(Math.max(30, Math.min(80, 52 + (ph - 8.1) * 35)));
      calcite = +(1.82 + (ph - 8.1) * 0.6).toFixed(2);
      aragonite = +(1.25 + (ph - 8.1) * 0.42).toFixed(2);
    }

    return {
      ph, pco2, do: doVal, temp, ec, turbidity, dco2, tds, salinity,
      ta, dic, hco3, co3, calcite, aragonite
    };
  };

  // Unified dynamic scale mapping function for all parameters
  const getYForParam = (key: string, val: number) => {
    switch (key) {
      case 'ph':
        return padding.top + Math.max(0, Math.min(1, (11.5 - val) / (11.5 - 6.5))) * innerHeight;
      case 'pco2':
        return padding.top + Math.max(0, Math.min(1, (3200 - val) / (3200 - 1800))) * innerHeight;
      case 'do':
        return padding.top + Math.max(0, Math.min(1, (7.0 - val) / (7.0 - 3.2))) * innerHeight;
      case 'temp':
      case 'temperature':
        return padding.top + Math.max(0, Math.min(1, (30.0 - val) / (30.0 - 23.0))) * innerHeight;
      case 'ec':
        return padding.top + Math.max(0, Math.min(1, (3600 - val) / (3600 - 2400))) * innerHeight;
      case 'turbidity':
        return padding.top + Math.max(0, Math.min(1, (15 - val) / (15 - 2))) * innerHeight;
      case 'dco2':
        return padding.top + Math.max(0, Math.min(1, (3.5 - val) / (3.5 - 0.8))) * innerHeight;
      case 'tds':
        return padding.top + Math.max(0, Math.min(1, (2400 - val) / (2400 - 1400))) * innerHeight;
      case 'salinity':
        return padding.top + Math.max(0, Math.min(1, (3.0 - val) / (3.0 - 1.0))) * innerHeight;
      case 'ta':
        return padding.top + Math.max(0, Math.min(1, (3000 - val) / (3000 - 1800))) * innerHeight;
      case 'dic':
        return padding.top + Math.max(0, Math.min(1, (2600 - val) / (2600 - 1800))) * innerHeight;
      case 'hco3':
        return padding.top + Math.max(0, Math.min(1, (2600 - val) / (2600 - 1700))) * innerHeight;
      case 'co3':
        return padding.top + Math.max(0, Math.min(1, (180 - val) / (180 - 15))) * innerHeight;
      case 'calcite':
        return padding.top + Math.max(0, Math.min(1, (5.0 - val) / (5.0 - 0.6))) * innerHeight;
      case 'aragonite':
        return padding.top + Math.max(0, Math.min(1, (3.5 - val) / (3.5 - 0.5))) * innerHeight;
      default:
        return padding.top + innerHeight / 2;
    }
  };

  const getYPh = (val: number) => getYForParam('ph', val);
  const getYPco2 = (val: number) => getYForParam('pco2', val);
  const getYDo = (val: number) => getYForParam('do', val);
  const getYTemp = (val: number) => getYForParam('temperature', val);

  // Maps seconds to X pixel coordinate based on current zoom window
  const getTimeX = (sec: number) => {
    const span = Math.max(10, zoomWindow.endSec - zoomWindow.startSec);
    const ratio = (sec - zoomWindow.startSec) / span;
    return padding.left + ratio * innerWidth;
  };

  // Maps X pixel coordinate to seconds
  const getSecFromX = (pixelX: number) => {
    const ratio = Math.max(0, Math.min(1, (pixelX - padding.left) / innerWidth));
    const span = zoomWindow.endSec - zoomWindow.startSec;
    return zoomWindow.startSec + ratio * span;
  };

  // Dynamic Ticks Generator (Adapts smoothly from 24h hours to sub-minute seconds)
  const dynamicTicks = useMemo(() => {
    const span = zoomWindow.endSec - zoomWindow.startSec;
    let intervalSec = 4 * 3600; // 4 hours for 24h normal view
    let showSeconds = false;

    if (span > 45000) {
      intervalSec = 4 * 3600; // 4h: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
    } else if (span > 18000) {
      intervalSec = 3600; // 1h
    } else if (span > 3600) {
      intervalSec = 1800; // 30m
    } else if (span > 1200) {
      intervalSec = 600; // 10m
    } else if (span > 300) {
      intervalSec = 120; // 2m
    } else if (span > 90) {
      intervalSec = 30; // 30s
      showSeconds = true;
    } else {
      intervalSec = 15; // 15s (seconds depth zoom!)
      showSeconds = true;
    }

    const ticks: { sec: number; label: string; x: number; isMajor: boolean }[] = [];
    const firstSec = Math.ceil(zoomWindow.startSec / intervalSec) * intervalSec;

    for (let sec = firstSec; sec <= zoomWindow.endSec; sec += intervalSec) {
      const x = getTimeX(sec);
      if (x >= padding.left - 2 && x <= chartWidth - padding.right + 2) {
        ticks.push({
          sec,
          label: formatSecondsToClock(sec, showSeconds),
          x,
          isMajor: sec % (intervalSec * 2) === 0,
        });
      }
    }
    return ticks;
  }, [zoomWindow]);

  // 120 dense sample points across the visible window for ultra-smooth curves
  const DENSE_SAMPLE_COUNT = 120;
  const denseSampledPoints = useMemo(() => {
    const pts = [];
    const span = zoomWindow.endSec - zoomWindow.startSec;
    for (let i = 0; i < DENSE_SAMPLE_COUNT; i++) {
      const sec = zoomWindow.startSec + (i / (DENSE_SAMPLE_COUNT - 1)) * span;
      const x = padding.left + (i / (DENSE_SAMPLE_COUNT - 1)) * innerWidth;
      const telem = getInterpolatedTelemetryAtSecond(sec);
      pts.push({
        sec,
        x,
        telem,
        ph: telem.ph,
        pco2: telem.pco2,
        do: telem.do,
        temp: telem.temp,
        yPh: getYForParam('ph', telem.ph),
        yPco2: getYForParam('pco2', telem.pco2),
      });
    }
    return pts;
  }, [zoomWindow, timeseriesData, selectedStream, isStationaryNode]);

  // Dynamic polyline point strings generated for every active parameter
  const polylinePointsMap = useMemo(() => {
    const map: Record<string, string> = {};
    activeVisibleParams.forEach((param) => {
      map[param.key] = denseSampledPoints
        .map((p) => {
          const val = (p.telem as any)[param.key === 'temperature' ? 'temp' : param.key] ?? 0;
          return `${p.x.toFixed(1)},${getYForParam(param.key, val).toFixed(1)}`;
        })
        .join(' ');
    });
    return map;
  }, [activeVisibleParams, denseSampledPoints]);

  // Dosing Bands Pixel Coordinates (Clipped to current zoom view)
  const c1RawStart = getTimeX(21600); // 06:00
  const c1RawEnd = getTimeX(32400);   // 09:00
  const c1StartX = Math.max(padding.left, c1RawStart);
  const c1EndX = Math.min(chartWidth - padding.right, c1RawEnd);
  const isC1Visible = c1EndX > c1StartX;

  const c2RawStart = getTimeX(54000); // 15:00
  const c2RawEnd = getTimeX(64800);   // 18:00
  const c2StartX = Math.max(padding.left, c2RawStart);
  const c2EndX = Math.min(chartWidth - padding.right, c2RawEnd);
  const isC2Visible = c2EndX > c2StartX;

  // Current Scrubber Position in seconds and pixels
  const scrubberSec = scrubberProgress * TOTAL_DAY_SECONDS;
  const scrubberX = getTimeX(scrubberSec);
  const isScrubberInWindow = scrubberSec >= zoomWindow.startSec && scrubberSec <= zoomWindow.endSec;

  // Interpolated Sensor Readings based on current scrubber progress
  const scrubberTelem = getInterpolatedTelemetryAtSecond(scrubberSec);
  const currentPh = scrubberTelem.ph.toFixed(1);
  const currentPco2 = Math.round(scrubberTelem.pco2);
  const currentDo = scrubberTelem.do.toFixed(1);
  const currentTemp = scrubberTelem.temp.toFixed(1);

  // Zoom & Pan Handlers (Centered around current scrubber position)
  const handleApplyPreset = (preset: '24h' | '6h' | '1h' | '15m' | 'full') => {
    setActiveZoomPreset(preset);
    const centerSec = scrubberProgress * TOTAL_DAY_SECONDS;

    switch (preset) {
      case '24h':
        setZoomWindow({ startSec: 0, endSec: TOTAL_DAY_SECONDS });
        break;
      case '6h': {
        const span = 6 * 3600;
        let start = Math.max(0, centerSec - span / 2);
        let end = start + span;
        if (end > TOTAL_DAY_SECONDS) {
          end = TOTAL_DAY_SECONDS;
          start = Math.max(0, TOTAL_DAY_SECONDS - span);
        }
        setZoomWindow({ startSec: Math.round(start), endSec: Math.round(end) });
        break;
      }
      case '1h': {
        const span = 3600;
        let start = Math.max(0, centerSec - span / 2);
        let end = start + span;
        if (end > TOTAL_DAY_SECONDS) {
          end = TOTAL_DAY_SECONDS;
          start = Math.max(0, TOTAL_DAY_SECONDS - span);
        }
        setZoomWindow({ startSec: Math.round(start), endSec: Math.round(end) });
        break;
      }
      case '15m': {
        const span = 900;
        let start = Math.max(0, centerSec - span / 2);
        let end = start + span;
        if (end > TOTAL_DAY_SECONDS) {
          end = TOTAL_DAY_SECONDS;
          start = Math.max(0, TOTAL_DAY_SECONDS - span);
        }
        setZoomWindow({ startSec: Math.round(start), endSec: Math.round(end) });
        break;
      }
      case 'full': {
        // Full depth: 120 seconds centered around current scrubber time!
        const span = 120;
        let start = Math.max(0, centerSec - span / 2);
        let end = start + span;
        if (end > TOTAL_DAY_SECONDS) {
          end = TOTAL_DAY_SECONDS;
          start = Math.max(0, TOTAL_DAY_SECONDS - span);
        }
        setZoomWindow({ startSec: Math.round(start), endSec: Math.round(end) });
        break;
      }
    }
  };

  const handleZoomByFactor = (factor: number, centerRatio: number = 0.5) => {
    setZoomWindow((prev) => {
      const currentSpan = prev.endSec - prev.startSec;
      const newSpan = Math.max(30, Math.min(TOTAL_DAY_SECONDS, currentSpan * factor));
      const centerSec = prev.startSec + centerRatio * currentSpan;
      let newStart = centerSec - centerRatio * newSpan;
      let newEnd = newStart + newSpan;

      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(TOTAL_DAY_SECONDS, newSpan);
      }
      if (newEnd > TOTAL_DAY_SECONDS) {
        newEnd = TOTAL_DAY_SECONDS;
        newStart = Math.max(0, TOTAL_DAY_SECONDS - newSpan);
      }

      return { startSec: Math.round(newStart), endSec: Math.round(newEnd) };
    });
    setActiveZoomPreset('custom');
  };

  const handlePanByRatio = (ratioDelta: number) => {
    setZoomWindow((prev) => {
      const currentSpan = prev.endSec - prev.startSec;
      const deltaSec = currentSpan * ratioDelta;
      let newStart = prev.startSec + deltaSec;
      let newEnd = prev.endSec + deltaSec;

      if (newStart < 0) {
        newStart = 0;
        newEnd = currentSpan;
      }
      if (newEnd > TOTAL_DAY_SECONDS) {
        newEnd = TOTAL_DAY_SECONDS;
        newStart = TOTAL_DAY_SECONDS - currentSpan;
      }

      return { startSec: Math.round(newStart), endSec: Math.round(newEnd) };
    });
    setActiveZoomPreset('custom');
  };

  // Ref to always hold latest handleZoomByFactor function
  const handleZoomByFactorRef = useRef(handleZoomByFactor);
  useEffect(() => {
    handleZoomByFactorRef.current = handleZoomByFactor;
  });

  // Native non-passive Wheel Event Listener:
  // Crucial: Intercepts Ctrl+Wheel (browser page zoom shortcut) and trackpad pinch gestures,
  // preventing the entire page from zooming or scrolling, and instead expanding ONLY the graph!
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      // STOP browser page zoom (Ctrl+wheel / pinch) and page scroll!
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const paddingLeftPx = (padding.left / chartWidth) * rect.width;
      const innerWidthPx = (innerWidth / chartWidth) * rect.width;
      const ratio = Math.max(
        0,
        Math.min(1, (mouseX - paddingLeftPx) / Math.max(1, innerWidthPx))
      );

      // Smooth zoom factor calculation
      // deltaY < 0 means scrolling up (zoom IN / expand time series)
      // deltaY > 0 means scrolling down (zoom OUT / compress time series)
      const sensitivity = e.ctrlKey ? 0.008 : 0.002;
      const clampedDelta = Math.max(-120, Math.min(120, e.deltaY));
      const factor = Math.exp(clampedDelta * sensitivity);

      handleZoomByFactorRef.current(factor, ratio);
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, [chartWidth, innerWidth, padding.left]);

  // Drag to pan on SVG chart
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDraggingPan(true);
    setDragStartX(e.clientX);
    setDragStartWindow({ ...zoomWindow });
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const chartPixelX = (mouseX / rect.width) * chartWidth;
    const chartPixelY = (mouseY / rect.height) * chartHeight;

    if (chartPixelX >= padding.left && chartPixelX <= chartWidth - padding.right) {
      const sec = getSecFromX(chartPixelX);
      const telem = getInterpolatedTelemetryAtSecond(sec);

      // Check proximity of chartPixelY to each active parameter line at this X coordinate
      let closestKey: string | null = null;
      let minDistance = 25; // 25px line proximity detection

      activeVisibleParams.forEach((param) => {
        const val = (telem as any)[param.key === 'temperature' ? 'temp' : param.key] ?? 0;
        const lineY = getYForParam(param.key, val);
        const dist = Math.abs(chartPixelY - lineY);
        if (dist < minDistance) {
          minDistance = dist;
          closestKey = param.key;
        }
      });

      setHoveredParamKey(closestKey);
      setHoverCursor({
        active: true,
        x: chartPixelX,
        y: chartPixelY,
        sec: Math.round(sec),
        telem,
      });
    } else {
      setHoverCursor(null);
      setHoveredParamKey(null);
    }

    if (isDraggingPan) {
      const deltaPixelX = e.clientX - dragStartX;
      const windowSpan = dragStartWindow.endSec - dragStartWindow.startSec;
      const deltaSec = -(deltaPixelX / rect.width) * windowSpan * (chartWidth / innerWidth);

      let nextStart = dragStartWindow.startSec + deltaSec;
      let nextEnd = dragStartWindow.endSec + deltaSec;

      if (nextStart < 0) {
        nextStart = 0;
        nextEnd = windowSpan;
      }
      if (nextEnd > TOTAL_DAY_SECONDS) {
        nextEnd = TOTAL_DAY_SECONDS;
        nextStart = TOTAL_DAY_SECONDS - windowSpan;
      }

      setZoomWindow({
        startSec: Math.round(nextStart),
        endSec: Math.round(nextEnd),
      });
      setActiveZoomPreset('custom');
    }
  };

  const handleSvgMouseUp = () => {
    setIsDraggingPan(false);
  };

  const handleSvgMouseLeave = () => {
    setIsDraggingPan(false);
    setHoverCursor(null);
    setHoveredParamKey(null);
  };

  // Helper to determine responsive grid column class based on active count
  const getParamGridColsClass = (count: number) => {
    if (count <= 1) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-sm gap-2.5';
    if (count === 2) return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-xl gap-2.5';
    if (count === 3) return 'grid grid-cols-2 sm:grid-cols-3 gap-2.5';
    if (count === 4) return 'grid grid-cols-2 sm:grid-cols-4 gap-2.5';
    if (count === 5) return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5';
    if (count === 6) return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5';
    return 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5';
  };

  // Reusable Single Parameter Card Renderer
  const renderParamCard = (key: string) => {
    switch (key) {
      case 'ph':
        return (
          <div key="card-ph" className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                <Droplets className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">pH</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {currentPh}
              </div>
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold self-start ${!isStationaryNode && selectedStream === 'Dosing' && +currentPh > 9.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                {!isStationaryNode && selectedStream === 'Dosing' && +currentPh > 9.0 ? 'Dosing Plume' : 'Normal'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                {!isStationaryNode && selectedStream === 'Dosing' ? '(6.5 – 10.5)' : '(6.5 – 8.5)'}
              </span>
            </div>
          </div>
        );

      case 'pco2':
        return (
          <div key="card-pco2" className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                <Wind className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">pCO₂</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {currentPco2}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">µatm</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'do':
        return (
          <div key="card-do" className="p-3 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                <Activity className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">DO</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {currentDo}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">mg/L</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'temperature':
        return (
          <div key="card-temp" className="p-3 rounded-lg bg-[#FFF7ED] border border-[#FED7AA]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                <Thermometer className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700 truncate">Temperature</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {currentTemp}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">°C</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'ec':
        return (
          <div key="card-ec" className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BAE6FD]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">
                <Zap className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">EC</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {scrubberTelem.ec}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">µS/cm</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'turbidity':
        return (
          <div key="card-turbidity" className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                <Waves className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700 truncate">Turbidity</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {scrubberTelem.turbidity}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">NTU</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'dco2':
        return (
          <div key="card-dco2" className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                <Wind className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">dCO₂</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {scrubberTelem.dco2 ?? 2.15}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">mg/L</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'tds':
        return (
          <div key="card-tds" className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">
                <Layers className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">TDS</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {scrubberTelem.tds}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">ppm</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'salinity':
        return (
          <div key="card-salinity" className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-700">Salinity</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {scrubberTelem.salinity}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">PSU</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Normal
              </span>
            </div>
          </div>
        );

      case 'ta':
        return (
          <div key="card-ta" className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">TA</span>
              <span className="text-[9.5px] font-mono text-slate-400">µmol/kg</span>
            </div>
            <div className="text-xl font-black text-blue-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.ta}
            </div>
            <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold self-start ${scrubberTelem.ta > 2400 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
              {scrubberTelem.ta > 2400 ? 'Enhanced Sink' : 'Baseline Buffer'}
            </span>
          </div>
        );

      case 'dic':
        return (
          <div key="card-dic" className="p-2.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4]/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">DIC</span>
              <span className="text-[9.5px] font-mono text-slate-400">µmol/kg</span>
            </div>
            <div className="text-xl font-black text-teal-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.dic}
            </div>
            <span className="inline-block px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9.5px] font-bold self-start">
              Inorganic Pool
            </span>
          </div>
        );

      case 'hco3':
        return (
          <div key="card-hco3" className="p-2.5 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF]/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">HCO₃⁻</span>
              <span className="text-[9.5px] font-mono text-slate-400">µmol/kg</span>
            </div>
            <div className="text-xl font-black text-purple-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.hco3}
            </div>
            <span className="inline-block px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9.5px] font-bold self-start">
              Durable Storage
            </span>
          </div>
        );

      case 'co3':
        return (
          <div key="card-co3" className="p-2.5 rounded-lg bg-[#FFF1F2] border border-[#FECDD3]/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">CO₃²⁻</span>
              <span className="text-[9.5px] font-mono text-slate-400">µmol/kg</span>
            </div>
            <div className="text-xl font-black text-rose-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.co3}
            </div>
            <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold self-start ${scrubberTelem.co3 > 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
              {scrubberTelem.co3 > 90 ? 'Plume Peak' : 'Equilibrium'}
            </span>
          </div>
        );

      case 'calcite':
        return (
          <div key="card-calcite" className="p-2.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">Ω Calcite</span>
              <span className="text-[9.5px] font-mono text-slate-400">Ωcal</span>
            </div>
            <div className="text-xl font-black text-orange-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.calcite}
            </div>
            <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold self-start ${scrubberTelem.calcite < 4.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
              {scrubberTelem.calcite < 4.5 ? 'Safe Saturation' : 'Elevated'}
            </span>
          </div>
        );

      case 'aragonite':
        return (
          <div key="card-aragonite" className="p-2.5 rounded-lg bg-[#FDF4FF] border border-[#F5D0FE]/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-slate-700">Ω Aragonite</span>
              <span className="text-[9.5px] font-mono text-slate-400">Ωarag</span>
            </div>
            <div className="text-xl font-black text-fuchsia-700 tracking-tight font-sans my-0.5">
              {scrubberTelem.aragonite}
            </div>
            <span className="inline-block px-1.5 py-0.2 rounded bg-fuchsia-100 text-fuchsia-800 text-[9.5px] font-bold self-start">
              {scrubberTelem.aragonite >= 1.0 ? 'Supersaturated' : 'Under'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  // Sensor Readings Cards Component (dynamically renders ONLY parameters selected in filter above)
  const renderSensorReadingsCards = () => {
    if (isStationaryNode) {
      /* River Node / AquaNode: Stationary Parameters */
      const activeStationaryKeys = ['ph', 'ec', 'turbidity', 'do', 'dco2', 'tds', 'salinity'].filter((k) => params[k]);
      if (activeStationaryKeys.length === 0) {
        return (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No parameters selected in the filter above. Select parameters to display readings.
          </div>
        );
      }
      return (
        <div className={getParamGridColsClass(activeStationaryKeys.length)}>
          {activeStationaryKeys.map(renderParamCard)}
        </div>
      );
    }

    if (selectedStream === 'Dosing') {
      /* Aqua Drone Dosing Stream: ONLY 4 Parameters */
      const activeDosingKeys = ['ph', 'do', 'ec', 'turbidity'].filter((k) => params[k]);
      if (activeDosingKeys.length === 0) {
        return (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No parameters selected in the filter above. Select parameters to display readings.
          </div>
        );
      }
      return (
        <div className={getParamGridColsClass(activeDosingKeys.length)}>
          {activeDosingKeys.map(renderParamCard)}
        </div>
      );
    }

    /* Aqua Drone Upstream / Downstream: Core Parameters + Carbonate Speciation Suite */
    const coreKeys = ['ph', 'pco2', 'do', 'temperature', 'ec', 'turbidity'].filter((k) => params[k]);
    const geochemKeys = ['ta', 'dic', 'hco3', 'co3', 'calcite', 'aragonite'].filter((k) => params[k]);

    if (coreKeys.length === 0 && geochemKeys.length === 0) {
      return (
        <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No parameters selected in the filter above. Select parameters to display readings.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {coreKeys.length > 0 && (
          <div className={getParamGridColsClass(coreKeys.length)}>
            {coreKeys.map(renderParamCard)}
          </div>
        )}

        {geochemKeys.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Carbonate System Geochemistry ({selectedStream} Stream Reach)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                PyCO2SYS Speciation Model
              </span>
            </div>
            <div className={getParamGridColsClass(geochemKeys.length)}>
              {geochemKeys.map(renderParamCard)}
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderAlertIcon = (type: AssetAlert['type']) => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-6 h-6 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
        );
      case 'info':
        return (
          <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
          </div>
        );
      case 'success':
        return (
          <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        );
    }
  };

  const getAlertTitleColor = (type: AssetAlert['type']) => {
    switch (type) {
      case 'danger':
        return 'text-rose-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-emerald-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast feedback */}
      {exportToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {exportToast}
        </div>
      )}

      {/* 1. Page Title, Asset Badges & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Monitoring
          </h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {currentAssetData.name}
          </span>
          <span className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {currentAssetData.type}
          </span>
          <button
            type="button"
            onClick={handleExport}
            className="btn-press px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 ml-1"
            title="Export CSV Telemetry"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Filter Controls Bar (Asset, Stream [mobile only], Date, Visualization, Parameters) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${!isStationaryNode ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
        {/* Card 1: Asset Selector */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Asset
          </label>
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mr-2">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedAsset}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedAsset(val);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('asset', val);
                  return next;
                });
              }}
              className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-800 pr-6 outline-none cursor-pointer"
            >
              <option value="AquaDrone_MVP_001">AquaDrone_MVP_001</option>
              <option value="AquaNode_ATV_001">AquaNode_ATV_001</option>
              <option value="RiverNode_RJY_001">RiverNode_RJY_001</option>
              <option value="AquaDrone_DOS_002">AquaDrone_DOS_002</option>
              <option value="AquaDrone_DWN_003">AquaDrone_DWN_003</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Card 2: Stream Filter (Upstream, Dosing, Downstream) - Mobile Aqua Drone ONLY */}
        {!isStationaryNode && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
            <label className="block text-[11px] text-slate-500 font-medium mb-1">
              Stream Analysis
            </label>
            <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mr-2 ${selectedStream === 'Upstream' ? 'bg-sky-100 text-sky-700' :
                  selectedStream === 'Dosing' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                }`}>
                <Layers className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value as 'Upstream' | 'Dosing' | 'Downstream')}
                className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-800 pr-6 outline-none cursor-pointer"
              >
                <option value="Upstream">Upstream (Baseline)</option>
                <option value="Dosing">Dosing (Mixing Zone)</option>
                <option value="Downstream">Downstream (Ingress)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Card 3: Date Selector (Functional date selection) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Date
          </label>
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-2 pointer-events-none" />
            <input
              type="date"
              value={selectedDateIso}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDateIso(val);
                if (val) {
                  const d = new Date(val + 'T00:00:00');
                  setSelectedDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
                }
              }}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Card 4: Visualization Dropdown (Standard vs Time-series) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Visualization
          </label>
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
            <select
              value={visualizationMode}
              onChange={(e) => setVisualizationMode(e.target.value as 'standard' | 'timeseries')}
              className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-800 pr-6 outline-none cursor-pointer"
            >
              <option value="timeseries">Time-series</option>
              <option value="standard">Standard</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Card 5: Available Parameters Filter */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">
            Parameters
          </label>
          <div>
            {/* Available Parameters Button with Dynamic Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsParamDropdownOpen(!isParamDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                title="Select Available Parameters"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Parameters ({activeVisibleParams.length}/{availableParamKeys.length})</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isParamDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Dropdown tailored to available parameters */}
              {isParamDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsParamDropdownOpen(false)}
                  />
                  <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-40 w-72 bg-white rounded-xl border border-slate-200 shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 max-h-[75vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Parameters Filter
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold font-mono">
                          {activeVisibleParams.length} of {availableParamKeys.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const next: Record<string, boolean> = { ...params };
                            availableParamKeys.forEach((k) => (next[k] = true));
                            setParams(next);
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline px-1 py-0.5 cursor-pointer"
                        >
                          All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next: Record<string, boolean> = { ...params };
                            availableParamKeys.forEach((k, idx) => {
                              next[k] = idx < 3;
                            });
                            setParams(next);
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:underline px-1 py-0.5 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Dynamic List of Available Parameters */}
                    <div className="space-y-1">
                      {availableParamKeys.map((key) => {
                        const config = ALL_PARAM_CONFIGS[key];
                        if (!config) return null;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors select-none"
                          >
                            <input
                              type="checkbox"
                              checked={!!params[key]}
                              onChange={() => toggleParam(key)}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-medium text-slate-800 flex items-center justify-between flex-1">
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: config.color }}
                                />
                                <span>{config.name}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {config.unit}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. Parameter Trends / Benchmark Chart (Full Width, Changes with Visualization Mode) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header with Title, Timestamp & Stream Reach Pill */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <h2 className="text-sm font-bold text-[#0A1628]">
                {visualizationMode === 'timeseries' ? 'Live Telemetry' : 'Sensor Readings (Current Telemetry)'}
              </h2>
              {visualizationMode === 'standard' && (
                <span className="text-xs text-slate-500 font-sans">
                  {selectedDate}, {currentTimeString}
                </span>
              )}
              {!isStationaryNode ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedStream === 'Upstream' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    selectedStream === 'Dosing' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Stream Reach: <strong>{selectedStream}</strong>
                  {selectedStream === 'Upstream' && ' • Baseline Reference'}
                  {selectedStream === 'Dosing' && ' • Active Plume Dynamics'}
                  {selectedStream === 'Downstream' && ' • CO₂ Ingress & Transport'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Stationary MRV Buoy Node • In-situ Sensor Telemetry
                </span>
              )}
            </div>
            {visualizationMode === 'timeseries' && (
              <div className="flex items-center gap-2.5 sm:gap-3 flex-nowrap shrink-0 ml-auto">
                {/* Interactive Graph Legend positioned strictly to the left of the Zoom indicator */}
                <div className="bg-slate-50/90 border border-slate-200/80 px-2 py-0.5 rounded-lg flex items-center gap-x-1.5 text-[10.5px] font-sans shadow-2xs shrink-0 max-w-full overflow-x-auto">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 shrink-0">Legend</span>
                  {activeVisibleParams.map((p) => {
                    const isHovered = hoveredParamKey === p.key;
                    return (
                      <div
                        key={p.key}
                        onMouseEnter={() => setHoveredParamKey(p.key)}
                        onMouseLeave={() => setHoveredParamKey(null)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer shrink-0 ${
                          isHovered ? 'bg-white ring-1 ring-slate-300 font-bold shadow-xs' : 'hover:bg-white/60'
                        }`}
                        title={`${p.name} (${p.unit})`}
                      >
                        <span className="w-2 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-700 text-[10px] font-medium whitespace-nowrap">{p.shortLabel}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono shrink-0 whitespace-nowrap">
                  <span>Zoom: {getZoomSpanDescription()}</span>
                </div>
              </div>
            )}
          </div>

          {visualizationMode === 'timeseries' ? (
            /* ================= MODE 2: TIME-SERIES INTERACTIVE TELEMETRY CHART ================= */
            <div
              ref={chartContainerRef}
              className="relative w-full overflow-hidden bg-white rounded-lg select-none h-64 sm:h-72 transition-all duration-300"
              style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            >
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible select-none cursor-crosshair"
                onMouseDown={handleSvgMouseDown}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseLeave}
                onDoubleClick={() => handleZoomByFactor(0.5)}
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Horizontal Reference Gridlines (Clean & Uncluttered, No pH/pCO2 titles) */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                  const y = padding.top + ratio * innerHeight;
                  return (
                    <line
                      key={`grid-${ratio}`}
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  );
                })}

                {/* Dosing Windows (Shown for Mobile Vessels) */}
                {!isStationaryNode && isC1Visible && (
                  <g>
                    <rect
                      x={c1StartX}
                      y={padding.top}
                      width={c1EndX - c1StartX}
                      height={innerHeight}
                      fill="#E0F2FE"
                      fillOpacity="0.35"
                      stroke="#7DD3FC"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                    <g
                      transform={`translate(${Math.max(
                        padding.left + 50,
                        Math.min(chartWidth - padding.right - 50, (c1StartX + c1EndX) / 2)
                      )}, ${padding.top - 8})`}
                    >
                      <rect
                        x="-45"
                        y="-14"
                        width="90"
                        height="20"
                        rx="4"
                        fill="#0284C7"
                        stroke="#0369A1"
                        strokeWidth="1"
                      />
                      <text textAnchor="middle" y="0" fontSize="8.5" fontWeight="bold" fill="#FFFFFF">
                        Dosing Window 1
                      </text>
                    </g>
                  </g>
                )}

                {!isStationaryNode && isC2Visible && (
                  <g>
                    <rect
                      x={c2StartX}
                      y={padding.top}
                      width={c2EndX - c2StartX}
                      height={innerHeight}
                      fill="#E0F2FE"
                      fillOpacity="0.35"
                      stroke="#7DD3FC"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                    <g
                      transform={`translate(${Math.max(
                        padding.left + 50,
                        Math.min(chartWidth - padding.right - 50, (c2StartX + c2EndX) / 2)
                      )}, ${padding.top - 8})`}
                    >
                      <rect
                        x="-45"
                        y="-14"
                        width="90"
                        height="20"
                        rx="4"
                        fill="#0284C7"
                        stroke="#0369A1"
                        strokeWidth="1"
                      />
                      <text textAnchor="middle" y="0" fontSize="8.5" fontWeight="bold" fill="#FFFFFF">
                        Dosing Window 2
                      </text>
                    </g>
                  </g>
                )}

                {/* Dynamic X Axis Time Labels (Adapts from 4-hour skips down to seconds) */}
                {dynamicTicks.map((tick) => (
                  <g key={`tick-${tick.sec}`}>
                    <line
                      x1={tick.x}
                      y1={chartHeight - padding.bottom}
                      x2={tick.x}
                      y2={chartHeight - padding.bottom + 5}
                      stroke={tick.isMajor ? '#64748B' : '#CBD5E1'}
                      strokeWidth={tick.isMajor ? '1.5' : '1'}
                    />
                    <text
                      x={tick.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize={tick.isMajor ? '9.5' : '8.5'}
                      fontWeight={tick.isMajor ? 'bold' : 'normal'}
                      fill={tick.isMajor ? '#1E293B' : '#64748B'}
                      fontFamily="Inter, sans-serif"
                    >
                      {tick.label}
                    </text>
                  </g>
                ))}

                {/* Dynamic Active Parameter Curves */}
                {activeVisibleParams.map((param) => {
                  const pointsStr = polylinePointsMap[param.key];
                  if (!pointsStr) return null;
                  const isHovered = hoveredParamKey === param.key;
                  const isDimmed = hoveredParamKey !== null && !isHovered;

                  return (
                    <g key={`curve-group-${param.key}`}>
                      {/* Visual Line */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke={param.color}
                        strokeWidth={isHovered ? 3.5 : 2.2}
                        strokeOpacity={isDimmed ? 0.2 : 0.95}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-150 pointer-events-none"
                      />
                      {/* Invisible wider hitbox for easy cursor detection */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={18}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredParamKey(param.key)}
                        onMouseLeave={() => setHoveredParamKey(null)}
                      />
                    </g>
                  );
                })}

                {/* Sample nodes when zoomed */}
                {denseSampledPoints
                  .filter((_, idx) => {
                    const span = zoomWindow.endSec - zoomWindow.startSec;
                    if (span > 36000) return idx % 12 === 0;
                    if (span > 7200) return idx % 8 === 0;
                    if (span > 1800) return idx % 4 === 0;
                    return idx % 2 === 0;
                  })
                  .map((p) => (
                    <g key={`nodes-${p.sec}`}>
                      {activeVisibleParams.map((param) => {
                        const val = (p.telem as any)[param.key === 'temperature' ? 'temp' : param.key] ?? 0;
                        const y = getYForParam(param.key, val);
                        const isHovered = hoveredParamKey === param.key;
                        return (
                          <circle
                            key={`node-${param.key}-${p.sec}`}
                            cx={p.x}
                            cy={y}
                            r={isHovered ? 3.5 : 2}
                            fill={param.color}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                            opacity={hoveredParamKey && !isHovered ? 0.2 : 0.9}
                          />
                        );
                      })}
                    </g>
                  ))}

                {/* Hover Crosshair & Precision HUD Card */}
                {hoverCursor && hoverCursor.active && (
                  <g>
                    {/* Vertical Guideline */}
                    <line
                      x1={hoverCursor.x}
                      y1={padding.top}
                      x2={hoverCursor.x}
                      y2={chartHeight - padding.bottom}
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />
                    {/* Time Pill on X-Axis */}
                    <g transform={`translate(${hoverCursor.x}, ${chartHeight - 4})`}>
                      <rect x="-32" y="-13" width="64" height="15" rx="3" fill="#0F172A" />
                      <text textAnchor="middle" y="-2" fontSize="8.5" fill="#FFFFFF" fontWeight="bold" fontFamily="monospace">
                        {formatSecondsToClock(hoverCursor.sec, true)}
                      </text>
                    </g>
                    {/* Dynamic Tooltip HUD Card */}
                    {(() => {
                      if (hoveredParamKey && ALL_PARAM_CONFIGS[hoveredParamKey]) {
                        const p = ALL_PARAM_CONFIGS[hoveredParamKey];
                        const rawVal = (hoverCursor.telem as any)[p.key === 'temperature' ? 'temp' : p.key];
                        const formattedVal = typeof rawVal === 'number' ? (rawVal % 1 === 0 ? rawVal : rawVal.toFixed(2)) : rawVal ?? '--';
                        const cardW = 165;
                        const cardH = 48;
                        const posX = hoverCursor.x > chartWidth - cardW - 20 ? hoverCursor.x - cardW - 10 : hoverCursor.x + 10;

                        return (
                          <g transform={`translate(${posX}, ${padding.top + 4})`}>
                            <rect
                              x="0"
                              y="0"
                              width={cardW}
                              height={cardH}
                              rx="6"
                              fill="#0F172A"
                              fillOpacity="0.96"
                              stroke={p.color}
                              strokeWidth="1.5"
                            />
                            <text x="8" y="14" fontSize="8.5" fontWeight="bold" fill="#94A3B8" fontFamily="monospace">
                              ⏱ {formatSecondsToClock(hoverCursor.sec, true)} • Parameter Focus
                            </text>
                            <circle cx="12" cy="28" r="3.5" fill={p.color} />
                            <text x="20" y="32" fontSize="10.5" fontWeight="bold" fill="#FFFFFF" fontFamily="Inter, sans-serif">
                              {p.name}: <tspan fill={p.color}>{formattedVal} {p.unit}</tspan>
                            </text>
                          </g>
                        );
                      }

                      // Generic cursor: Show ONLY the active parameters selected in the filter
                      const cols = activeVisibleParams.length > 4 ? 2 : 1;
                      const rowCount = Math.ceil(activeVisibleParams.length / cols);
                      const cardW = cols === 2 ? 220 : 160;
                      const cardH = Math.max(48, 24 + rowCount * 17);
                      const posX = hoverCursor.x > chartWidth - cardW - 20 ? hoverCursor.x - cardW - 10 : hoverCursor.x + 10;

                      return (
                        <g transform={`translate(${posX}, ${padding.top + 4})`}>
                          <rect
                            x="0"
                            y="0"
                            width={cardW}
                            height={cardH}
                            rx="6"
                            fill="#0F172A"
                            fillOpacity="0.96"
                            stroke="#334155"
                            strokeWidth="1"
                          />
                          <text x="8" y="14" fontSize="8.5" fontWeight="bold" fill="#94A3B8" fontFamily="monospace">
                            ⏱ {formatSecondsToClock(hoverCursor.sec, true)} • {isStationaryNode ? 'Station' : selectedStream}
                          </text>
                          {activeVisibleParams.map((p, idx) => {
                            const col = cols === 2 ? idx % 2 : 0;
                            const row = cols === 2 ? Math.floor(idx / 2) : idx;
                            const itemX = col === 0 ? 8 : 115;
                            const itemY = 28 + row * 17;
                            const rawVal = (hoverCursor.telem as any)[p.key === 'temperature' ? 'temp' : p.key];
                            const formattedVal = typeof rawVal === 'number' ? (rawVal % 1 === 0 ? rawVal : rawVal.toFixed(1)) : rawVal ?? '--';

                            return (
                              <g key={`hud-${p.key}`}>
                                <circle cx={itemX + 3} cy={itemY - 3} r="2.5" fill={p.color} />
                                <text x={itemX + 9} y={itemY} fontSize="8.5" fontWeight="bold" fill="#F8FAFC" fontFamily="Inter, sans-serif">
                                  {p.shortLabel}: <tspan fill={p.color}>{formattedVal}</tspan>{' '}
                                  <tspan fill="#64748B" fontSize="7.5">{p.unit}</tspan>
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>
          ) : (
            /* ================= MODE 1: STANDARD SENSOR READINGS (MATCHES USER SCREENSHOT) ================= */
            <div className="pt-1">
              {renderSensorReadingsCards()}
            </div>
          )}
        </div>

      </div>

      {/* 4. Side-by-Side: Asset Location (Left) + Notifications & Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Side: Asset Location Map (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-sm font-bold text-[#0A1628]">
                  Asset Location
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  Live 24h Route • In-situ Reach
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GPS Tracking Active
                </span>
              </div>
            </div>

            {/* Live Synchronized Asset Satellite Map */}
            <MonitoringAssetMap
              progressRatio={scrubberProgress}
              mapType={mapType}
              onMapTypeChange={setMapType}
              assetName={selectedAsset}
            />
          </div>
        </div>

        {/* Right Side: Notifications & Alerts (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Header with Title & View All */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#0A1628]">
                    Notifications & Alerts
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">
                    {assetAlerts.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllAlertsModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Alert Items matching selected asset in vertical stack */}
              <div className="space-y-2.5">
                {assetAlerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50/90 transition-colors flex items-start gap-3"
                  >
                    {renderAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className={`text-xs font-bold ${getAlertTitleColor(alert.type)} truncate`}>
                          {alert.title}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Card Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Sentinel
              </span>
              <span className="font-mono text-[10px]">
                Auto-sync 1s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: All Notifications & Alerts History for Selected Asset */}
      {showAllAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Notifications & Alerts History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logs for <strong className="text-slate-800">{currentAssetData.name}</strong> ({currentAssetData.assetId} • {currentAssetData.location})
                </p>
              </div>
              <button
                onClick={() => setShowAllAlertsModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {assetAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  {renderAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold ${getAlertTitleColor(alert.type)}`}>
                        {alert.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAllAlertsModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
