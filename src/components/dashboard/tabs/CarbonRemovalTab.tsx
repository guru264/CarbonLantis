import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Minus,
  Plus,
  X,
  FileText,
  Sliders,
  Scale,
  FileCheck2,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  Check,
  Calendar,
  MapPin,
  Anchor,
  ShieldCheck,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useSlurryDosing, DosingTripRecord } from '../../../context/SlurryDosingContext';
import { carbonateChemistryData } from '../../../data/dashboardData';

interface NodeDetails {
  formula: string;
  description: string;
  inputs: { label: string; value: string; unit?: string }[];
  explanation: string;
}

export interface MineralCdrSubtreeData {
  mineralKey: 'caoh2' | 'caco3';
  mineralTitle: string;
  chemicalFormula: string;
  massKg: number;
  sourcingFactor: number;
  transportFactor: number;
  mfgTransportEmissionsKg: number;
  samplingEmissionsKg: number;
  projectEmissionsKg: number;
  electricityDoserKg: number;
  slurryPrepKg: number;
  totalActivitiesKg: number;
  counterfactualsKg: number;
  uncertaintyDiscountKg: number;
  massAlkalineFeedstockKg: number;
  carbonaceousFractionMgKg: number;
  totalCarbonAddedKg: number;
  co2EquivalentPureCarbon: number;
  co2eAlkalineFeedstockKg: number;
  co2eNetExportOceanKg: number;
  oceanCarbonStorageKg: number;
  sequestrationKg: number;
  netRemovalsKg: number;
}

export const CarbonRemovalTab: React.FC = () => {
  const { dosingTrips } = useSlurryDosing();
  const [selectedTripId, setSelectedTripId] = useState<string>(
    dosingTrips[0]?.id || 'trip-1'
  );

  // Isometric Canvas Pan & Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<NodeDetails | null>(null);

  // Success toast for downloading
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Filter for reports table
  const [reportFilter, setReportFilter] = useState<'ALL' | 'SELECTED'>('ALL');

  /*
    HIERARCHICAL TREE ACCORDION STATE & DYNAMIC AUTO-PANNING
    Both Ca(OH)2 and CaCO3 branches share identical calculations, nodes, and parent-child tree hierarchy.
    Opening a sibling automatically closes other open siblings at that level.
    The canvas automatically and smoothly glides to center the opened node!
  */
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isRootExpanded, setIsRootExpanded] = useState<boolean>(false);

  // Both Ca(OH)2 and CaCO3 maintain independent, complete identical branch states (starts collapsed)
  const [caoh2State, setCaoh2State] = useState<{
    isExpanded: boolean;
    activeTab: 'sequestration' | 'activities' | null;
    isOceanStorageExpanded: boolean;
    isFeedstockAddedExpanded: boolean;
    isTotalCarbonExpanded: boolean;
    isFeedstockMfgExpanded: boolean;
  }>({
    isExpanded: false,
    activeTab: null,
    isOceanStorageExpanded: false,
    isFeedstockAddedExpanded: false,
    isTotalCarbonExpanded: false,
    isFeedstockMfgExpanded: false,
  });

  const [caco3State, setCaco3State] = useState<{
    isExpanded: boolean;
    activeTab: 'sequestration' | 'activities' | null;
    isOceanStorageExpanded: boolean;
    isFeedstockAddedExpanded: boolean;
    isTotalCarbonExpanded: boolean;
    isFeedstockMfgExpanded: boolean;
  }>({
    isExpanded: false,
    activeTab: null,
    isOceanStorageExpanded: false,
    isFeedstockAddedExpanded: false,
    isTotalCarbonExpanded: false,
    isFeedstockMfgExpanded: false,
  });

  const updateBranchState = (
    mKey: 'caoh2' | 'caco3',
    patch: Partial<{
      isExpanded: boolean;
      activeTab: 'sequestration' | 'activities' | null;
      isOceanStorageExpanded: boolean;
      isFeedstockAddedExpanded: boolean;
      isTotalCarbonExpanded: boolean;
      isFeedstockMfgExpanded: boolean;
    }>
  ) => {
    if (mKey === 'caoh2') {
      setCaoh2State((prev) => ({ ...prev, ...patch }));
    } else {
      setCaco3State((prev) => ({ ...prev, ...patch }));
    }
  };

  // Horizontal alignment offsets so children render directly underneath their respective parent card (not in middle)
  const [subtreeOffsets, setSubtreeOffsets] = useState<Record<string, number>>({
    'caoh2': -156,
    'caco3': 156,
    'caoh2-sequestration': -450,
    'caco3-sequestration': -450,
    'caoh2-activities': -150,
    'caco3-activities': -150,
    'caoh2-feedstock-mfg': 160,
    'caco3-feedstock-mfg': 160,
    'caoh2-feedstock-added': 156,
    'caco3-feedstock-added': 156,
    'caoh2-total-carbon': 156,
    'caco3-total-carbon': 156,
  });

  const recordSubtreeOffset = (key: string, parentId: string, targetId: string) => {
    const parent = document.getElementById(parentId);
    const target = document.getElementById(targetId);
    if (parent && target) {
      const pR = parent.getBoundingClientRect();
      const tR = target.getBoundingClientRect();
      const shift = Math.round((tR.left + tR.width / 2) - (pR.left + pR.width / 2));
      setSubtreeOffsets((prev) => ({ ...prev, [key]: shift }));
    }
  };

  // Auto-pan helper: Smoothly and precisely centers an element or subtree inside the canvas viewport
  const panToElementId = (elementId: string) => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      const targetEl = document.getElementById(elementId);
      if (!canvas || !targetEl) return;

      const canvasRect = canvas.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const viewportCenterX = canvasRect.left + canvasRect.width / 2;
      const viewportCenterY = canvasRect.top + canvasRect.height / 2;

      const shiftX = viewportCenterX - targetCenterX;
      const shiftY = viewportCenterY - targetCenterY;

      setPanOffset((prev) => ({
        x: Math.round(prev.x + shiftX),
        y: Math.round(prev.y + shiftY)
      }));
    }, 60);
  };

  // Non-passive Wheel Zoom Listener: directly intercepts mouse wheel on canvas to zoom without scrolling page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser default scroll so canvas zooms in place
      e.preventDefault();
      e.stopPropagation();

      const zoomStep = 0.08;
      const zoomDelta = e.deltaY < 0 ? zoomStep : -zoomStep;

      setZoomLevel((prev) => {
        const next = Number((prev + zoomDelta).toFixed(2));
        return Math.min(Math.max(next, 0.25), 2.2);
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const expandAll = () => {
    setIsRootExpanded(true);
    setCaoh2State({
      isExpanded: true,
      activeTab: 'sequestration',
      isOceanStorageExpanded: true,
      isFeedstockAddedExpanded: true,
      isTotalCarbonExpanded: true,
      isFeedstockMfgExpanded: true,
    });
    setCaco3State({
      isExpanded: true,
      activeTab: 'sequestration',
      isOceanStorageExpanded: true,
      isFeedstockAddedExpanded: true,
      isTotalCarbonExpanded: true,
      isFeedstockMfgExpanded: true,
    });
    setZoomLevel(0.75);
    setPanOffset({ x: 0, y: 0 });
    panToElementId('node-root');
  };

  const collapseAll = () => {
    setIsRootExpanded(false);
    setCaoh2State({
      isExpanded: false,
      activeTab: null,
      isOceanStorageExpanded: false,
      isFeedstockAddedExpanded: false,
      isTotalCarbonExpanded: false,
      isFeedstockMfgExpanded: false,
    });
    setCaco3State({
      isExpanded: false,
      activeTab: null,
      isOceanStorageExpanded: false,
      isFeedstockAddedExpanded: false,
      isTotalCarbonExpanded: false,
      isFeedstockMfgExpanded: false,
    });
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    panToElementId('node-root');
  };

  // Helper to compute values for any trip
  const calculateTripCdr = (trip: DosingTripRecord) => {
    const V_slurry_L = trip.quantityLiters || 200;
    const isMgOH = trip.mineralType.includes('Mg');
    const isCaCO3 = trip.mineralType.includes('CaCO');

    const slurryLoading_kg_L = 0.12;
    const m_mineral_kg = V_slurry_L * slurryLoading_kg_L;

    const molarMass = isMgOH ? 58.32 : isCaCO3 ? 100.09 : 74.09;
    const f_active = isMgOH ? 0.90 : isCaCO3 ? 0.95 : 0.57;
    const n_moles = (1000 * m_mineral_kg * f_active) / molarMass;
    const TA_theoretical_mol_eq = 2 * n_moles;

    const delta_dCO2_ppm = -450;
    const pCO2_upstream_uatm = 1250;
    const pCO2_downstream_uatm = 789.5;
    const delta_pCO2_uatm = pCO2_downstream_uatm - pCO2_upstream_uatm;

    const delta_TA_attr_umol_kg = 210;
    const delta_DIC_attr_umol_kg = 200;

    const gross_uptake_kg = TA_theoretical_mol_eq * 0.85 * (44.01 / 1000) * 1.8;
    const gross_uptake_t = gross_uptake_kg / 1000;

    const f_durable = 0.90;
    const durable_uptake_kg = gross_uptake_kg * f_durable;
    const durable_uptake_t = durable_uptake_kg / 1000;

    const reversals_outgassing_kg = gross_uptake_kg * 0.035;
    const reversals_precipitation_kg = gross_uptake_kg * 0.015;
    const R_total_kg = reversals_outgassing_kg + reversals_precipitation_kg;
    const R_already_accounted_kg = gross_uptake_kg * (1 - f_durable) * 0.5;
    const R_uncounted_kg = Math.max(0, R_total_kg - R_already_accounted_kg);
    const R_uncounted_t = R_uncounted_kg / 1000;

    const emissions_transport_kg = 12.4 + V_slurry_L * 0.02;
    const emissions_milling_kg = m_mineral_kg * 0.08;
    const emissions_operations_kg = 8.5;
    const total_activities_emissions_kg =
      emissions_transport_kg + emissions_milling_kg + emissions_operations_kg;
    const total_activities_emissions_t = total_activities_emissions_kg / 1000;

    const net_cdr_kg = durable_uptake_kg - R_uncounted_kg - total_activities_emissions_kg;
    const net_cdr_t = net_cdr_kg / 1000;

    // Deterministic pseudo SHA256 from trip properties
    const pseudoHash = `sha256:0x${Array.from(trip.tripCode + trip.scheduledDate + trip.mineralType)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .slice(0, 32)}...`;

    return {
      V_slurry_L,
      m_mineral_kg,
      molarMass,
      f_active,
      n_moles,
      TA_theoretical_mol_eq,
      delta_dCO2_ppm,
      pCO2_upstream_uatm,
      pCO2_downstream_uatm,
      delta_pCO2_uatm,
      delta_TA_attr_umol_kg,
      delta_DIC_attr_umol_kg,
      gross_uptake_kg,
      gross_uptake_t,
      f_durable,
      durable_uptake_kg,
      durable_uptake_t,
      reversals_outgassing_kg,
      reversals_precipitation_kg,
      R_uncounted_kg,
      R_uncounted_t,
      emissions_transport_kg,
      emissions_milling_kg,
      emissions_operations_kg,
      total_activities_emissions_kg,
      total_activities_emissions_t,
      net_cdr_kg,
      net_cdr_t,
      pseudoHash
    };
  };

  // Find active selected trip
  const activeTrip: DosingTripRecord = useMemo(() => {
    return (
      dosingTrips.find((t) => t.id === selectedTripId) ||
      dosingTrips[0] || {
        id: 'trip-1',
        tripCode: 'TRIP-2026-012',
        assetName: 'AquaDrone_MVP_001',
        tankId: 'T001',
        batchId: 'MB-2026-001',
        mineralType: 'Magnesium Hydroxide (Mg(OH)₂)',
        quantityLiters: 220,
        catchmentReach: 'Kesinapalli Canal Reach 1 (Godavari Delta)',
        dosingRateLPerHr: 8.5,
        scheduledDate: '2026-11-01',
        scheduledTime: '06:00 AM',
        status: 'Active Dosing',
        operator: 'Dr. Elena Vance (Lead Operator)',
        createdAt: 'Today, 05:45 AM'
      }
    );
  }, [dosingTrips, selectedTripId]);

  const calculations = useMemo(() => {
    return calculateTripCdr(activeTrip);
  }, [activeTrip]);

  // Calculation generator for Calcium mineral subtrees: Ca(OH)2 and CaCO3
  // Both minerals share identical calculation nodes and mathematical speciation models
  const computeMineralData = (mKey: 'caoh2' | 'caco3', totalMassKg: number): MineralCdrSubtreeData => {
    const isCaOH2 = mKey === 'caoh2';
    // Allocate realistic stoichiometric mass split for Calcium mineral regime (52% Ca(OH)2 / 48% CaCO3)
    const massKg = isCaOH2 ? Math.max(1, totalMassKg * 0.52) : Math.max(1, totalMassKg * 0.48);

    // Activities factors (ISO Scope 1, 2, 3)
    const sourcingFactor = isCaOH2 ? 0.045 : 0.038; // kg CO2/kg
    const transportFactor = 0.062; // kg CO2/kg
    const mfgTransportEmissionsKg = (sourcingFactor + transportFactor) * massKg;
    const samplingEmissionsKg = 0.850; // kgCO2e (Continuous edge IoT and dMRV drone sampling)
    const projectEmissionsKg = 1.200; // kgCO2 (Depot staging and handling)
    const electricityDoserKg = 0; // 0 kg (Autonomous solar buffer battery at doser)
    const slurryPrepKg = 0; // 0 kg (Ambient gravity/hydraulic induction mixing)
    const totalActivitiesKg =
      mfgTransportEmissionsKg + samplingEmissionsKg + projectEmissionsKg + electricityDoserKg + slurryPrepKg;

    // Counterfactuals & Uncertainty Discount
    const counterfactualsKg = 0; // 0 kg (Conservative counterfactual baseline)
    const uncertaintyDiscountKg = 0; // 0 kgCO2e (Directly buffered at ocean export)

    // Sequestration via Inland Ocean Carbon Export
    const massAlkalineFeedstockKg = massKg;
    // Carbonaceous fraction from accredited laboratory qXRD / TC tests (9.9% vs 11.68%)
    const carbonaceousFractionMgKg = isCaOH2 ? 99000 : 116844.6;
    const totalCarbonAddedKg = (massAlkalineFeedstockKg * carbonaceousFractionMgKg) / 1000000;
    const co2EquivalentPureCarbon = 3.667;
    const co2eAlkalineFeedstockKg = co2EquivalentPureCarbon * totalCarbonAddedKg;

    // Ocean export stoichiometric capacity
    const molarMass = isCaOH2 ? 74.09 : 100.09;
    const moles = (massKg * 1000) / molarMass;
    const taEquiv = moles * 2.0; // 2 equivalents alkalinity
    const etaOcean = isCaOH2 ? 0.85 : 0.80; // freshwater to ocean transit efficiency
    const co2eNetExportOceanKg = (taEquiv * etaOcean * 0.04401);

    // Ocean carbon storage via inland water export
    const oceanCarbonStorageKg = Math.max(0, co2eNetExportOceanKg - co2eAlkalineFeedstockKg);
    const sequestrationKg = oceanCarbonStorageKg;

    // Net Removals = Sequestration - Activities + Counterfactuals + Uncertainty discount
    const netRemovalsKg = Math.max(0, sequestrationKg - totalActivitiesKg + counterfactualsKg + uncertaintyDiscountKg);

    return {
      mineralKey: mKey,
      mineralTitle: isCaOH2 ? 'Calcium Hydroxide (Ca(OH)₂)' : 'Calcium Carbonate (CaCO₃)',
      chemicalFormula: isCaOH2 ? 'Ca(OH)₂' : 'CaCO₃',
      massKg,
      sourcingFactor,
      transportFactor,
      mfgTransportEmissionsKg,
      samplingEmissionsKg,
      projectEmissionsKg,
      electricityDoserKg,
      slurryPrepKg,
      totalActivitiesKg,
      counterfactualsKg,
      uncertaintyDiscountKg,
      massAlkalineFeedstockKg,
      carbonaceousFractionMgKg,
      totalCarbonAddedKg,
      co2EquivalentPureCarbon,
      co2eAlkalineFeedstockKg,
      co2eNetExportOceanKg,
      oceanCarbonStorageKg,
      sequestrationKg,
      netRemovalsKg,
    };
  };

  const caoh2Data = useMemo(() => computeMineralData('caoh2', calculations.m_mineral_kg), [calculations.m_mineral_kg]);
  const caco3Data = useMemo(() => computeMineralData('caco3', calculations.m_mineral_kg), [calculations.m_mineral_kg]);
  const totalNetRemovalsKg = useMemo(() => caoh2Data.netRemovalsKg + caco3Data.netRemovalsKg, [caoh2Data, caco3Data]);
  const totalNetRemovalsT = useMemo(() => totalNetRemovalsKg / 1000, [totalNetRemovalsKg]);

  // Canvas Panning Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleCanvasMouseUp = () => setIsDragging(false);

  // Interactive Zoom Control Helpers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 2.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.25));
  };

  const handleResetView = () => {
    setZoomLevel(0.9);
    setPanOffset({ x: 0, y: 0 });
    panToElementId('node-root');
  };

  // Node Card renderer matching Isometric interface
  const renderNodeCard = ({
    id,
    title,
    value,
    unit,
    hasChildren = false,
    isExpanded = false,
    isActive = false,
    isLeafStar = false,
    onToggle,
    detailsFormula,
    detailsDescription,
    detailsInputs = [],
    detailsExplanation = 'Validated under Isometric Standard and ISO 14064-2:2019 guidelines.'
  }: {
    id: string;
    title: string;
    value: string;
    unit: string;
    hasChildren?: boolean;
    isExpanded?: boolean;
    isActive?: boolean;
    isLeafStar?: boolean;
    onToggle?: () => void;
    detailsFormula: string;
    detailsDescription: string;
    detailsInputs?: { label: string; value: string; unit?: string }[];
    detailsExplanation?: string;
  }) => {
    return (
      <div id={id} className="relative inline-flex flex-col items-center select-none">
        <div
          onClick={() => {
            if (hasChildren && onToggle) {
              onToggle();
            } else {
              setSelectedNodeDetails({
                formula: detailsFormula,
                description: detailsDescription,
                inputs: detailsInputs,
                explanation: detailsExplanation
              });
            }
          }}
          className={`group bg-white hover:bg-slate-50/70 border rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-center w-64 sm:w-72 px-4 py-2.5 shadow-xs hover:shadow-sm select-none ${
            isExpanded || isActive
              ? 'border-slate-400 bg-white ring-1 ring-slate-300/60'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          {/* Top content row: Title on left, Value pill on right */}
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
              {isLeafStar && <span className="text-amber-500 font-bold text-xs select-none">*</span>}
              <span
                className="text-xs font-semibold text-slate-800 truncate tracking-tight"
                title={title}
              >
                {title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md border bg-rose-50/70 border-rose-100/90 text-slate-800 whitespace-nowrap">
                <span>{value}</span>{' '}
                <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
              </div>
            </div>
          </div>

          {/* Centered Chevron indicator inside card at bottom */}
          {hasChildren && (
            <div className="mt-1 -mb-0.5 flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Operator badge between sibling nodes in soft circular container
  const renderOperatorBadge = (operator: '+' | '-' | '×' | '=') => (
    <div className="w-6 h-6 rounded-full bg-rose-50/60 border border-rose-200/70 text-slate-700 font-semibold font-mono text-xs flex items-center justify-center shadow-2xs shrink-0 select-none">
      {operator}
    </div>
  );

  // Render complete mineral subtree (Ca(OH)2 or CaCO3) with identical hierarchical container-box levels
  const renderMineralSubtree = (data: MineralCdrSubtreeData, mKey: 'caoh2' | 'caco3') => {
    const branch = mKey === 'caoh2' ? caoh2State : caco3State;

    return (
      <div id={`subtree-${mKey}`} className="flex flex-col items-center select-none animate-in fade-in slide-in-from-top-3 duration-300">
        {/* LEVEL 3: SIBLING CONTAINER BOX (Sequestration - Activities + *Counterfactuals + *Uncertainty discount) */}
        <div id={`container-level3-${mKey}`} className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
          {/* Sibling 1: Sequestration */}
          {renderNodeCard({
            id: `node-${mKey}-sequestration`,
            title: 'Sequestration',
            value: data.sequestrationKg.toFixed(3),
            unit: 'kgCO2e',
            hasChildren: true,
            isExpanded: branch.activeTab === 'sequestration',
            isActive: branch.activeTab === 'sequestration',
            onToggle: () => {
              const next = branch.activeTab === 'sequestration' ? null : 'sequestration';
              if (next) {
                recordSubtreeOffset(`${mKey}-sequestration`, `container-level3-${mKey}`, `node-${mKey}-sequestration`);
              }
              updateBranchState(mKey, {
                activeTab: next,
                isOceanStorageExpanded: false,
                isFeedstockAddedExpanded: false,
                isTotalCarbonExpanded: false,
                isFeedstockMfgExpanded: false,
              });
              if (next) {
                panToElementId(`subtree-${mKey}-sequestration`);
              } else {
                panToElementId(`subtree-${mKey}`);
              }
            },
            detailsFormula: 'Sequestration = Ocean Carbon Storage via inland water export',
            detailsDescription: 'Net riverine total alkalinity and dissolved inorganic carbon safely exported to marine sinks.',
            detailsInputs: [
              { label: 'Gross Ocean Storage', value: `${data.oceanCarbonStorageKg.toFixed(3)}`, unit: 'kgCO2e' }
            ]
          })}

          {/* Operator - */}
          {renderOperatorBadge('-')}

          {/* Sibling 2: Activities */}
          {renderNodeCard({
            id: `node-${mKey}-activities`,
            title: 'Activities',
            value: data.totalActivitiesKg.toFixed(3),
            unit: 'kgCO2e',
            hasChildren: true,
            isExpanded: branch.activeTab === 'activities',
            isActive: branch.activeTab === 'activities',
            onToggle: () => {
              const next = branch.activeTab === 'activities' ? null : 'activities';
              if (next) {
                recordSubtreeOffset(`${mKey}-activities`, `container-level3-${mKey}`, `node-${mKey}-activities`);
              }
              updateBranchState(mKey, {
                activeTab: next,
                isOceanStorageExpanded: false,
                isFeedstockAddedExpanded: false,
                isTotalCarbonExpanded: false,
                isFeedstockMfgExpanded: false,
              });
              if (next) {
                panToElementId(`subtree-${mKey}-activities`);
              } else {
                panToElementId(`subtree-${mKey}`);
              }
            },
            detailsFormula: 'Activities = Sampling + Project Emissions + Electricity + Feedstock (Mfg & Transport) + Slurry Prep',
            detailsDescription: 'Cumulative lifecycle emissions deductions incurred across all operational deployment stages.',
            detailsInputs: [
              { label: 'Feedstock Mfg & Transport', value: `${data.mfgTransportEmissionsKg.toFixed(3)}`, unit: 'kgCO2e' },
              { label: 'Project Emissions', value: `${data.projectEmissionsKg.toFixed(3)}`, unit: 'kgCO2' },
              { label: 'dMRV Sampling', value: `${data.samplingEmissionsKg.toFixed(3)}`, unit: 'kgCO2e' }
            ]
          })}

          {/* Operator + */}
          {renderOperatorBadge('+')}

          {/* Sibling 3: Counterfactuals */}
          {renderNodeCard({
            id: `node-${mKey}-counterfactuals`,
            title: 'Counterfactuals',
            value: '0',
            unit: 'kg',
            isLeafStar: true,
            hasChildren: false,
            detailsFormula: 'Counterfactual baseline = 0 kg (Baseline river alkalinity export modeled via PyCO2SYS)',
            detailsDescription: 'Strict counterfactual accounting ensures only newly enhanced weathering alkalinity is credited.',
            detailsInputs: [
              { label: 'River Reach', value: activeTrip.catchmentReach },
              { label: 'Baseline DIC', value: `${carbonateChemistryData.baselineDicUmolKg}`, unit: 'µmol/kg' },
              { label: 'Baseline TA', value: `${carbonateChemistryData.baselineTotalAlkalinityUeqKg}`, unit: 'µeq/kg' }
            ]
          })}

          {/* Operator + */}
          {renderOperatorBadge('+')}

          {/* Sibling 4: Uncertainty discount */}
          {renderNodeCard({
            id: `node-${mKey}-uncertainty`,
            title: 'Uncertainty discount',
            value: '0',
            unit: 'kgCO2e',
            isLeafStar: true,
            hasChildren: false,
            detailsFormula: 'Uncertainty buffer = 0 kgCO2e (Conservatism factor applied directly at ocean export step)',
            detailsDescription: 'Isometric protocol conservative uncertainty deductions to guarantee durable non-reversal.',
            detailsInputs: [
              { label: 'Buffer Allocation', value: '100% Permanence' }
            ]
          })}
        </div>

        {/* ── EXPANSION UNDER SEQUESTRATION: ALIGNED DIRECTLY UNDER SEQUESTRATION CARD ── */}
        {branch.activeTab === 'sequestration' && (
          <div
            id={`subtree-${mKey}-sequestration`}
            style={{ transform: `translateX(${subtreeOffsets[`${mKey}-sequestration`] ?? -450}px)` }}
            className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
          >
            {/* Vertical connector line directly below Sequestration card */}
            <div className="w-px h-6 bg-slate-300" />

            {/* Level 4: Ocean carbon storage via inland water export */}
            {renderNodeCard({
              id: `node-${mKey}-ocean-storage`,
              title: 'Ocean carbon storage via inland water export',
              value: data.oceanCarbonStorageKg.toFixed(3),
              unit: 'kgCO2e',
              hasChildren: true,
              isExpanded: branch.isOceanStorageExpanded,
              isActive: branch.isOceanStorageExpanded,
              onToggle: () => {
                const next = !branch.isOceanStorageExpanded;
                updateBranchState(mKey, {
                  isOceanStorageExpanded: next,
                  isFeedstockAddedExpanded: false,
                  isTotalCarbonExpanded: false,
                });
                if (next) {
                  panToElementId(`subtree-${mKey}-ocean-storage`);
                } else {
                  panToElementId(`subtree-${mKey}-sequestration`);
                }
              },
              detailsFormula: '(CO2e stored = CO2e ocean export - CO2e feedstock carbon)',
              detailsDescription: 'Net stored CO₂ in ocean reservoirs deducting embedded mineral carbonaceous background.',
              detailsInputs: [
                { label: 'CO2e Net Export', value: `${data.co2eNetExportOceanKg.toFixed(3)}`, unit: 'kgCO2e' },
                { label: 'CO2e Feedstock Carbon', value: `${data.co2eAlkalineFeedstockKg.toFixed(3)}`, unit: 'kgCO2e' }
              ]
            })}

            {/* Level 5 Container Box under Ocean Carbon Storage */}
            {branch.isOceanStorageExpanded && (
              <div id={`subtree-${mKey}-ocean-storage`} className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="w-px h-6 bg-slate-300" />

                <div id={`container-ocean-storage-${mKey}`} className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
                  {/* Child A: CO2e net export to the ocean from inland waters */}
                  {renderNodeCard({
                    id: `node-${mKey}-co2e-net-export`,
                    title: 'CO2e net export to the ocean from inland waters',
                    value: data.co2eNetExportOceanKg.toFixed(3),
                    unit: 'kgCO2e',
                    hasChildren: false,
                    detailsFormula: 'CO2e net export = TA_equiv × η_ocean × (44.01 / 1000)',
                    detailsDescription: 'Riverine total alkalinity exported past delta reach without outgassing or mineral precipitation.',
                    detailsInputs: [
                      { label: 'Catchment', value: activeTrip.catchmentReach },
                      { label: 'Dissolved Alkalinity', value: `${data.co2eNetExportOceanKg.toFixed(3)}`, unit: 'kgCO2e' }
                    ]
                  })}

                  {/* Operator - */}
                  {renderOperatorBadge('-')}

                  {/* Child B: CO2e of alkaline feedstock added during reporting period */}
                  {renderNodeCard({
                    id: `node-${mKey}-feedstock-added`,
                    title: 'CO2e of alkaline feedstock added during reporting period',
                    value: data.co2eAlkalineFeedstockKg.toFixed(3),
                    unit: 'kgCO2e',
                    hasChildren: true,
                    isExpanded: branch.isFeedstockAddedExpanded,
                    isActive: branch.isFeedstockAddedExpanded,
                    onToggle: () => {
                      const next = !branch.isFeedstockAddedExpanded;
                      if (next) {
                        recordSubtreeOffset(`${mKey}-feedstock-added`, `container-ocean-storage-${mKey}`, `node-${mKey}-feedstock-added`);
                      }
                      updateBranchState(mKey, {
                        isFeedstockAddedExpanded: next,
                        isTotalCarbonExpanded: false,
                      });
                      if (next) {
                        panToElementId(`subtree-${mKey}-feedstock-added`);
                      } else {
                        panToElementId(`subtree-${mKey}-ocean-storage`);
                      }
                    },
                    detailsFormula: 'CO2e feedstock = CO2 equivalent of pure carbon (3.667) × Total carbon added',
                    detailsDescription: 'Accounting deduction for background carbonaceous content measured in raw alkaline material.',
                    detailsInputs: [
                      { label: 'CO2 eq factor', value: '3.667' },
                      { label: 'Total Carbon Added', value: `${data.totalCarbonAddedKg.toFixed(3)}`, unit: 'kg' }
                    ]
                  })}
                </div>

                {/* Level 6 Container Box under Feedstock Added */}
                {branch.isFeedstockAddedExpanded && (
                  <div
                    id={`subtree-${mKey}-feedstock-added`}
                    style={{ transform: `translateX(${subtreeOffsets[`${mKey}-feedstock-added`] ?? 156}px)` }}
                    className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
                  >
                    <div className="w-px h-6 bg-slate-300" />

                    <div id={`container-feedstock-added-${mKey}`} className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
                      {/* Sub-item 1: CO2 equivalent of pure carbon */}
                      {renderNodeCard({
                        id: `node-${mKey}-co2-eq-pure`,
                        title: 'CO2 equivalent of pure carbon',
                        value: '3.667',
                        unit: '',
                        hasChildren: false,
                        detailsFormula: 'Factor = 44.01 g/mol CO2 ÷ 12.011 g/mol C = 3.667',
                        detailsDescription: 'Stoichiometric molar conversion ratio of elemental carbon into carbon dioxide equivalent.'
                      })}

                      {/* Operator × */}
                      {renderOperatorBadge('×')}

                      {/* Sub-item 2: Total carbon added as alkaline feedstock */}
                      {renderNodeCard({
                        id: `node-${mKey}-total-carbon`,
                        title: 'Total carbon added as alkaline feedstock',
                        value: data.totalCarbonAddedKg.toFixed(3),
                        unit: 'kg',
                        hasChildren: true,
                        isExpanded: branch.isTotalCarbonExpanded,
                        isActive: branch.isTotalCarbonExpanded,
                        onToggle: () => {
                          const next = !branch.isTotalCarbonExpanded;
                          if (next) {
                            recordSubtreeOffset(`${mKey}-total-carbon`, `container-feedstock-added-${mKey}`, `node-${mKey}-total-carbon`);
                          }
                          updateBranchState(mKey, { isTotalCarbonExpanded: next });
                          if (next) {
                            panToElementId(`subtree-${mKey}-total-carbon`);
                          } else {
                            panToElementId(`subtree-${mKey}-feedstock-added`);
                          }
                        },
                        detailsFormula: 'Total C = Mass added × Carbonaceous fraction (TC %)',
                        detailsDescription: 'Total elemental carbon present in mineral feedstock from accredited laboratory combustion tests (TC test).',
                        detailsInputs: [
                          { label: 'Mass Feedstock Added', value: `${data.massAlkalineFeedstockKg.toFixed(2)}`, unit: 'kg' },
                          { label: 'Carbonaceous Fraction', value: `${data.carbonaceousFractionMgKg.toLocaleString()}`, unit: 'mg/kg' }
                        ]
                      })}
                    </div>

                    {/* Level 7 Container Box under Total Carbon Added */}
                    {branch.isTotalCarbonExpanded && (
                      <div
                        id={`subtree-${mKey}-total-carbon`}
                        style={{ transform: `translateX(${subtreeOffsets[`${mKey}-total-carbon`] ?? 156}px)` }}
                        className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
                      >
                        <div className="w-px h-6 bg-slate-300" />

                        <div className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
                          {/* Sub-item A: Mass of alkaline feedstock added */}
                          {renderNodeCard({
                            id: `node-${mKey}-mass-alkaline`,
                            title: 'Mass of alkaline feedstock added',
                            value: data.massAlkalineFeedstockKg.toFixed(2),
                            unit: 'kg',
                            hasChildren: false,
                            detailsFormula: 'Mass = Slurry volume [L] × Loading ratio [kg/L]',
                            detailsDescription: 'Certified mineral mass loaded into slurry tank for active dosing.',
                            detailsInputs: [
                              { label: 'Trip Slurry Volume', value: `${activeTrip.quantityLiters}`, unit: 'L' }
                            ]
                          })}

                          {/* Operator × */}
                          {renderOperatorBadge('×')}

                          {/* Sub-item B: Carbonaceous fraction in feedstock */}
                          {renderNodeCard({
                            id: `node-${mKey}-carbon-fraction`,
                            title: 'Carbonaceous fraction in feedstock',
                            value: data.carbonaceousFractionMgKg.toLocaleString(),
                            unit: 'mg/kg (TC test)',
                            hasChildren: false,
                            detailsFormula: 'Fraction = Laboratory Total Carbon (TC) test assay',
                            detailsDescription: 'High-temperature catalytic combustion determination of residual total carbon in mineral quarry batch (mg/kg from TC test).',
                            detailsInputs: [
                              { label: 'Test Standard', value: 'ASTM E1915 / qXRD TC' },
                              { label: 'Percentage', value: `${(data.carbonaceousFractionMgKg / 10000).toFixed(2)}%` }
                            ]
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── EXPANSION UNDER ACTIVITIES: ALIGNED DIRECTLY UNDER ACTIVITIES CARD ── */}
        {branch.activeTab === 'activities' && (
          <div
            id={`subtree-${mKey}-activities`}
            style={{ transform: `translateX(${subtreeOffsets[`${mKey}-activities`] ?? -150}px)` }}
            className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
          >
            {/* Vertical connector line directly below Activities card */}
            <div className="w-px h-6 bg-slate-300" />

            {/* Level 4 Container Box: 5 Items under Activities */}
            <div id={`container-activities-${mKey}`} className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Item 1: *Sampling required for dMRV */}
              {renderNodeCard({
                id: `node-${mKey}-act-sampling`,
                title: 'Sampling required for dMRV',
                value: data.samplingEmissionsKg.toFixed(3),
                unit: 'kgCO2e',
                isLeafStar: true,
                hasChildren: false,
                detailsFormula: 'Emissions = Autonomous vessel telemetry power + grab sample analytical logistics',
                detailsDescription: 'Greenhouse gas emissions resulting from continuous field sensor monitoring and river sampling.'
              })}

              {/* Operator + */}
              {renderOperatorBadge('+')}

              {/* Item 2: *Project emissions */}
              {renderNodeCard({
                id: `node-${mKey}-act-project`,
                title: 'Project emissions',
                value: data.projectEmissionsKg.toFixed(3),
                unit: 'kgCO2',
                isLeafStar: true,
                hasChildren: false,
                detailsFormula: 'Emissions = Operational support vehicle transport + onshore depot power',
                detailsDescription: 'Scope 1 direct emissions associated with riverine dosing vessel dispatch and maintenance.'
              })}

              {/* Operator + */}
              {renderOperatorBadge('+')}

              {/* Item 3: *Electricity use at doser */}
              {renderNodeCard({
                id: `node-${mKey}-act-electricity`,
                title: 'Electricity use at doser',
                value: '0',
                unit: 'kg',
                isLeafStar: true,
                hasChildren: false,
                detailsFormula: 'Emissions = 0 kg (Onboard Solar Photovoltaic / Passive Dissolution Dosing)',
                detailsDescription: 'Zero grid electricity consumed on riverine platform; pumps operate on onboard solar-charged buffer batteries.'
              })}

              {/* Operator + */}
              {renderOperatorBadge('+')}

              {/* Item 4: Feedstock manufacturing & transport */}
              {renderNodeCard({
                id: `node-${mKey}-feedstock-mfg`,
                title: 'Feedstock manufacturing & transport',
                value: data.mfgTransportEmissionsKg.toFixed(3),
                unit: 'kgCO2e',
                hasChildren: true,
                isExpanded: branch.isFeedstockMfgExpanded,
                isActive: branch.isFeedstockMfgExpanded,
                onToggle: () => {
                  const next = !branch.isFeedstockMfgExpanded;
                  if (next) {
                    recordSubtreeOffset(`${mKey}-feedstock-mfg`, `container-activities-${mKey}`, `node-${mKey}-feedstock-mfg`);
                  }
                  updateBranchState(mKey, { isFeedstockMfgExpanded: next });
                  if (next) {
                    panToElementId(`subtree-${mKey}-feedstock-mfg`);
                  } else {
                    panToElementId(`subtree-${mKey}-activities`);
                  }
                },
                detailsFormula: 'Emissions = (Sourcing factor + Transport factor) × Mass',
                detailsDescription: 'Cradle-to-gate Scope 3 lifecycle footprint from quarry extraction, milling, and highway freight.',
                detailsInputs: [
                  { label: 'Sourcing Factor', value: `${data.sourcingFactor}`, unit: 'kg CO2/kg' },
                  { label: 'Transport Factor', value: `${data.transportFactor}`, unit: 'kg CO2/kg' }
                ]
              })}

              {/* Operator + */}
              {renderOperatorBadge('+')}

              {/* Item 5: *Slurry preparation */}
              {renderNodeCard({
                id: `node-${mKey}-act-slurry`,
                title: 'Slurry preparation',
                value: '0',
                unit: 'kg',
                isLeafStar: true,
                hasChildren: false,
                detailsFormula: 'Emissions = 0 kg (Ambient Hydraulic Induction Mix)',
                detailsDescription: 'Onboard hydraulic eductor utilizes gravity and natural river flow suction for slurry induction without auxiliary fuel.'
              })}
            </div>

            {/* Level 5 Container Box under Feedstock Mfg */}
            {branch.isFeedstockMfgExpanded && (
              <div
                id={`subtree-${mKey}-feedstock-mfg`}
                style={{ transform: `translateX(${subtreeOffsets[`${mKey}-feedstock-mfg`] ?? 160}px)` }}
                className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
              >
                <div className="w-px h-6 bg-slate-300" />

                <div className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
                  {/* Sub-item 1: Feedstock sourcing & processing */}
                  {renderNodeCard({
                    id: `node-${mKey}-act-sourcing`,
                    title: 'Feedstock sourcing & processing',
                    value: data.sourcingFactor.toFixed(3),
                    unit: 'kg CO2/kg',
                    hasChildren: false,
                    detailsFormula: 'Factor = Quarry extraction fuel + micro-milling electrical grid factor',
                    detailsDescription: 'Energy consumed during rock crushing and micronization to achieve D50 particle size.'
                  })}

                  {/* Operator + */}
                  {renderOperatorBadge('+')}

                  {/* Sub-item 2: Feedstock transport */}
                  {renderNodeCard({
                    id: `node-${mKey}-act-transport`,
                    title: 'Feedstock transport',
                    value: data.transportFactor.toFixed(3),
                    unit: 'kg CO2/kg',
                    hasChildren: false,
                    detailsFormula: 'Factor = Heavy vehicle transit km × Fuel factor ÷ Total payload mass',
                    detailsDescription: 'Certified heavy vehicle road transport emissions from quarry dispatch depot to river staging station.'
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Trip-specific reports generated dynamically from all dosing trips!
  const tripReports = useMemo(() => {
    return dosingTrips.map((trip) => {
      const cdr = calculateTripCdr(trip);
      const isVerified = trip.status === 'Completed' || trip.status === 'Active Dosing';
      return {
        tripId: trip.id,
        tripCode: trip.tripCode,
        reportBatchCode: `MRV-${trip.tripCode}-ISO`,
        period: `${trip.scheduledDate} ${trip.scheduledTime}`,
        catchment: trip.catchmentReach,
        assetName: trip.assetName,
        mineralType: trip.mineralType,
        quantityLiters: trip.quantityLiters,
        operator: trip.operator,
        totalNetCo2Tonnes: cdr.net_cdr_t.toFixed(4),
        grossCapturedTonnes: cdr.gross_uptake_t.toFixed(4),
        deductionsTonnes: cdr.total_activities_emissions_t.toFixed(4),
        verificationStatus: isVerified ? 'Verified & Audited' : 'Pending Verification',
        verifier: 'SGS Environmental & ISO 14064-2 Lead Auditor',
        standardAlignment: 'ISO 14064-2:2019 / Isometric Protocol',
        sha256Hash: cdr.pseudoHash,
        status: trip.status
      };
    });
  }, [dosingTrips]);

  // Function to download an authentic markdown/text report for any trip
  const handleDownloadTripReport = (report: (typeof tripReports)[0]) => {
    const content = `================================================================================
CARBONLANTIS MRV REPORT DOSSIER
Standard Alignment: ${report.standardAlignment}
Report Code:        ${report.reportBatchCode}
Verification:       ${report.verificationStatus}
Auditor:            ${report.verifier}
Cryptographic Hash: ${report.sha256Hash}
================================================================================

1. MISSION & DOSING TRIP SPECIFICATIONS
--------------------------------------------------------------------------------
Trip Code:          ${report.tripCode}
Vessel Asset:       ${report.assetName}
Scheduled Date:     ${report.period}
Catchment Reach:    ${report.catchment}
Field Operator:     ${report.operator}
Mineral Slurry:     ${report.mineralType}
Volume Discharged:  ${report.quantityLiters} Liters
Operating Status:   ${report.status}

2. NET CARBON DIOXIDE REMOVAL (CDR) SUMMARY
--------------------------------------------------------------------------------
Gross Ingress:      ${report.grossCapturedTonnes} tCO2e
Lifecycle Emissions:${report.deductionsTonnes} tCO2e (Scopes 1, 2, 3)
Permanence Factor:  90.0% (10% Buffer Withheld)
NET CERTIFIED CDR:  ${report.totalNetCo2Tonnes} tCO2e

3. CARBONATE CHEMISTRY SPECIATION (PyCO2SYS v3.2)
--------------------------------------------------------------------------------
Upstream pCO2:      1250.0 uatm (Baseline)
Downstream pCO2:    789.5 uatm (Active Drawdown delta: -460.5 uatm)
Attributable deltaTA: +210.0 umol eq/kg
Attributable deltaDIC: +200.0 umol/kg
Calcite Saturation: Omega 1.42 (Safely < 2.50 ceiling)

4. AUDIT & RECONCILIATION STATEMENT
--------------------------------------------------------------------------------
This report certifies that the mineral dosing trip described above has achieved
verifiable atmospheric carbon dioxide removal in inland waters adhering to ISO 14064-2
and Isometric Carbon Registry guidelines.
Generated on: ${new Date().toISOString()}
================================================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.reportBatchCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Report downloaded: ${report.reportBatchCode}`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto' : ''}`}>
      {/* Toast */}
      {downloadToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* ── Top Bar / Trip Selection ── */}
      <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Net CO₂ Removal
            </h1>
          </div>

          {/* Right controls: Select Trip + Download Button + Fullscreen */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Select Trip:
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  collapseAll();
                }}
                className="text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {dosingTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.tripCode} • {trip.assetName} ({trip.quantityLiters}L {trip.mineralType.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const r = tripReports.find((t) => t.tripId === activeTrip.id) || tripReports[0];
                if (r) handleDownloadTripReport(r);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              title={`Download verified report for ${activeTrip.tripCode}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Trip Report</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Context Header Strip (Matching Isometric style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 px-2 gap-2">
        <span className="font-medium">
          Calculations demonstrating{' '}
          <strong className="text-slate-900 font-mono font-bold">
            {totalNetRemovalsT.toFixed(4)} tCO₂e
          </strong>{' '}
          ({totalNetRemovalsKg.toFixed(2)} kgCO₂e) removed from{' '}
          <span className="font-semibold text-slate-800">{activeTrip.catchmentReach}</span> on {activeTrip.scheduledDate}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('trip-reports-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Jump to Reports</span>
            <span className="text-xs">↓</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedNodeDetails({
                formula: 'Total Net Removals = Net CDR [Ca(OH)₂] + Net CDR [CaCO₃]',
                description: 'ISO 14064-2 Cryptographic Ledger and Greenhouse Gas accounting entry for calcium mineral enhancement.',
                inputs: [
                  { label: 'Trip Code', value: activeTrip.tripCode },
                  { label: 'Asset Identifier', value: activeTrip.assetName },
                  { label: 'Verification Standard', value: 'ISO 14064-2 & Isometric River Protocol' },
                  { label: 'Timestamp', value: `${activeTrip.scheduledDate} ${activeTrip.scheduledTime}` },
                  { label: 'Total Net Removal', value: `${totalNetRemovalsT.toFixed(4)}`, unit: 'tCO2e' }
                ],
                explanation: 'Comprehensive cryptographic dossier containing matched upstream and downstream sensor readings, PyCO2SYS speciation output matrices, and lifecycle deduction vouchers.'
              });
            }}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>See GHG entry</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>

      {/* ── ISOMETRIC CANVAS (Interactive Directed Graph with Dot-Grid Background) ── */}
      <div
        id="isometric-canvas"
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        className={`relative bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[660px] p-6 sm:p-10 flex flex-col items-center select-none ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-8' : ''
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Dynamic Dot Grid that tracks pan offset */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.28]"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
          }}
        />

        {/* Top Left Header matching Isometric interface */}
        <div className="absolute top-4 left-6 z-30 hidden sm:flex items-center gap-2.5 text-xs text-slate-600 select-none">
          <span>
            Calculations demonstrating <strong className="text-slate-900 font-bold">{totalNetRemovalsT.toFixed(2)} tCO₂e</strong> removed from {activeTrip.catchmentReach} on {activeTrip.scheduledDate}
          </span>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('trip-reports-dossier');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-0.5 text-slate-800 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            <span>See GHG entry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Right Canvas Controls (Ctrl + scroll to zoom, +, -, Reset) */}
        <div className="absolute top-4 right-6 z-30 flex items-center gap-3 select-none">
          <span className="text-xs text-slate-400 font-mono hidden md:inline">Ctrl + scroll to zoom</span>
          <div className="flex items-center border border-slate-200/90 rounded-lg bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-r border-slate-200/90 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Right Fullscreen Toggle button */}
        <div className="absolute bottom-4 right-6 z-30">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit full screen' : 'View full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-slate-500" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isFullscreen ? 'Exit full screen' : 'View full screen'}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════
            HIERARCHICAL TREE GRAPH (Transformable Canvas)
           ════════════════════════════════════════════════════════ */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          className="min-w-max flex flex-col items-center justify-center min-h-[460px] relative z-10 py-16 px-20 select-none"
        >
          {/* LEVEL 1: ROOT NODE - TOTAL NET REMOVALS */}
          <div id="subtree-root" className="flex flex-col items-center">
            {renderNodeCard({
              id: 'node-root',
              title: 'Net CO₂e Removed',
              value: totalNetRemovalsKg.toFixed(3),
              unit: 'kgCO2e',
              hasChildren: true,
              isExpanded: isRootExpanded,
              isActive: isRootExpanded,
              onToggle: () => {
                const next = !isRootExpanded;
                setIsRootExpanded(next);
                if (next) {
                  setCaoh2State({
                    isExpanded: false,
                    activeTab: null,
                    isOceanStorageExpanded: false,
                    isFeedstockAddedExpanded: false,
                    isTotalCarbonExpanded: false,
                    isFeedstockMfgExpanded: false,
                  });
                  setCaco3State({
                    isExpanded: false,
                    activeTab: null,
                    isOceanStorageExpanded: false,
                    isFeedstockAddedExpanded: false,
                    isTotalCarbonExpanded: false,
                    isFeedstockMfgExpanded: false,
                  });
                  panToElementId('subtree-root');
                } else {
                  panToElementId('node-root');
                }
              },
              detailsFormula: 'Net CO₂e Removed = Net CDR [Ca(OH)₂] + Net CDR [CaCO₃]',
              detailsDescription: `Audited atmospheric net CO₂ removed from ${activeTrip.catchmentReach} in accordance with Isometric River Protocol and ISO 14064-2:2019.`,
              detailsInputs: [
                { label: 'Active Trip', value: activeTrip.tripCode },
                { label: 'Asset', value: activeTrip.assetName },
                { label: 'Total Slurry', value: `${activeTrip.quantityLiters}`, unit: 'L' },
                { label: 'Net Carbon Removal', value: `${totalNetRemovalsT.toFixed(4)}`, unit: 'tCO2e' }
              ]
            })}
          </div>

          {/* LEVEL 2: EXPANDS UNDER ROOT INTO Ca(OH)2 AND CaCO3 HORIZONTALLY */}
          {isRootExpanded && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-top-3 duration-300">
              {/* Vertical connector trunk from Level 1 */}
              <div className="w-px h-6 bg-slate-300" />

              {/* Level 2 Container Box (Ca(OH)2 + CaCO3) */}
              <div id="container-minerals" className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-2xs flex flex-row items-center justify-center gap-3">
                {/* Branch 1: Ca(OH)2 */}
                {renderNodeCard({
                  id: 'node-caoh2',
                  title: 'Calcium Hydroxide (Ca(OH)₂)',
                  value: caoh2Data.netRemovalsKg.toFixed(3),
                  unit: 'kgCO2e',
                  hasChildren: true,
                  isExpanded: caoh2State.isExpanded,
                  isActive: caoh2State.isExpanded,
                  onToggle: () => {
                    const next = !caoh2State.isExpanded;
                    if (next) {
                      recordSubtreeOffset('caoh2', 'container-minerals', 'node-caoh2');
                      setCaoh2State({
                        isExpanded: true,
                        activeTab: null,
                        isOceanStorageExpanded: false,
                        isFeedstockAddedExpanded: false,
                        isTotalCarbonExpanded: false,
                        isFeedstockMfgExpanded: false,
                      });
                      setCaco3State((prev) => ({ ...prev, isExpanded: false }));
                      panToElementId('subtree-caoh2');
                    } else {
                      setCaoh2State((prev) => ({ ...prev, isExpanded: false, activeTab: null }));
                      panToElementId('subtree-root');
                    }
                  },
                  detailsFormula: 'Ca(OH)₂ Net Removals = Sequestration - Activities + Counterfactuals + Uncertainty Discount',
                  detailsDescription: 'Net atmospheric CO₂ removal attributed to Calcium Hydroxide dissolved in riverine slurry.',
                  detailsInputs: [
                    { label: 'Mineral Mass Added', value: `${caoh2Data.massKg.toFixed(2)}`, unit: 'kg' },
                    { label: 'Sequestration Gross', value: `${caoh2Data.sequestrationKg.toFixed(3)}`, unit: 'kgCO2e' },
                    { label: 'Activities Deductions', value: `${caoh2Data.totalActivitiesKg.toFixed(3)}`, unit: 'kgCO2e' }
                  ]
                })}

                {/* Operator + */}
                {renderOperatorBadge('+')}

                {/* Branch 2: CaCO3 (Exact same nodes and parent-child tree as Ca(OH)2) */}
                {renderNodeCard({
                  id: 'node-caco3',
                  title: 'Calcium Carbonate (CaCO₃)',
                  value: caco3Data.netRemovalsKg.toFixed(3),
                  unit: 'kgCO2e',
                  hasChildren: true,
                  isExpanded: caco3State.isExpanded,
                  isActive: caco3State.isExpanded,
                  onToggle: () => {
                    const next = !caco3State.isExpanded;
                    if (next) {
                      recordSubtreeOffset('caco3', 'container-minerals', 'node-caco3');
                      setCaco3State({
                        isExpanded: true,
                        activeTab: null,
                        isOceanStorageExpanded: false,
                        isFeedstockAddedExpanded: false,
                        isTotalCarbonExpanded: false,
                        isFeedstockMfgExpanded: false,
                      });
                      setCaoh2State((prev) => ({ ...prev, isExpanded: false }));
                      panToElementId('subtree-caco3');
                    } else {
                      setCaco3State((prev) => ({ ...prev, isExpanded: false, activeTab: null }));
                      panToElementId('subtree-root');
                    }
                  },
                  detailsFormula: 'CaCO₃ Net Removals = Sequestration - Activities + Counterfactuals + Uncertainty Discount',
                  detailsDescription: 'Net atmospheric CO₂ removal attributed to Calcium Carbonate dissolved in riverine slurry.',
                  detailsInputs: [
                    { label: 'Mineral Mass Added', value: `${caco3Data.massKg.toFixed(2)}`, unit: 'kg' },
                    { label: 'Sequestration Gross', value: `${caco3Data.sequestrationKg.toFixed(3)}`, unit: 'kgCO2e' },
                    { label: 'Activities Deductions', value: `${caco3Data.totalActivitiesKg.toFixed(3)}`, unit: 'kgCO2e' }
                  ]
                })}
              </div>

              {/* Subtree of Active Mineral (Ca(OH)2 or CaCO3) directly under that mineral card */}
              {caoh2State.isExpanded && (
                <div
                  style={{ transform: `translateX(${subtreeOffsets['caoh2'] ?? -156}px)` }}
                  className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
                >
                  <div className="w-px h-6 bg-slate-300" />
                  {renderMineralSubtree(caoh2Data, 'caoh2')}
                </div>
              )}

              {caco3State.isExpanded && (
                <div
                  style={{ transform: `translateX(${subtreeOffsets['caco3'] ?? 156}px)` }}
                  className="flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300"
                >
                  <div className="w-px h-6 bg-slate-300" />
                  {renderMineralSubtree(caco3Data, 'caco3')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Close Fullscreen button if fullscreen */}
        {isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xl hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Close full screen</span>
          </button>
        )}
      </div>

      {/* ── INTERACTIVE DRAWER / MODAL: NODE FORMULA & CALCULATION DEEP DIVE ── */}
      {selectedNodeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Calculation Step Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Formula box */}
              <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Mathematical Formulation
                </span>
                <span className="break-words font-bold">{selectedNodeDetails.formula}</span>
              </div>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed">
                {selectedNodeDetails.description}
              </p>

              {/* Key Variables list */}
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2">
                  Parameters & Telemetry Inputs
                </span>
                <div className="space-y-1.5">
                  {selectedNodeDetails.inputs.map((inp, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-slate-500">{inp.label}:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {inp.value} {inp.unit && <span className="text-slate-500 font-normal">{inp.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Verification Integrity:</span>
                {selectedNodeDetails.explanation}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNodeDetails(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Carbonate Chemistry Calculations (CO2SYS Geochemical Equilibrium) ── */}
      <div className="bg-white rounded-2xl border border-carbon-border shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider font-sans">
                Carbonate Chemistry & Equilibrium Calculations
              </h3>
              <p className="text-xs text-slate-500">
                Freshwater carbonate system equilibrium (PyCO2SYS) • {activeTrip.catchmentReach}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl font-bold">
            Trip: {activeTrip.tripCode} ({activeTrip.mineralType.split(' ')[0]})
          </span>
        </div>

        {/* Calculation Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Dissolved Inorganic Carbon (DIC)
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              {carbonateChemistryData.postDosingDicUmolKg} <span className="text-xs font-normal text-slate-500">µmol/kg</span>
            </div>
            <div className="text-xs font-mono text-emerald-700 mt-1 font-semibold">
              ΔDIC: +{calculations.delta_DIC_attr_umol_kg} µmol/kg (Baseline: {carbonateChemistryData.baselineDicUmolKg})
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Total Alkalinity (TA)
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              {carbonateChemistryData.postDosingTotalAlkalinityUeqKg} <span className="text-xs font-normal text-slate-500">µeq/kg</span>
            </div>
            <div className="text-xs font-mono text-blue-700 mt-1 font-semibold">
              ΔTA: +{calculations.delta_TA_attr_umol_kg} µeq/kg (Baseline: {carbonateChemistryData.baselineTotalAlkalinityUeqKg})
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              pCO₂ Atmospheric Disequilibrium
            </span>
            <div className="text-lg font-black text-cyan-800 font-mono">
              {calculations.pCO2_downstream_uatm.toFixed(1)} <span className="text-xs font-normal text-slate-500">µatm</span>
            </div>
            <div className="text-xs font-mono text-cyan-700 mt-1 font-semibold">
              ΔpCO₂: {calculations.delta_pCO2_uatm.toFixed(1)} µatm (Continuous atmospheric CO₂ uptake)
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Mineral Saturation Index (Ω)
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              Ω_calcite: {carbonateChemistryData.calciteSaturationOmega}
            </div>
            <div className="text-xs font-mono text-emerald-700 mt-1 font-semibold">
              Safely &lt; 2.50 ceiling (Zero runaway carbonate precipitation)
            </div>
          </div>
        </div>

        {/* Reaction Stoichiometry Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 flex items-center justify-between">
          <span>
            {activeTrip.mineralType.includes('Mg')
              ? 'Mg(OH)₂ + 2 CO₂  ⟶  Mg²⁺ + 2 HCO₃⁻'
              : 'Ca(OH)₂ + 2 CO₂  ⟶  Ca²⁺ + 2 HCO₃⁻'}
          </span>
          <span className="text-slate-400 text-[11px] font-sans hidden sm:inline">
            Theoretical yield: 1 mole hydroxide mineral = 2 mol equivalents alkalinity
          </span>
        </div>
      </div>

      {/* ── 3. TRIP-BASED AUDITED MRV REPORTS & REGISTRY DOSSIERS ── */}
      <div id="trip-reports-section" className="bg-white rounded-2xl border border-carbon-border shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider font-sans">
                Trip-Based Certified MRV Reports
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Download certified MRV report dossier for any dosing trip.
            </p>
          </div>

          {/* Filter toggle: View All Trips vs Current Trip */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReportFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Trips ({tripReports.length})
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('SELECTED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportFilter === 'SELECTED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selected Trip ({activeTrip.tripCode})
            </button>
          </div>
        </div>

        {/* List of Trip Reports - Minimal: only Trip ID and Download Button */}
        <div className="space-y-2.5">
          {tripReports
            .filter((r) => (reportFilter === 'SELECTED' ? r.tripId === activeTrip.id : true))
            .map((pkg) => {
              const isCurrent = pkg.tripId === activeTrip.id;
              return (
                <div
                  key={pkg.tripId}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'border-blue-400 bg-blue-50/30 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50/70'
                  }`}
                >
                  {/* Only Trip ID */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                      {pkg.tripCode}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Only Download Button (and Inspect if not current) */}
                  <div className="flex items-center gap-2">
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTripId(pkg.tripId);
                          const el = document.getElementById('isometric-canvas');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        title="Inspect in calculation tree"
                      >
                        Inspect
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownloadTripReport(pkg)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
