import { useState, useEffect } from 'react';
import { QualityCheck, CheckSlot } from '../types';
import { generateId, getReviewers, addReviewer } from '../store';

interface Props {
  pendingSlots: CheckSlot[];
  onSave: (check: QualityCheck) => void;
  editingCheck?: QualityCheck | null;
  onCancel: () => void;
}

export default function QualityCheckForm({ pendingSlots, onSave, editingCheck, onCancel }: Props) {
  const [slotId, setSlotId] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
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

  useEffect(() => {
    if (editingCheck) {
      setSlotId(editingCheck.slotId);
      setCheckDate(editingCheck.checkDate);
      setCheckedBy(editingCheck.checkedBy);
      setBatteryPercentage(editingCheck.batteryPercentage?.toString() || '');
      setScreen(editingCheck.screen);
      setCamera(editingCheck.camera);
      setBattery(editingCheck.battery);
      setSpeakers(editingCheck.speakers);
      setMicrophone(editingCheck.microphone);
      setWifi(editingCheck.wifi);
      setBluetooth(editingCheck.bluetooth);
      setButtons(editingCheck.buttons);
      setCharging(editingCheck.charging);
      setFaceId(editingCheck.faceId);
      setNotes(editingCheck.notes);
    }
  }, [editingCheck]);

  const selectedSlot = pendingSlots.find(s => s.id === slotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const allPass = [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].every(t => t === 'pass');
    const anyFail = [screen, camera, battery, speakers, microphone, wifi, bluetooth, buttons, charging, faceId].some(t => t === 'fail');

    // Save reviewer to list
    if (checkedBy) {
      addReviewer(checkedBy);
    }

    const check: QualityCheck = {
      id: editingCheck?.id || generateId(),
      deviceId: '',
      slotId,
      lotId: selectedSlot.lotId,
      imei: selectedSlot.imei,
      model: selectedSlot.model,
      checkDate,
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
    onSave(check);
  };

  const tests = [
    { key: 'screen', label: 'Pantalla', icon: '📱', description: 'Sin manchas, píxeles muertos o grietas' },
    { key: 'camera', label: 'Cámara', icon: '📷', description: 'Funciona correctamente (frontal y trasera)' },
    { key: 'battery', label: 'Batería', icon: '🔋', description: 'Carga y mantiene carga correctamente' },
    { key: 'speakers', label: 'Bocinas', icon: '🔊', description: 'Audio claro sin distorsión' },
    { key: 'microphone', label: 'Micrófono', icon: '🎤', description: 'Capta audio correctamente' },
    { key: 'wifi', label: 'WiFi', icon: '📶', description: 'Se conecta a redes WiFi' },
    { key: 'bluetooth', label: 'Bluetooth', icon: '🔵', description: 'Funciona correctamente' },
    { key: 'buttons', label: 'Botones', icon: '🔘', description: 'Todos los botones responden' },
    { key: 'charging', label: 'Puerto de Carga', icon: '⚡', description: 'Carga correctamente' },
    { key: 'faceId', label: 'Face ID', icon: '👤', description: 'Reconocimiento facial funciona' },
  ];

  const getTestValue = (key: string): 'pass' | 'fail' => {
    switch (key) {
      case 'screen': return screen;
      case 'camera': return camera;
      case 'battery': return battery;
      case 'speakers': return speakers;
      case 'microphone': return microphone;
      case 'wifi': return wifi;
      case 'bluetooth': return bluetooth;
      case 'buttons': return buttons;
      case 'charging': return charging;
      case 'faceId': return faceId;
      default: return 'pass';
    }
  };

  const setTestValue = (key: string, value: 'pass' | 'fail') => {
    switch (key) {
      case 'screen': setScreen(value); break;
      case 'camera': setCamera(value); break;
      case 'battery': setBattery(value); break;
      case 'speakers': setSpeakers(value); break;
      case 'microphone': setMicrophone(value); break;
      case 'wifi': setWifi(value); break;
      case 'bluetooth': setBluetooth(value); break;
      case 'buttons': setButtons(value); break;
      case 'charging': setCharging(value); break;
      case 'faceId': setFaceId(value); break;
    }
  };

  const passCount = tests.filter(t => getTestValue(t.key) === 'pass').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingCheck ? 'Editar Revisión' : 'Nueva Revisión de Calidad'}
        </h1>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Slot Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivo a Revisar</h3>
          {pendingSlots.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay dispositivos pendientes de revisar</p>
              <p className="text-sm text-gray-400 mt-1">Primero crea un lote con dispositivos por checar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Dispositivo *</label>
                <select
                  value={slotId}
                  onChange={e => setSlotId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar dispositivo pendiente</option>
                  {pendingSlots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.model} - {s.imei || 'Sin IMEI'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Revisión *</label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={e => setCheckDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Revisado por *</label>
            <input
              type="text"
              value={checkedBy}
              onChange={e => setCheckedBy(e.target.value)}
              placeholder="Nombre de quien realiza la revisión"
              required
              list="reviewers-list-form"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="reviewers-list-form">
              {getReviewers().map((r, idx) => (
                <option key={idx} value={r} />
              ))}
            </datalist>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Batería (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={batteryPercentage}
              onChange={e => setBatteryPercentage(e.target.value)}
              placeholder="Ej: 85"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedSlot && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-blue-600">Modelo</p>
                  <p className="text-sm font-semibold text-blue-800">{selectedSlot.model}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">IMEI</p>
                  <p className="text-sm font-mono font-semibold text-blue-800">{selectedSlot.imei || 'Sin IMEI'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Color</p>
                  <p className="text-sm font-semibold text-blue-800">{selectedSlot.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Almacenamiento</p>
                  <p className="text-sm font-semibold text-blue-800">{selectedSlot.storage || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pruebas de Funcionamiento</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              passCount === 10 ? 'bg-green-100 text-green-700' :
              passCount >= 7 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {passCount}/10 aprobadas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(test => (
              <div key={test.key} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                getTestValue(test.key) === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{test.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{test.label}</p>
                    <p className="text-xs text-gray-500">{test.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTestValue(test.key, 'pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      getTestValue(test.key) === 'pass'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'
                    }`}
                  >
                    ✓ OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestValue(test.key, 'fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      getTestValue(test.key) === 'fail'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
                    }`}
                  >
                    ✗ Falla
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Detalles sobre fallas encontradas, condiciones especiales, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pendingSlots.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {editingCheck ? 'Actualizar Revisión' : 'Guardar Revisión'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
