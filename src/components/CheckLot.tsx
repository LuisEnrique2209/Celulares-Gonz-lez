import { useState, useEffect } from 'react';
import { Lot, CheckSlot, QualityCheck } from '../types';
import { generateId, getLotTotalQuantity, COLOR_OPTIONS, STORAGE_OPTIONS, getReviewers, addReviewer } from '../store';
import { getColorsForModel } from '../iphoneColors';

interface Props {
  lot: Lot;
  slots: CheckSlot[];
  checks: QualityCheck[];
  onSlotUpdate: (slot: CheckSlot) => void;
  onCheckComplete: (check: QualityCheck, lot: Lot) => void;
  onLotReconcile?: () => Promise<void> | void;
  onBack: () => void;
}

export default function CheckLot({ lot, slots, checks, onSlotUpdate, onCheckComplete, onLotReconcile, onBack }: Props) {
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [showTestForm, setShowTestForm] = useState(false);
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  const [batteryPercentage, setBatteryPercentage] = useState('');
  
  // Test states - Default to 'fail' to force manual review
  const [screen, setScreen] = useState<'pass' | 'fail'>('fail');
  const [camera, setCamera] = useState<'pass' | 'fail'>('fail');
  const [battery, setBattery] = useState<'pass' | 'fail'>('fail');
  const [speakers, setSpeakers] = useState<'pass' | 'fail'>('fail');
  const [microphone, setMicrophone] = useState<'pass' | 'fail'>('fail');
  const [wifi, setWifi] = useState<'pass' | 'fail'>('fail');
  const [bluetooth, setBluetooth] = useState<'pass' | 'fail'>('fail');
  const [buttons, setButtons] = useState<'pass' | 'fail'>('fail');
  const [charging, setCharging] = useState<'pass' | 'fail'>('fail');
  const [faceId, setFaceId] = useState<'pass' | 'fail'>('fail');
  const [notes, setNotes] = useState('');

  const pendingSlots = slots.filter(s => !s.checked);
  const checkedSlots = slots.filter(s => s.checked);
  const totalQuantity = getLotTotalQuantity(lot);

  // Al entrar (o al terminar el lote), conciliar con Firebase para asegurar que
  // ningún dispositivo checado se haya quedado fuera del inventario.
  useEffect(() => {
    if (onLotReconcile && pendingSlots.length === 0) {
      onLotReconcile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.length, lot.id]);

  const currentSlot = pendingSlots[currentSlotIndex];

  const resetTestForm = () => {
    setImei('');
    setColor('');
    setStorage('');
    setBatteryPercentage('');
    setScreen('fail');
    setCamera('fail');
    setBattery('fail');
    setSpeakers('fail');
    setMicrophone('fail');
    setWifi('fail');
    setBluetooth('fail');
    setButtons('fail');
    setCharging('fail');
    setFaceId('fail');
    setNotes('');
    setShowTestForm(false);
  };

  const handleSaveSlotInfo = () => {
    if (!currentSlot || !imei) return;
    const updatedSlot: CheckSlot = {
      ...currentSlot,
      imei,
      color,
      storage,
      batteryPercentage: parseInt(batteryPercentage) || undefined,
    };
    onSlotUpdate(updatedSlot);
  };

  const handleCompleteCheck = async () => {
    if (!currentSlot || !imei || !checkedBy) {
      alert('Completa el IMEI y tu nombre');
      return;
    }

    // Save reviewer to list
    if (checkedBy) {
      addReviewer(checkedBy);
    }

    // Update slot with info and mark as checked
    const updatedSlot: CheckSlot = {
      ...currentSlot,
      imei,
      color,
      storage,
      batteryPercentage: parseInt(batteryPercentage) || undefined,
      checked: true,
    };
    await onSlotUpdate(updatedSlot);

    // Create quality check
    const allPass = [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].every(t => t === 'pass');
    const anyFail = [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].some(t => t === 'fail');

    const check: QualityCheck = {
      id: generateId(),
      deviceId: '',
      slotId: currentSlot.id,
      lotId: lot.id,
      imei,
      model: currentSlot.model,
      color,
      storage,
      checkDate: new Date().toISOString().split('T')[0],
      screen,
      camera,
      battery,
      speakers,
      microphone,
      wifi,
      bluetooth,
      buttons,
      charging,
      faceId,
      batteryPercentage: parseInt(batteryPercentage) || 0,
      overallStatus: allPass ? 'approved' : anyFail ? 'rejected' : 'pending',
      notes,
      checkedBy,
    };
    onCheckComplete(check, lot);

    // Always reset to index 0 since pendingSlots recalculates after each check
    resetTestForm();
    setCurrentSlotIndex(0);
  };

  // Conteo de aprobados/rechazados basados en los chequeos de este lote
  const lotChecks = checks.filter(c => c.lotId === lot.id);
  const approvedCount = lotChecks.filter(c => c.overallStatus === 'approved').length;
  const rejectedCount = lotChecks.filter(c => c.overallStatus === 'rejected').length;

  // All done view
  if (pendingSlots.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Checar Lote: {lot.name}</h1>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Volver a Lotes</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todos los dispositivos han sido checados!</h3>
          <p className="text-gray-500 mb-2">Se completaron las {totalQuantity} revisiones del lote.</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-bold border border-green-200">
              ✓ {approvedCount} aprobados (en stock)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-bold border border-red-200">
              ✗ {rejectedCount} rechazados (recibido / por reparar)
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-medium">
              ✅ Todos los dispositivos fueron agregados automáticamente al inventario
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Ve a la pestaña "Inventario" para verlos
            </p>
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            {checkedSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{slot.model}</span>
                  <span className="text-xs text-green-600">→ Inventario</span>
                </div>
                <span className="text-xs font-mono text-gray-600">{slot.imei}</span>
                {typeof slot.batteryPercentage === 'number' && slot.batteryPercentage > 0 && (
                  <span className="text-xs text-gray-600 font-medium">🔋 {slot.batteryPercentage}%</span>
                )}
                <span className="text-xs text-green-700 font-medium">✓ Checado</span>
              </div>
            ))}
          </div>

          <button
            onClick={onBack}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Lotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checar Lote: {lot.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Proveedor: {lot.supplier}</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Volver a Lotes</button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del chequeo</span>
          <span className="text-sm font-bold text-gray-900">{checkedSlots.length}/{totalQuantity} completados</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-teal-400 to-green-500 transition-all"
            style={{ width: `${(checkedSlots.length / totalQuantity) * 100}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">Pendiente: {pendingSlots.length} dispositivos</span>
          <span className="text-xs text-green-600">Completado: {checkedSlots.length} dispositivos</span>
        </div>
      </div>

      {/* Current device to check */}
      {currentSlot && !showTestForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-2">Siguiente dispositivo por revisar ({checkedSlots.length + 1} de {totalQuantity})</p>
            <h3 className="text-2xl font-bold text-gray-900">{currentSlot.model}</h3>
            <p className="text-sm text-gray-500 mt-1">Ingresa los datos del dispositivo para comenzar la revisión</p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMEI *</label>
              <input
                type="text"
                value={imei}
                onChange={e => setImei(e.target.value)}
                placeholder="Escanea o ingresa el IMEI"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Seleccionar</option>
                  {(currentSlot ? getColorsForModel(currentSlot.model) : COLOR_OPTIONS).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Almacenamiento</label>
                <select
                  value={storage}
                  onChange={e => setStorage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Seleccionar</option>
                  {STORAGE_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revisado por *</label>
              <input
                type="text"
                value={checkedBy}
                onChange={e => setCheckedBy(e.target.value)}
                placeholder="Tu nombre"
                list="reviewers-list"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <datalist id="reviewers-list">
                {getReviewers().map((r, idx) => (
                  <option key={idx} value={r} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Batería (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={batteryPercentage}
                onChange={e => setBatteryPercentage(e.target.value)}
                placeholder="Ej: 85"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => {
                handleSaveSlotInfo();
                setShowTestForm(true);
              }}
              disabled={!imei || !checkedBy}
              className="w-full px-6 py-3 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comenzar Pruebas →
            </button>
          </div>
        </div>
      )}

      {/* Test Form */}
      {showTestForm && currentSlot && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pruebas de Funcionamiento</h3>
              <p className="text-sm text-gray-500">{currentSlot.model} • IMEI: {imei}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].every(t => t === 'pass') ? 'bg-green-100 text-green-700' :
              [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].filter(t => t === 'pass').length >= 7 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {[screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].filter(t => t === 'pass').length}/10 OK
            </div>
          </div>

          <div className="space-y-3">
            {/* Screen */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              screen === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📱</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Pantalla</p>
                  <p className="text-xs text-gray-500">Sin manchas, píxeles muertos o grietas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScreen('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    screen === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    screen === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Camera */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              camera === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📷</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Cámara</p>
                  <p className="text-xs text-gray-500">Funciona correctamente (frontal y trasera)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCamera('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    camera === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setCamera('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    camera === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Battery */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              battery === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔋</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Batería</p>
                  <p className="text-xs text-gray-500">Carga y mantiene carga correctamente</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBattery('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    battery === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setBattery('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    battery === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Speakers */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              speakers === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔊</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Bocinas</p>
                  <p className="text-xs text-gray-500">Audio claro sin distorsión</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpeakers('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    speakers === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setSpeakers('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    speakers === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Microphone */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              microphone === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎤</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Micrófono</p>
                  <p className="text-xs text-gray-500">Capta audio correctamente</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMicrophone('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    microphone === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setMicrophone('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    microphone === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* WiFi */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              wifi === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📶</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">WiFi</p>
                  <p className="text-xs text-gray-500">Se conecta a redes WiFi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWifi('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    wifi === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setWifi('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    wifi === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Bluetooth */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              bluetooth === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔵</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Bluetooth</p>
                  <p className="text-xs text-gray-500">Funciona correctamente</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBluetooth('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    bluetooth === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setBluetooth('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    bluetooth === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              buttons === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔘</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Botones</p>
                  <p className="text-xs text-gray-500">Todos los botones responden</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setButtons('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    buttons === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setButtons('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    buttons === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Charging */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              charging === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Puerto de Carga</p>
                  <p className="text-xs text-gray-500">Carga correctamente</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCharging('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    charging === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setCharging('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    charging === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>

            {/* Face ID */}
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              faceId === 'pass' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">👤</span>
                <div>
                  <p className="text-base font-semibold text-gray-900">Face ID</p>
                  <p className="text-xs text-gray-500">Reconocimiento facial funciona</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFaceId('pass')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    faceId === 'pass'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ✓ OK
                </button>
                <button
                  type="button"
                  onClick={() => setFaceId('fail')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    faceId === 'fail'
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
                >
                  ✗ Falla
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalles sobre fallas encontradas..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 Al guardar, este dispositivo se agregará automáticamente al inventario con el costo prorrateado del lote.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowTestForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Regresar
            </button>
            <button
              onClick={handleCompleteCheck}
              className="flex-1 px-6 py-3 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors"
            >
              {pendingSlots.length > 1 ? '✓ Guardar y Siguiente →' : '✓ Completar Revisión'}
            </button>
          </div>
        </div>
      )}

      {/* Already checked list */}
      {checkedSlots.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos Checados ({checkedSlots.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {checkedSlots.map((slot, idx) => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{idx + 1}.</span>
                  <span className="text-sm font-medium text-gray-900">{slot.model}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-600">{slot.imei}</span>
                  {typeof slot.batteryPercentage === 'number' && slot.batteryPercentage > 0 && (
                    <span className="text-xs text-gray-600 font-medium">🔋 {slot.batteryPercentage}%</span>
                  )}
                  <span className="text-xs text-green-700 font-medium">✓ Checado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
