import { useState, useRef } from 'react';
import { Sale, Lot } from '../types';
import { formatDate, formatCurrency } from '../store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  sale: Sale;
  lot?: Lot;
  onClose: () => void;
  onSaveObservations?: (observations: string) => void;
}

export default function Policy({ sale, lot, onClose, onSaveObservations }: Props) {
  const [observations, setObservations] = useState(sale.notes || '');
  const policyRef = useRef<HTMLDivElement>(null);

  const warrantyEndDate = new Date(sale.saleDate);
  warrantyEndDate.setMonth(warrantyEndDate.getMonth() + 1);
  const warrantyEndStr = warrantyEndDate.toISOString().split('T')[0];

  const generateWhatsAppMessage = () => {
    const message = `📱 *PÓLIZA DE GARANTÍA* 📱
━━━━━━━━━━━━━━━━━━━━

🏪 *Celulares González*
📅 Fecha de emisión: ${formatDate(new Date().toISOString().split('T')[0])}

━━━━━━━━━━━━━━━━━━━━
*DATOS DEL PRODUCTO*
━━━━━━━━━━━━━━━━━━━━
📱 Modelo: *${sale.model}*
🎨 Color: ${sale.color}
💾 Almacenamiento: ${sale.storage}
🔢 IMEI: *${sale.imei}*
${lot ? `📦 Lote: ${lot.name}` : ''}

━━━━━━━━━━━━━━━━━━━━
*DATOS DE LA COMPRA*
━━━━━━━━━━━━━━━━━━━━
📅 Fecha de compra: ${formatDate(sale.saleDate)}
💰 Precio: ${formatCurrency(sale.salePrice)}
${sale.paymentMethod ? `💳 Método de pago: ${sale.paymentMethod}` : ''}

━━━━━━━━━━━━━━━━━━━━
*DATOS DEL CLIENTE*
━━━━━━━━━━━━━━━━━━━━
👤 Nombre: ${sale.customerName}
📞 Teléfono: ${sale.customerPhone}
${sale.customerEmail ? `📧 Email: ${sale.customerEmail}` : ''}

━━━━━━━━━━━━━━━━━━━━
*COBERTURA DE GARANTÍA*
━━━━━━━━━━━━━━━━━━━━
✅ Vigencia: *1 MES*
📅 Inicio: ${formatDate(sale.saleDate)}
📅 Vencimiento: *${formatDate(warrantyEndStr)}*

*LA GARANTÍA CUBRE:*
✓ Defectos de fabricación
✓ Fallas en pantalla (únicamente si no funciona el táctil)
✓ Problemas de batería
✓ Fallas en cámaras
✓ Problemas de audio (bocinas/micrófono)
✓ Fallas en WiFi/Bluetooth
✓ Problemas con Face ID

*LA GARANTÍA NO CUBRE:*
✗ Daños por golpes o caídas
✗ Daños por líquidos o humedad
✗ Pantallas rotas
✗ Daños en botones físicos
✗ Daños en puerto de carga
✗ Modificaciones o reparaciones no autorizadas
✗ Pérdida o robo
✗ Desgaste normal por uso

${observations ? `━━━━━━━━━━━━━━━━━━━━
*OBSERVACIONES*
━━━━━━━━━━━━━━━━━━━━
${observations}` : ''}

━━━━━━━━━━━━━━━━━━━━
*TÉRMINOS Y CONDICIONES*
━━━━━━━━━━━━━━━━━━━━
• Para hacer válida la garantía, presentar este mensaje y el dispositivo.
• El dispositivo no debe haber sido abierto o reparado por terceros.
• La garantía se invalida si se borra o altera el IMEI.
• Pasada la fecha de vencimiento, cualquier reparación tendrá costo.

━━━━━━━━━━━━━━━━━━━━
*ACEPTACIÓN DE TÉRMINOS*
━━━━━━━━━━━━━━━━━━━━
✅ Al realizar la compra de este dispositivo, el cliente declara haber leído y aceptado los términos y condiciones de garantía de *Celulares González*.

━━━━━━━━━━━━━━━━━━━━
📞 Contacto: ${sale.customerPhone}
🏪 Celulares González - Calidad Garantizada

_Gracias por su compra_ 🙏`;

    return message;
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = sale.customerPhone.replace(/[\s\-\(\)]/g, '');
    const phoneWithCode = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    
    const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!policyRef.current) return;

    try {
      const element = policyRef.current;
      
      // Balanced scale for quality and file size
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 816,
        height: 1056,
      });

      // Use JPEG with good quality for balance
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'pt', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Poliza_${sale.customerName.replace(/\s+/g, '_')}_${sale.imei}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const printWindow = window.open('', '_blank');
      if (printWindow && policyRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Póliza de Garantía - Celulares González</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>${policyRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        alert('No se pudo generar el PDF. Por favor usa la opción de imprimir (Ctrl+P) desde tu navegador.');
      }
    }
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message).then(() => {
      alert('✅ Póliza copiada al portapapeles');
    });
  };

  // Color scheme - Sky blue elegant
  const colors = {
    primary: '#0EA5E9',      // Sky blue
    primaryDark: '#0284C7',  // Darker sky blue
    primaryLight: '#E0F2FE', // Very light sky blue
    text: '#1E293B',         // Dark slate
    textLight: '#64748B',    // Slate gray
    border: '#CBD5E1',       // Light border
    bg: '#FFFFFF',           // White
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between z-10">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">📱 Póliza de Garantía</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Policy Content - Letter size optimized */}
        <div className="p-6 print:p-0">
          <div 
            ref={policyRef}
            style={{
              width: '816px',
              height: '1056px',
              margin: '0 auto',
              padding: '35px',
              fontFamily: 'Arial, sans-serif',
              background: '#ffffff',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: `2px solid ${colors.primary}`,
            }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: colors.primary,
                margin: '0 0 6px 0',
                letterSpacing: '1px',
              }}>
                CELULARES GONZÁLEZ
              </h1>
              <div style={{
                fontSize: '12px',
                color: colors.textLight,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Póliza de Garantía
              </div>
              <div style={{
                fontSize: '10px',
                color: colors.textLight,
                marginTop: '6px',
              }}>
                Emitida el {formatDate(new Date().toISOString().split('T')[0])}
              </div>
            </div>

            {/* Main content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Left column */}
              <div>
                {/* Product Info */}
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: '4px',
                  }}>
                    Producto
                  </h3>
                  <div style={{ fontSize: '10px', lineHeight: '1.7', color: colors.text }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Modelo:</span>
                      <span style={{ fontWeight: '600' }}>{sale.model}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Color:</span>
                      <span style={{ fontWeight: '600' }}>{sale.color}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Almacenamiento:</span>
                      <span style={{ fontWeight: '600' }}>{sale.storage}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textLight }}>IMEI:</span>
                      <span style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '9px' }}>{sale.imei}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: '4px',
                  }}>
                    Cliente
                  </h3>
                  <div style={{ fontSize: '10px', lineHeight: '1.7', color: colors.text }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Nombre:</span>
                      <span style={{ fontWeight: '600' }}>{sale.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Teléfono:</span>
                      <span style={{ fontWeight: '600' }}>{sale.customerPhone}</span>
                    </div>
                    {sale.customerEmail && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: colors.textLight }}>Email:</span>
                        <span style={{ fontWeight: '600', fontSize: '9px' }}>{sale.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                {/* Sale Info */}
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: '4px',
                  }}>
                    Compra
                  </h3>
                  <div style={{ fontSize: '10px', lineHeight: '1.7', color: colors.text }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Fecha:</span>
                      <span style={{ fontWeight: '600' }}>{formatDate(sale.saleDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: colors.textLight }}>Precio:</span>
                      <span style={{ fontWeight: '600', color: colors.primaryDark }}>{formatCurrency(sale.salePrice)}</span>
                    </div>
                    {sale.paymentMethod && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: colors.textLight }}>Pago:</span>
                        <span style={{ fontWeight: '600' }}>{sale.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warranty Period - Simplified */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '4px',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    margin: '0 0 6px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    Vigencia
                  </h3>
                  <div style={{ fontSize: '10px', lineHeight: '1.6', color: colors.text }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: colors.textLight }}>Duración:</span>
                      <span style={{ fontWeight: 'bold', color: colors.primary }}>1 MES</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: colors.textLight }}>Inicio:</span>
                      <span style={{ fontWeight: '600' }}>{formatDate(sale.saleDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textLight }}>Vencimiento:</span>
                      <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatDate(warrantyEndStr)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage - Simplified */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              {/* Covers */}
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '10px',
              }}>
                <h3 style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: colors.primary,
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  ✓ Cobertura
                </h3>
                <ul style={{ fontSize: '9px', lineHeight: '1.5', margin: 0, paddingLeft: '15px', color: colors.text }}>
                  <li>Defectos de fabricación</li>
                  <li>Fallas en pantalla (solo táctil)</li>
                  <li>Problemas de batería</li>
                  <li>Fallas en cámaras</li>
                  <li>Problemas de audio</li>
                  <li>Fallas WiFi/Bluetooth</li>
                  <li>Problemas con Face ID</li>
                </ul>
              </div>

              {/* Does not cover */}
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '10px',
              }}>
                <h3 style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: colors.textLight,
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  ✗ Exclusiones
                </h3>
                <ul style={{ fontSize: '9px', lineHeight: '1.5', margin: 0, paddingLeft: '15px', color: colors.text }}>
                  <li>Daños por golpes o caídas</li>
                  <li>Daños por líquidos</li>
                  <li>Pantallas rotas</li>
                  <li>Daños en botones</li>
                  <li>Daños en puerto de carga</li>
                  <li>Modificaciones no autorizadas</li>
                  <li>Pérdida o robo</li>
                </ul>
              </div>
            </div>

            {/* Observations */}
            {observations && (
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                background: '#fafafa',
              }}>
                <h3 style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: colors.primary,
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Observaciones
                </h3>
                <p style={{ fontSize: '9px', margin: 0, lineHeight: '1.4', color: colors.text }}>
                  {observations}
                </p>
              </div>
            )}

            {/* Terms */}
            <div style={{
              fontSize: '8px',
              color: colors.textLight,
              lineHeight: '1.4',
              marginBottom: '15px',
              padding: '8px',
              background: '#fafafa',
              borderRadius: '3px',
            }}>
              <strong style={{ color: colors.text, display: 'block', marginBottom: '4px', fontSize: '9px' }}>
                Términos y Condiciones
              </strong>
              • Presentar esta póliza y el dispositivo para hacer válida la garantía.<br/>
              • El dispositivo no debe haber sido abierto o reparado por terceros.<br/>
              • La garantía se invalida si se borra o altera el IMEI.<br/>
              • Pasada la fecha de vencimiento, cualquier reparación tendrá costo.
            </div>

            {/* Acceptance Declaration */}
            <div style={{
              border: `1px solid ${colors.primary}`,
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '15px',
              background: '#f0f9ff',
              textAlign: 'center',
            }}>
              <p style={{ 
                fontSize: '9px', 
                margin: 0, 
                lineHeight: '1.4', 
                color: colors.text,
                fontWeight: '600',
              }}>
                Al realizar la compra, el cliente acepta los términos y condiciones de garantía de <strong style={{ color: colors.primary }}>Celulares González</strong>.
              </p>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              borderTop: `1px solid ${colors.border}`,
              paddingTop: '12px',
              marginTop: 'auto',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: colors.primary,
                marginBottom: '3px',
                letterSpacing: '1px',
              }}>
                CELULARES GONZÁLEZ
              </div>
              <div style={{
                fontSize: '8px',
                color: colors.textLight,
              }}>
                Calidad y confianza garantizada
              </div>
            </div>
          </div>
        </div>

        {/* Observations Input */}
        <div className="px-6 pb-4 print:hidden">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Observaciones adicionales (opcional)
          </label>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Agrega cualquier observación importante sobre la garantía..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-wrap gap-2 sm:gap-3 print:hidden pb-safe">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 bg-sky-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Descargar PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
          <button
            onClick={handleCopyMessage}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-sky-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
          >
            📋 <span className="hidden sm:inline">Copiar</span>
          </button>
          {onSaveObservations && (
            <button
              onClick={() => onSaveObservations(observations)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              💾 <span className="hidden sm:inline">Guardar</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
