import React, { useState } from 'react';
import {
  Boxes,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Factory,
  Truck,
  Check,
  Sparkles,
  FlaskConical,
  Trash2,
  Upload,
  X,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Leaf,
  Plus,
  RefreshCw,
  Tag,
  ChevronRight
} from 'lucide-react';
import { useSlurryDosing } from '../../../context/SlurryDosingContext';

// --- TYPES ---

export interface RegisteredBatch {
  id: string;
  mineralType: string;
  createdAt: string;
  status: 'Registered' | 'In Progress' | 'Complete';
}

export interface TankBatchConstituent {
  batchId: string;
  mineralType: string;
  mineralMassKg: number;
  waterQuantityLiters: number;
  slurryVolumeLiters: number;
  supplier: string;
  origin: string;
  dateAdded: string;
  status: string;
  caco3Pct?: number;
  caoh2Pct?: number;
  totalCarbonPct?: number;
}

export interface TankStorageData {
  id: 'T001' | 'T002';
  name: string;
  capacityLiters: number;
  currentVolumeLiters: number;
  densityKgPerL: number;
  ph: number;
  motorRpm: number;
  status: 'Ready' | 'Mixing' | 'Standby' | 'Low';
  batches: TankBatchConstituent[];
}

export interface MineralBatchFormState {
  // Phase 1: Mineral Sourcing
  batchNumber: string;
  mineralType: string;
  supplier: string;
  quantityKg: number | '';
  originLat: number | '';
  originLng: number | '';
  origin?: string;
  sourcingDate: string;
  sourcingEvidence: string;

  // Phase 2: Mineral Screening (qXRD & TC Tests)
  caco3Pct: number | '';
  caoh2Pct: number | '';
  totalCarbonPct: number | '';
  purityPct: number | '';
  grainSizeMicrons: number | '';
  safetyStatus: string;
  screeningEvidence: string;

  // Phase 3: Transportation
  sourceLat: number | '';
  sourceLng: number | '';
  destLat: number | '';
  destLng: number | '';
  distanceKm: number | '';
  vehicleNumber: string;
  mileage: number | '';
  fuelType: string;
  emissionFactor: number | '';
  transportEvidence: string;

  // Phase 4: Slurry Preparation
  mineralMassKg: number | '';
  waterQuantityLiters: number | '';
  selectedTankId: 'T001' | 'T002' | '';
}

// --- INITIAL DATA ---

const INITIAL_REGISTERED_BATCHES: RegisteredBatch[] = [
  { id: 'MB-2026-001', mineralType: 'Magnesium Hydroxide (Mg(OH)₂)', createdAt: '28 Oct 2026', status: 'Complete' },
  { id: 'MB-2026-002', mineralType: 'Calcium Carbonate (CaCO₃)', createdAt: '30 Oct 2026', status: 'Complete' },
  { id: 'MB-2026-003', mineralType: 'Calcium Hydroxide (Ca(OH)₂)', createdAt: '31 Oct 2026', status: 'Complete' },
];

const INITIAL_TANKS: TankStorageData[] = [
  {
    id: 'T001',
    name: 'Mixer Tank T001',
    capacityLiters: 200,
    currentVolumeLiters: 150,
    densityKgPerL: 1.36,
    ph: 9.6,
    motorRpm: 120,
    status: 'Ready',
    batches: [
      {
        batchId: 'MB-2026-001',
        mineralType: 'Magnesium Hydroxide (Mg(OH)₂)',
        mineralMassKg: 50,
        waterQuantityLiters: 60,
        slurryVolumeLiters: 80,
        supplier: 'Coromandel Coastal Marine Reagents',
        origin: 'Salem Coastal Processing, TN',
        dateAdded: '28 Oct 2026, 09:15',
        status: 'MRV Certified'
      },
      {
        batchId: 'MB-2026-002',
        mineralType: 'Calcium Carbonate (CaCO₃)',
        mineralMassKg: 40,
        waterQuantityLiters: 50,
        slurryVolumeLiters: 70,
        supplier: 'Andhra Mineral Corporation',
        origin: 'Kadapa Sourcing Mine, AP',
        dateAdded: '30 Oct 2026, 14:40',
        status: 'MRV Certified'
      }
    ]
  },
  {
    id: 'T002',
    name: 'Mixer Tank T002',
    capacityLiters: 200,
    currentVolumeLiters: 100,
    densityKgPerL: 1.32,
    ph: 9.4,
    motorRpm: 120,
    status: 'Ready',
    batches: [
      {
        batchId: 'MB-2026-003',
        mineralType: 'Calcium Hydroxide (Ca(OH)₂)',
        mineralMassKg: 55,
        waterQuantityLiters: 65,
        slurryVolumeLiters: 100,
        supplier: 'Deccan GeoMinerals Ltd',
        origin: 'Visakhapatnam Quarry Reach, AP',
        dateAdded: '31 Oct 2026, 11:20',
        status: 'MRV Certified'
      }
    ]
  }
];

// --- HELPERS ---

const generateBatchId = (existing: RegisteredBatch[]): string => {
  const year = 2026;
  const nums = existing.map((b) => parseInt(b.id.split('-')[2]) || 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `MB-${year}-${String(next).padStart(3, '0')}`;
};

const MINERAL_TYPES = [
  'Magnesium Hydroxide (Mg(OH)₂)',
  'Calcium Carbonate (CaCO₃)',
  'Calcium Hydroxide (Ca(OH)₂)',
  'Calcium Carbide Residue (CCR)',
];

const MINERAL_TYPE_COLORS: Record<string, string> = {
  'Magnesium Hydroxide (Mg(OH)₂)': 'bg-blue-50 text-blue-700 border-blue-200',
  'Calcium Carbonate (CaCO₃)': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Calcium Hydroxide (Ca(OH)₂)': 'bg-amber-50 text-amber-700 border-amber-200',
  'Calcium Carbide Residue (CCR)': 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_COLORS: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Registered: 'bg-slate-100 text-slate-700',
};

// ============================================================
// COMPONENT
// ============================================================
export const MineralDosingTab: React.FC = () => {
  // ── Batch Registry ──────────────────────────────────────────
  const [registeredBatches, setRegisteredBatches] = useState<RegisteredBatch[]>(INITIAL_REGISTERED_BATCHES);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [newBatchId, setNewBatchId] = useState('');
  const [newBatchMineralType, setNewBatchMineralType] = useState('');

  // ── Wizard Phase ─────────────────────────────────────────────
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);

  // ── Shared Context ───────────────────────────────────────────
  const { tanks, slurryEventsHistory, createSlurryBatch, flushTank } = useSlurryDosing();
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'BATCH_CREATED' | 'TRIP_DISPATCH' | 'TANK_FLUSH'>('ALL');

  // ── Toast ────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Wizard Form ──────────────────────────────────────────────
  const emptyForm: MineralBatchFormState = {
    batchNumber: '',
    mineralType: '',
    supplier: '',
    quantityKg: '',
    originLat: '',
    originLng: '',
    origin: '',
    sourcingDate: '',
    sourcingEvidence: '',
    caco3Pct: '',
    caoh2Pct: '',
    totalCarbonPct: '',
    purityPct: '',
    grainSizeMicrons: '',
    safetyStatus: '',
    screeningEvidence: '',
    sourceLat: '',
    sourceLng: '',
    destLat: '',
    destLng: '',
    distanceKm: '',
    vehicleNumber: '',
    mileage: '',
    fuelType: '',
    emissionFactor: '',
    transportEvidence: '',
    mineralMassKg: '',
    waterQuantityLiters: '',
    selectedTankId: ''
  };

  const [form, setForm] = useState<MineralBatchFormState>(emptyForm);

  // ── Derived / Calculated values ──────────────────────────────
  const mineralMass = Number(form.mineralMassKg) || 0;
  const waterLiters = Number(form.waterQuantityLiters) || 0;
  const calculatedSlurryVolume = mineralMass > 0 || waterLiters > 0
    ? Math.round(waterLiters + mineralMass / 2.65) : 0;
  const calculatedConcentration = calculatedSlurryVolume > 0
    ? Math.round((mineralMass * 1000) / calculatedSlurryVolume) : 0;
  const calculatedDensity = calculatedSlurryVolume > 0
    ? ((mineralMass + waterLiters) / calculatedSlurryVolume).toFixed(2) : '0.00';

  const selectedTank = form.selectedTankId ? tanks.find((t) => t.id === form.selectedTankId) : null;
  const tankAvailableCapacity = selectedTank ? selectedTank.capacityLiters - selectedTank.currentVolumeLiters : 0;
  const willOverflow = selectedTank ? calculatedSlurryVolume > tankAvailableCapacity : false;

  const totalSlurryLiters = tanks.reduce((acc, t) => acc + t.currentVolumeLiters, 0);
  const totalCapacityLiters = tanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const overallPercentage = Math.round((totalSlurryLiters / totalCapacityLiters) * 100);

  // ── Phase Validation ─────────────────────────────────────────
  const isPhase1Valid =
    form.batchNumber.trim() !== '' &&
    form.mineralType.trim() !== '' &&
    form.supplier.trim() !== '' &&
    Number(form.quantityKg) > 0 &&
    form.originLat !== '' &&
    form.originLng !== '' &&
    form.sourcingDate.trim() !== '' &&
    form.sourcingEvidence.trim() !== '';

  const isPhase2Valid =
    form.caco3Pct !== '' && Number(form.caco3Pct) >= 0 &&
    form.caoh2Pct !== '' && Number(form.caoh2Pct) >= 0 &&
    form.totalCarbonPct !== '' && Number(form.totalCarbonPct) >= 0 &&
    Number(form.grainSizeMicrons) > 0 &&
    form.safetyStatus.trim() !== '' &&
    form.screeningEvidence.trim() !== '';

  const isPhase3Valid =
    form.sourceLat !== '' &&
    form.sourceLng !== '' &&
    form.destLat !== '' &&
    form.destLng !== '' &&
    Number(form.distanceKm) > 0 &&
    form.vehicleNumber.trim() !== '' &&
    Number(form.mileage) > 0 &&
    form.fuelType.trim() !== '' &&
    Number(form.emissionFactor) > 0 &&
    form.transportEvidence.trim() !== '';

  const isPhase4Valid =
    mineralMass > 0 &&
    waterLiters > 0 &&
    (form.selectedTankId === 'T001' || form.selectedTankId === 'T002') &&
    !willOverflow;

  // ── Batch Selection in Phase 1 ───────────────────────────────
  const handleBatchSelect = (batchId: string) => {
    const batch = registeredBatches.find((b) => b.id === batchId);
    if (batch) {
      setForm((prev) => ({
        ...prev,
        batchNumber: batch.id,
        mineralType: batch.mineralType,
      }));
    } else {
      setForm((prev) => ({ ...prev, batchNumber: '', mineralType: '' }));
    }
  };

  // ── Phase Navigation ─────────────────────────────────────────
  const handleNextPhase = () => {
    if (currentPhase === 1 && isPhase1Valid) {
      setForm((prev) => ({
        ...prev,
        mineralMassKg: prev.mineralMassKg !== '' ? prev.mineralMassKg : prev.quantityKg,
        sourceLat: prev.sourceLat !== '' ? prev.sourceLat : prev.originLat,
        sourceLng: prev.sourceLng !== '' ? prev.sourceLng : prev.originLng,
        origin: prev.originLat !== '' && prev.originLng !== ''
          ? `${prev.originLat}, ${prev.originLng}` : prev.origin
      }));
      setCurrentPhase(2);
    } else if (currentPhase === 2 && isPhase2Valid) {
      setCurrentPhase(3);
    } else if (currentPhase === 3 && isPhase3Valid) {
      setCurrentPhase(4);
    }
  };

  const handleBackPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // ── Create Batch (Phase 4 Final) ─────────────────────────────
  const handleCreateBatch = () => {
    if (!isPhase4Valid || !selectedTank) return;
    const newBatchConstituent: TankBatchConstituent = {
      batchId: form.batchNumber,
      mineralType: form.mineralType,
      mineralMassKg: mineralMass,
      waterQuantityLiters: waterLiters,
      slurryVolumeLiters: calculatedSlurryVolume,
      supplier: form.supplier,
      origin: form.originLat !== '' && form.originLng !== ''
        ? `${form.originLat}, ${form.originLng}` : 'GPS Verified Location',
      dateAdded: 'Today, Just now',
      status: 'MRV Certified',
      caco3Pct: Number(form.caco3Pct) || undefined,
      caoh2Pct: Number(form.caoh2Pct) || undefined,
      totalCarbonPct: Number(form.totalCarbonPct) || undefined,
    };
    createSlurryBatch(newBatchConstituent, form.selectedTankId as 'T001' | 'T002');
    // Update registered batch status to Complete
    setRegisteredBatches((prev) =>
      prev.map((b) => b.id === form.batchNumber ? { ...b, status: 'Complete' } : b)
    );
    showToast(
      `Batch ${form.batchNumber} created successfully! ${calculatedSlurryVolume}L slurry added to ${selectedTank.name}.`
    );
    setForm(emptyForm);
    setCurrentPhase(1);
  };

  // ── Flush Tank ───────────────────────────────────────────────
  const handleFlushTank = (tankId: 'T001' | 'T002') => {
    flushTank(tankId);
    showToast(`${tankId === 'T001' ? 'Mixer Tank T001' : 'Mixer Tank T002'} flushed and ready for new batches.`);
  };

  // ── Create Batch Modal handlers ──────────────────────────────
  const handleOpenCreateBatchModal = () => {
    setNewBatchId(generateBatchId(registeredBatches));
    setNewBatchMineralType('');
    setShowCreateBatchModal(true);
  };

  const handleRegisterNewBatch = () => {
    if (!newBatchId.trim() || !newBatchMineralType) return;
    const duplicate = registeredBatches.find((b) => b.id === newBatchId.trim());
    if (duplicate) {
      showToast(`Batch ID ${newBatchId.trim()} already exists. Please use a different ID.`);
      return;
    }
    const created: RegisteredBatch = {
      id: newBatchId.trim(),
      mineralType: newBatchMineralType,
      createdAt: 'Today',
      status: 'Registered',
    };
    setRegisteredBatches((prev) => [created, ...prev]);
    setShowCreateBatchModal(false);
    showToast(`Batch ${created.id} registered. Select it in Phase 1 to begin the lifecycle workflow.`);
  };

  // ── Battery fill colour helper ───────────────────────────────
  const getBatteryFillColor = (pct: number) => {
    if (pct >= 85) return 'from-emerald-500 to-teal-500';
    if (pct >= 35) return 'from-blue-500 to-cyan-500';
    if (pct > 0) return 'from-amber-500 to-yellow-500';
    return 'from-slate-400 to-slate-500';
  };

  // ── Batch ID Banner (shown at top of each phase) ─────────────
  const BatchIdBanner = () =>
    form.batchNumber ? (
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200/80 rounded-xl mb-5">
        <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="text-xs font-bold text-blue-900">Batch:</span>
        <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
          {form.batchNumber}
        </span>
        <span className="text-blue-300 text-xs">|</span>
        <span className="text-xs text-blue-800 font-semibold">{form.mineralType}</span>
        <span className="ml-auto text-[11px] text-blue-500 hidden sm:inline">
          All 4 phases apply to this batch
        </span>
      </div>
    ) : null;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" />
            Slurry Preparation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            4-Phase chain-of-custody: Mineral Sourcing → Mineral Screening → Transportation → Slurry Preparation, and 1,000L Storage Tanks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-xs self-start md:self-auto">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Slurry Stored</div>
            <div className="text-sm font-black text-slate-800">
              {totalSlurryLiters} L{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {totalCapacityLiters} L ({overallPercentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION A: BATCH REGISTRY (Create Batch + List)
         ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Registry Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              Batch Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Register new mineral batches and track them through the 4-phase lifecycle workflow below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateBatchModal}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        </div>

        {/* Batch List */}
        {registeredBatches.length === 0 ? (
          <div className="px-6 py-10 text-center text-xs text-slate-400">
            <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-500">No batches registered yet.</p>
            <p className="mt-0.5">Click "Create Batch" to register your first mineral batch.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {registeredBatches.map((batch) => {
              const colorClass = MINERAL_TYPE_COLORS[batch.mineralType] ?? 'bg-slate-50 text-slate-700 border-slate-200';
              const statusColor = STATUS_COLORS[batch.status] ?? 'bg-slate-100 text-slate-600';
              return (
                <div
                  key={batch.id}
                  className="px-5 py-3.5 flex flex-wrap sm:flex-nowrap items-center gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Batch ID */}
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                    {batch.id}
                  </span>

                  {/* Mineral Type */}
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}
                  >
                    {batch.mineralType}
                  </span>

                  {/* Status badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {batch.status}
                  </span>

                  {/* Created date */}
                  <span className="text-[11px] text-slate-400 font-mono ml-auto shrink-0">
                    {batch.createdAt}
                  </span>

                  {/* Select arrow hint */}
                  <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 shrink-0">
                    <ChevronRight className="w-3 h-3" />
                    Select in Phase 1
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION B: 4-PHASE LIFECYCLE WIZARD
         ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Wizard Stepper Header */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Guided Lifecycle Workflow
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Phase {currentPhase} of 4:{' '}
                {currentPhase === 1 ? 'Mineral Sourcing'
                  : currentPhase === 2 ? 'Mineral Screening'
                  : currentPhase === 3 ? 'Transportation'
                  : 'Slurry Preparation'}
              </h2>
            </div>
            {/* Batch ID pill in stepper header */}
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {form.batchNumber ? `Batch: ${form.batchNumber}` : 'No Batch Selected'}
            </span>
          </div>

          {/* Step progress bar */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: '1. Sourcing', icon: Factory },
              { num: 2, label: '2. Screening', icon: ShieldCheck },
              { num: 3, label: '3. Transport', icon: Truck },
              { num: 4, label: '4. Slurry Prep', icon: Droplets }
            ].map((step) => {
              const Icon = step.icon;
              const isDone = currentPhase > step.num;
              const isCurrent = currentPhase === step.num;
              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-xs font-semibold ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCurrent
                        ? 'bg-white text-blue-600'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                  </div>
                  <span className="truncate hidden sm:inline">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Wizard Body ── */}
        <div className="p-5 sm:p-7">

          {/* ========================================================
              PHASE 1: MINERAL SOURCING
             ======================================================== */}
          {currentPhase === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Batch ID Banner */}
              <BatchIdBanner />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phase 1: Mineral Sourcing Registration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a registered batch, fill in supplier details, quarry origin coordinates, and attach weight evidence.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 1 / 4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Batch Selector (replaces text input) */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Mineral Batch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.batchNumber}
                    onChange={(e) => handleBatchSelect(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">— Select a registered batch —</option>
                    {registeredBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} · {b.mineralType}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Only batches created in the registry above appear here.
                  </p>
                </div>

                {/* 2. Mineral Type — read-only display (auto-filled from batch) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mineral Feedstock Type
                  </label>
                  {form.mineralType ? (
                    <div
                      className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border ${
                        MINERAL_TYPE_COLORS[form.mineralType] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {form.mineralType}
                    </div>
                  ) : (
                    <div className="w-full text-xs text-slate-400 italic px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      Auto-filled on batch selection
                    </div>
                  )}
                </div>

                {/* 3. Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approved Supplier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. Deccan Minerals Corp"
                  />
                </div>

                {/* 4. Quantity (kg) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Quantity (kg) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={form.quantityKg}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setForm({ ...form, quantityKg: val, mineralMassKg: val });
                      }}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-12 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 280"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>

                {/* 5. Sourcing Origin Latitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sourcing Origin Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.originLat}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setForm({ ...form, originLat: val });
                    }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 11.6643"
                  />
                </div>

                {/* 6. Sourcing Origin Longitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sourcing Origin Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.originLng}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setForm({ ...form, originLng: val });
                    }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 78.1460"
                  />
                </div>

                {/* 7. Delivery / Receipt Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery / Receipt Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.sourcingDate}
                    onChange={(e) => setForm({ ...form, sourcingDate: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Sourcing Evidence Document Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Sourcing Evidence (Weighbridge Slip / Bill of Lading){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      {form.sourcingEvidence ? (
                        <div className="text-xs font-semibold text-slate-800 truncate">{form.sourcingEvidence}</div>
                      ) : (
                        <div className="text-xs text-slate-500">No document attached yet</div>
                      )}
                      <div className="text-[11px] text-slate-400">
                        Upload official weighbridge slip or bill of lading (PDF / PNG)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.sourcingEvidence ? 'Change File' : 'Upload File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setForm((prev) => ({ ...prev, sourcingEvidence: file.name }));
                        }}
                      />
                    </label>
                    {!form.sourcingEvidence && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, sourcingEvidence: 'Weighbridge_Receipt_MB001.pdf' }))}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        Sample Slip
                      </button>
                    )}
                    {form.sourcingEvidence && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, sourcingEvidence: '' }))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PHASE 2: MINERAL SCREENING
             ======================================================== */}
          {currentPhase === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Batch ID Banner */}
              <BatchIdBanner />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phase 2: Mineral Quality & Safety Screening
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record laboratory mineralogical purity (qXRD/TC tests), particle grain size (D50), safety confirmation, and test certificates.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 2 / 4
                </span>
              </div>

              {/* 1. Laboratory Assay Purity Inputs (qXRD / TC Tests) */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">
                      %
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Assay Purity Screening (qXRD / TC Tests)
                      </span>
                      <span className="text-[10.5px] text-slate-500">
                        Quantitative X-ray Diffraction (qXRD) and Total Carbon (TC) laboratory analysis
                      </span>
                    </div>
                  </div>
                  {((Number(form.caco3Pct) > 0) || (Number(form.caoh2Pct) > 0)) && (
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      Combined Active Alkalinity: {((Number(form.caco3Pct) || 0) + (Number(form.caoh2Pct) || 0)).toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* CaCO3 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CaCO₃ (%) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.caco3Pct}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            caco3Pct: val,
                            purityPct: Number(val || 0) + Number(prev.caoh2Pct || 0)
                          }));
                        }}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-10 focus:border-blue-500 outline-none transition-all shadow-xs"
                        placeholder="e.g. 82.5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">Calcium Carbonate (qXRD test)</span>
                  </div>

                  {/* Ca(OH)2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ca(OH)₂ (%) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.caoh2Pct}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            caoh2Pct: val,
                            purityPct: Number(prev.caco3Pct || 0) + Number(val || 0)
                          }));
                        }}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-10 focus:border-blue-500 outline-none transition-all shadow-xs"
                        placeholder="e.g. 14.8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">Calcium Hydroxide / Portlandite (qXRD)</span>
                  </div>

                  {/* Total Carbon (C) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Carbon (C) (%) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.totalCarbonPct}
                        onChange={(e) => setForm({ ...form, totalCarbonPct: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-10 focus:border-blue-500 outline-none transition-all shadow-xs"
                        placeholder="e.g. 9.9"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">Total Carbon Content (TC test)</span>
                  </div>
                </div>
              </div>

              {/* 2. Granulometry & Safety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grain Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grain Size D50 (µm) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={form.grainSizeMicrons}
                      onChange={(e) => setForm({ ...form, grainSizeMicrons: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-10 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 38"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">µm</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Optimal micro-milled &lt; 45µm for rapid riverine dissolution</span>
                </div>

                {/* Safety */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Safety Confirmation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.safetyStatus}
                    onChange={(e) => setForm({ ...form, safetyStatus: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select safety status...</option>
                    <option value="Yes">Yes (Certified safe & non-hazardous)</option>
                    <option value="No">No</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">Confirmed free of ecotoxic contaminants</span>
                </div>
              </div>

              {/* Screening Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratory Test Evidence (qXRD Mineralogical Assay & TC Sieve Analysis){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      {form.screeningEvidence ? (
                        <div className="text-xs font-semibold text-slate-800 truncate">{form.screeningEvidence}</div>
                      ) : (
                        <div className="text-xs text-slate-500">No test certificate attached yet</div>
                      )}
                      <div className="text-[11px] text-slate-400">Attach accredited laboratory qXRD & TC assay report (PDF)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.screeningEvidence ? 'Change File' : 'Upload Certificate'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setForm((prev) => ({ ...prev, screeningEvidence: file.name }));
                        }}
                      />
                    </label>
                    {!form.screeningEvidence && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            caco3Pct: prev.caco3Pct !== '' ? prev.caco3Pct : 82.5,
                            caoh2Pct: prev.caoh2Pct !== '' ? prev.caoh2Pct : 14.8,
                            totalCarbonPct: prev.totalCarbonPct !== '' ? prev.totalCarbonPct : 9.9,
                            purityPct: prev.purityPct !== '' ? prev.purityPct : 97.3,
                            grainSizeMicrons: prev.grainSizeMicrons !== '' ? prev.grainSizeMicrons : 38,
                            safetyStatus: prev.safetyStatus || 'Yes',
                            screeningEvidence: 'qXRD_TC_Assay_Analysis_Report.pdf',
                          }))
                        }
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        Sample qXRD/TC
                      </button>
                    )}
                    {form.screeningEvidence && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, screeningEvidence: '' }))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PHASE 3: TRANSPORTATION
             ======================================================== */}
          {currentPhase === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Batch ID Banner */}
              <BatchIdBanner />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phase 3: Logistics & Transport Recording
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track the chain-of-custody journey from quarry source to the riverine slurry preparation depot.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 3 / 4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Dispatch Source Latitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispatch Source Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number" step="any" value={form.sourceLat}
                    onChange={(e) => { const val = e.target.value === '' ? '' : Number(e.target.value); setForm({ ...form, sourceLat: val }); }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 11.6643"
                  />
                </div>

                {/* Dispatch Source Longitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispatch Source Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number" step="any" value={form.sourceLng}
                    onChange={(e) => { const val = e.target.value === '' ? '' : Number(e.target.value); setForm({ ...form, sourceLng: val }); }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 78.1460"
                  />
                </div>

                {/* Total Transit Distance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Transit Distance (km) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" min="1" value={form.distanceKm}
                      onChange={(e) => setForm({ ...form, distanceKm: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-12 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 340"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">km</span>
                  </div>
                  {Number(form.distanceKm) > 0 && (
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Est. transport CO₂ footprint: ~{Number(form.mileage) > 0 && Number(form.emissionFactor) > 0
                        ? ((Number(form.distanceKm) / Number(form.mileage)) * Number(form.emissionFactor)).toFixed(1)
                        : (Number(form.distanceKm) * 0.11).toFixed(1)} kg CO₂
                    </span>
                  )}
                </div>

                {/* Depot Destination Latitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Depot Destination Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number" step="any" value={form.destLat}
                    onChange={(e) => { const val = e.target.value === '' ? '' : Number(e.target.value); setForm({ ...form, destLat: val }); }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 16.5412"
                  />
                </div>

                {/* Depot Destination Longitude */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Depot Destination Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number" step="any" value={form.destLng}
                    onChange={(e) => { const val = e.target.value === '' ? '' : Number(e.target.value); setForm({ ...form, destLng: val }); }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 81.9125"
                  />
                </div>

                {/* Vehicle Reg. No. */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Reg. No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. AP-16-TX-8821"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fuel Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => {
                      const selected = e.target.value;
                      let defaultFactor: number | '' = '';
                      if (selected === 'Diesel') defaultFactor = 2.68;
                      else if (selected === 'Petrol') defaultFactor = 2.31;
                      else if (selected === 'CNG') defaultFactor = 2.75;
                      else if (selected === 'EV') defaultFactor = 0.45;
                      setForm({ ...form, fuelType: selected, emissionFactor: form.emissionFactor !== '' ? form.emissionFactor : defaultFactor });
                    }}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select fuel type...</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">EV</option>
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mileage <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" step="0.1" min="0.1" value={form.mileage}
                      onChange={(e) => setForm({ ...form, mileage: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-16 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 5.5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">
                      {form.fuelType === 'EV' ? 'km/kWh' : form.fuelType === 'CNG' ? 'km/kg' : 'km/L'}
                    </span>
                  </div>
                </div>

                {/* Emission Factor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emission Factor (in kg/CO₂) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" step="0.01" min="0" value={form.emissionFactor}
                      onChange={(e) => setForm({ ...form, emissionFactor: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-20 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 2.68"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">kg CO₂/unit</span>
                  </div>
                </div>
              </div>

              {/* Transport Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transportation Evidence (e-Way Bill / GPS Telematics Route Log){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      {form.transportEvidence ? (
                        <div className="text-xs font-semibold text-slate-800 truncate">{form.transportEvidence}</div>
                      ) : (
                        <div className="text-xs text-slate-500">No transport manifest attached yet</div>
                      )}
                      <div className="text-[11px] text-slate-400">Attach government e-Way bill or signed gate pass (PDF / PNG)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.transportEvidence ? 'Change File' : 'Upload Manifest'}</span>
                      <input
                        type="file" className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm((prev) => ({ ...prev, transportEvidence: file.name })); }}
                      />
                    </label>
                    {!form.transportEvidence && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, transportEvidence: 'eWay_Bill_Signed_Log.pdf' }))}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        Sample eWay Bill
                      </button>
                    )}
                    {form.transportEvidence && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, transportEvidence: '' }))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Transport Emissions Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Transport Emissions</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {Number(form.distanceKm) > 0 && Number(form.mileage) > 0 && Number(form.emissionFactor) > 0 ? (
                        <span>
                          Formula: ({form.distanceKm} km ÷ {form.mileage}{' '}
                          {form.fuelType === 'EV' ? 'km/kWh' : form.fuelType === 'CNG' ? 'km/kg' : 'km/L'}) × {form.emissionFactor} kg CO₂
                        </span>
                      ) : (
                        <span>Calculated dynamically from distance, mileage, and fuel emission factor</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-xl font-black text-slate-900 tracking-tight">
                    {Number(form.distanceKm) > 0 && Number(form.mileage) > 0 && Number(form.emissionFactor) > 0 ? (
                      <>
                        {((Number(form.distanceKm) / Number(form.mileage)) * Number(form.emissionFactor)).toFixed(2)}{' '}
                        <span className="text-xs font-semibold text-slate-500">kg CO₂</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">0.00 kg CO₂</span>
                    )}
                  </div>
                  {Number(form.distanceKm) > 0 && Number(form.mileage) > 0 && Number(form.emissionFactor) > 0 && (
                    <div className="text-[11px] font-semibold text-emerald-600">
                      ≈ {(((Number(form.distanceKm) / Number(form.mileage)) * Number(form.emissionFactor)) / 1000).toFixed(4)} t CO₂ (Scope 3)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PHASE 4: SLURRY PREPARATION & TANK SELECTION
             ======================================================== */}
          {currentPhase === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Batch ID Banner */}
              <BatchIdBanner />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phase 4: Slurry Preparation & Tank Assignment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mix mineral mass with river water, select destination Mixer Tank (T001 or T002), and update tank volume inventory.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Step 4 / 4 (Final)
                </span>
              </div>

              {/* Input Parameters & Tank Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 6 cols */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mineral Mass */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mineral Mass (kg) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number" min="1" max="200" value={form.mineralMassKg}
                          onChange={(e) => setForm({ ...form, mineralMassKg: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-12 focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. 50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">kg</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Carried over from Sourcing phase</span>
                    </div>

                    {/* Water Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Water Quantity (Liters) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number" min="1" max="200" value={form.waterQuantityLiters}
                          onChange={(e) => setForm({ ...form, waterQuantityLiters: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 pr-12 focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. 60"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">L</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Filtered local Godavari river water</span>
                    </div>
                  </div>

                  {/* Live Calculated Properties */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b border-blue-200/60 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Live Calculated Slurry Properties
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-blue-700">
                        {calculatedSlurryVolume > 0 ? `Total: ${calculatedSlurryVolume} Liters` : 'Enter quantities'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <div className="text-[10px] text-slate-500 font-medium">Slurry Volume</div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                          {calculatedSlurryVolume > 0 ? `${calculatedSlurryVolume} L` : '-- L'}
                        </div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <div className="text-[10px] text-slate-500 font-medium">Concentration</div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                          {calculatedConcentration > 0 ? `${calculatedConcentration} g/L` : '-- g/L'}
                        </div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <div className="text-[10px] text-slate-500 font-medium">Density</div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                          {calculatedSlurryVolume > 0 ? `${calculatedDensity} kg/L` : '-- kg/L'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6 cols: Tank Selector */}
                <div className="lg:col-span-6 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Destination Mixer Tank <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tanks.map((tank) => {
                      const isSelected = form.selectedTankId === tank.id;
                      const freeSpace = tank.capacityLiters - tank.currentVolumeLiters;
                      const hasRoom = calculatedSlurryVolume <= freeSpace;
                      const fillPct = Math.round((tank.currentVolumeLiters / tank.capacityLiters) * 100);
                      return (
                        <div
                          key={tank.id}
                          onClick={() => setForm({ ...form, selectedTankId: tank.id })}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full inline-block ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              {tank.name}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${fillPct >= 85 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {fillPct}% Full
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Current:</span>
                              <strong className="text-slate-800">{tank.currentVolumeLiters} / 200 L</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Available Space:</span>
                              <strong className={hasRoom ? 'text-emerald-700' : 'text-rose-600'}>{freeSpace} L</strong>
                            </div>
                          </div>
                          <div className="mt-2.5 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${fillPct}%` }} />
                          </div>
                          {calculatedSlurryVolume > 0 && !hasRoom && (
                            <div className="mt-2 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              Exceeds capacity by {calculatedSlurryVolume - freeSpace}L!
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!form.selectedTankId && (
                    <div className="p-2 bg-slate-100 rounded-lg text-[11px] text-slate-500 text-center font-medium">
                      Please click on Tank T001 or Tank T002 above to assign destination
                    </div>
                  )}
                  {willOverflow && selectedTank && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        The calculated slurry volume ({calculatedSlurryVolume}L) exceeds remaining space in {selectedTank.name}.
                        Please select the other tank or decrease water/mineral mass.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Wizard Action Footer ── */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              {currentPhase > 1 ? (
                <button
                  type="button"
                  onClick={handleBackPhase}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Phase {currentPhase - 1}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  {form.batchNumber
                    ? 'Fill all required fields to proceed to Phase 2'
                    : 'Select a batch from the registry above to begin'}
                </span>
              )}
            </div>
            <div>
              {currentPhase < 4 ? (
                <button
                  type="button"
                  disabled={
                    (currentPhase === 1 && !isPhase1Valid) ||
                    (currentPhase === 2 && !isPhase2Valid) ||
                    (currentPhase === 3 && !isPhase3Valid)
                  }
                  onClick={handleNextPhase}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                    (currentPhase === 1 && isPhase1Valid) ||
                    (currentPhase === 2 && isPhase2Valid) ||
                    (currentPhase === 3 && isPhase3Valid)
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/30 ring-2 ring-blue-400/40'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to Phase {currentPhase + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isPhase4Valid}
                  onClick={handleCreateBatch}
                  className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                    isPhase4Valid
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Batch & Load into {form.selectedTankId || 'Tank'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION C: MIXER STORAGE TANKS (T001 & T002)
         ══════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Mixer Storage Tanks (T001 & T002)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live volumetric container visualization (200L capacity each) with phone-charge style percentage indicators and internal batch constituents.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Total Inventory: <strong className="text-slate-800">{totalSlurryLiters} L</strong> / {totalCapacityLiters} L
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {tanks.map((tank) => {
            const fillPct = Math.round((tank.currentVolumeLiters / tank.capacityLiters) * 100);
            const freeLiters = tank.capacityLiters - tank.currentVolumeLiters;
            return (
              <div key={tank.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Tank Header */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-mono font-black flex items-center justify-center text-sm border border-blue-200">
                        {tank.id}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{tank.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Capacity: 200 Liters • {tank.batches.length} Batches Loaded
                        </p>
                      </div>
                    </div>
                    {/* Battery percentage badge */}
                    <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-md border border-slate-700">
                      <div className="w-6 h-3.5 border-2 border-white rounded-xs p-0.5 flex items-center relative">
                        <div
                          className={`h-full rounded-2xs bg-gradient-to-r ${getBatteryFillColor(fillPct)} transition-all duration-500`}
                          style={{ width: `${Math.max(8, fillPct)}%` }}
                        />
                        <div className="w-0.5 h-1.5 bg-white absolute -right-1 top-1/2 -translate-y-1/2 rounded-r-xs" />
                      </div>
                      <span className="font-mono font-black text-sm tracking-tight text-emerald-400">{fillPct}%</span>
                    </div>
                  </div>

                  {/* Container Graphic */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3">
                    {/* Visual Cylindrical Tank */}
                    <div className="sm:col-span-5 flex flex-col items-center">
                      <div className="w-16 h-4 bg-slate-700 rounded-t-md flex items-center justify-center shadow-xs">
                        <span className={`w-2 h-2 rounded-full ${tank.motorRpm > 0 ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'}`} />
                      </div>
                      <div className="w-28 sm:w-32 h-64 bg-slate-100 rounded-b-2xl border-4 border-slate-300 relative overflow-hidden flex flex-col justify-end shadow-inner">
                        <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between py-2 text-[8px] font-mono text-slate-400 select-none z-10">
                          <span>200L</span>
                          <span>750L</span>
                          <span>500L</span>
                          <span>250L</span>
                          <span>0L</span>
                        </div>
                        <div
                          className={`w-full bg-gradient-to-t ${getBatteryFillColor(fillPct)} transition-all duration-700 relative`}
                          style={{ height: `${fillPct}%` }}
                        >
                          {fillPct > 0 && (
                            <div className="absolute -top-1.5 inset-x-0 h-3 bg-white/40 rounded-full blur-[1px] animate-pulse" />
                          )}
                        </div>
                        <div className="absolute inset-x-2 bottom-3 bg-black/60 backdrop-blur-xs text-white text-center py-1.5 px-1 rounded-lg border border-white/20 z-10">
                          <div className="text-xs font-mono font-bold leading-none">{tank.currentVolumeLiters} L</div>
                          <div className="text-[9px] text-cyan-200 mt-0.5 leading-none">{fillPct}% Filled</div>
                        </div>
                      </div>
                    </div>

                    {/* Tank Properties */}
                    <div className="sm:col-span-7 space-y-2.5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Available Space:</span>
                          <span className="font-mono font-bold text-emerald-600">{freeLiters} Liters</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Agitator Speed:</span>
                          <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${tank.motorRpm > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {tank.motorRpm} RPM
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Slurry Density:</span>
                          <span className="font-mono font-semibold text-slate-800">{tank.densityKgPerL} kg/L</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Slurry pH:</span>
                          <span className="font-mono font-semibold text-slate-800">{tank.ph}</span>
                        </div>
                      </div>

                      {/* Fill progress bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Volumetric Capacity Fill</span>
                          <span className="font-mono">{fillPct}% (200 L max)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getBatteryFillColor(fillPct)} transition-all duration-500`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleFlushTank(tank.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                          title="Flush/drain tank to 0L for test mixing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Drain / Flush</span>
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">{tank.batches.length} batches stored</span>
                      </div>
                    </div>
                  </div>

                  {/* Batches in this Tank */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-blue-600" />
                        Batches Loaded in this Tank ({tank.batches.length})
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">Constituent Audit Log</span>
                    </div>
                    {tank.batches.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                        {tank.batches.map((batch, idx) => (
                          <div
                            key={`${batch.batchId}-${idx}`}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-start justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200">
                                  {batch.batchId}
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate">{batch.mineralType}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                Sourced from {batch.supplier} • {batch.origin}
                              </div>
                              {(batch.caco3Pct !== undefined || batch.caoh2Pct !== undefined || batch.totalCarbonPct !== undefined) && (
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {batch.caco3Pct !== undefined && (
                                    <span className="text-[9.5px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                      CaCO₃: {batch.caco3Pct}%
                                    </span>
                                  )}
                                  {batch.caoh2Pct !== undefined && (
                                    <span className="text-[9.5px] font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                                      Ca(OH)₂: {batch.caoh2Pct}%
                                    </span>
                                  )}
                                  {batch.totalCarbonPct !== undefined && (
                                    <span className="text-[9.5px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                      TC: {batch.totalCarbonPct}%
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-[10px] font-mono text-slate-400 mt-1">Added {batch.dateAdded}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-mono font-bold text-slate-900">+{batch.slurryVolumeLiters} L</div>
                              <div className="text-[10px] font-mono text-slate-500">{batch.mineralMassKg} kg mineral</div>
                              <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {batch.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                        Tank is currently empty (0 L). Prepare a batch in Phase 4 to load slurry.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION D: TANK & BATCH HISTORY
         ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Tank & Batch History</h2>
          </div>
          <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 text-xs">
            {(['ALL', 'BATCH_CREATED', 'TRIP_DISPATCH', 'TANK_FLUSH'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilter(f)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  historyFilter === f
                    ? f === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : f === 'BATCH_CREATED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : f === 'TRIP_DISPATCH'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'BATCH_CREATED' ? 'Additions' : f === 'TRIP_DISPATCH' ? 'Dispatches' : 'Flushes'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {slurryEventsHistory
            .filter((evt) => (historyFilter === 'ALL' ? true : evt.type === historyFilter))
            .map((evt) => {
              const isAddition = evt.type === 'BATCH_CREATED';
              const isDispatch = evt.type === 'TRIP_DISPATCH';
              return (
                <div
                  key={evt.id}
                  className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isAddition ? 'bg-emerald-50 text-emerald-600' : isDispatch ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isAddition ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : isDispatch ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-bold text-slate-800">
                        {isAddition ? `Batch ${evt.batchId} Loaded` : isDispatch ? `Dispatched to ${evt.assetName || 'AquaDrone'}` : 'Tank Flush'}
                      </span>
                      <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {evt.tankId}
                      </span>
                      {isDispatch && evt.batchId && (
                        <span className="font-mono text-[11px] text-slate-500">({evt.batchId})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <span className={`font-mono font-bold text-xs ${isAddition ? 'text-emerald-600' : isDispatch ? 'text-blue-600' : 'text-slate-400'}`}>
                      {evt.volumeDeltaLiters > 0 ? `+${evt.volumeDeltaLiters} L` : evt.volumeDeltaLiters < 0 ? `${evt.volumeDeltaLiters} L` : '0 L'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{evt.timestamp}</span>
                  </div>
                </div>
              );
            })}
          {slurryEventsHistory.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400 text-xs">No history events recorded yet.</div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL: CREATE NEW BATCH
         ══════════════════════════════════════════════════════════ */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Mineral Batch</h3>
                  <p className="text-xs text-slate-500">Register a batch ID and assign a mineral type</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateBatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Auto-Generated Batch ID */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Batch ID <span className="text-rose-500">*</span>
                </label>

                {/* ID Preview pill */}
                <div className="mb-3 p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Auto-Generated ID</div>
                    <div className="font-mono text-lg font-black text-emerald-400 tracking-wider">{newBatchId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewBatchId(generateBatchId(registeredBatches))}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                {/* Editable input below */}
                <input
                  type="text"
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-slate-50"
                  placeholder="e.g. MB-2026-004"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  ID is auto-generated based on existing batches. You can also edit it manually.
                </p>
              </div>

              {/* Mineral Type Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mineral Feedstock Type <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {MINERAL_TYPES.map((type) => {
                    const isSelected = newBatchMineralType === type;
                    const colorClass = isSelected
                      ? MINERAL_TYPE_COLORS[type] ?? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300';
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewBatchMineralType(type)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 font-semibold transition-all cursor-pointer flex items-center justify-between ${colorClass} ${
                          isSelected ? 'ring-2 ring-offset-1 ring-blue-400/50' : ''
                        }`}
                      >
                        <span>{type}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newBatchId.trim() || !newBatchMineralType}
                  onClick={handleRegisterNewBatch}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    newBatchId.trim() && newBatchMineralType
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Batch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SlurryPreparationTab = MineralDosingTab;
export const MineralTab = MineralDosingTab;
