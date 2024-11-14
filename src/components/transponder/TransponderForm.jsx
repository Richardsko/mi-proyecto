import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import jsPDF from 'jspdf';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function TransponderForm({ aircraft, folderId, onSave }) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    ordenTrabajo: '',
    modeloAeronave: aircraft.modeloAeronave || '',
    matricula: aircraft.matricula || '',
    serialAeronave: aircraft.serialAeronave || '',
    fecha: '',
    propietario: aircraft.propietario || '',
    // Transponder 1
    modeloTransponder1: '',
    numeroParteTransponder1: '',
    serialTransponder1: '',
    pwr1: '',
    frecuency1: '',
    inter1: '',
    ident1: '',
    sensitivity1: '',
    ac1: '',
    // Transponder 2
    modeloTransponder2: '',
    numeroParteTransponder2: '',
    serialTransponder2: '',
    pwr2: '',
    frecuency2: '',
    inter2: '',
    ident2: '',
    sensitivity2: '',
    ac2: '',
    // Información adicional
    observaciones: '',
    datosEquipoUtilizado: '',
    tecnico: '',
    inspector: ''
  });
  const generatePDF = async () => {
  try {
    console.log('Iniciando generación de PDF...');
    if (!formData.matricula) {
      alert('Por favor ingrese la matrícula de la aeronave');
      return;
    }
    
    // Crear nuevo documento PDF (A4)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
      
      console.log('jsPDF inicializado');
  
      // Cargar la imagen de fondo
      const img = new Image();
      img.src = 'transponder-template.jpg';
      
      console.log('Intentando cargar imagen:', img.src);
  
      // Esperar a que la imagen cargue
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('Imagen cargada exitosamente');
          resolve();
        };
        img.onerror = (e) => {
          console.error('Error al cargar la imagen:', e);
          reject(new Error('Error al cargar la imagen'));
        };
      });
  
      console.log('Agregando imagen al PDF...');
      // Agregar la imagen como fondo
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
  
      // Configurar la fuente
      doc.setFont('helvetica');
      doc.setFontSize(12);
  
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      };
      // Agregar los datos al PDF (ajusta las coordenadas según tu plantilla)
      doc.text(formData.ordenTrabajo, 49, 72);
      doc.text(formatearFecha(formData.fecha), 104, 82);
      doc.text(formData.modeloAeronave, 104, 72);
      doc.text(formData.matricula, 173, 72);
      doc.text(formData.serialAeronave, 49, 82);
      doc.text(formData.propietario, 164, 82);
  
      // Transponder 1
      doc.text(formData.modeloTransponder1, 49, 88);
      doc.text(formData.numeroParteTransponder1, 94, 88);
      doc.text(formData.serialTransponder1, 142, 88);
      doc.text(formData.pwr1, 86, 129);
      doc.text(formData.frecuency1, 86, 135);
      doc.text(formData.inter1, 86, 141);
      doc.text(formData.ident1, 86, 147);
      doc.text(formData.sensitivity1, 86, 153);
      doc.text(formData.ac1, 86, 159);
  
      // Transponder 2
      doc.text(formData.modeloTransponder2, 49, 93);
      doc.text(formData.numeroParteTransponder2, 94, 93);
      doc.text(formData.serialTransponder2, 142, 93);
      doc.text(formData.pwr2, 117, 129);
      doc.text(formData.frecuency2, 117, 135);
      doc.text(formData.inter2, 117, 141);
      doc.text(formData.ident2, 117, 147);
      doc.text(formData.sensitivity2, 117, 153);
      doc.text(formData.ac2, 117, 159);
  
      // Información adicional
      doc.text(formData.observaciones, 85, 188);
      doc.text(formData.datosEquipoUtilizado, 85, 226);
      doc.text(formData.tecnico, 60, 263);
      doc.text(formData.inspector, 140, 263);

        // Solo descargar el PDF localmente
doc.save(`Reporte_Transponder_${formData.matricula}.pdf`);
setOpenModal(false);
    
       
    
        
} catch (error) {
  console.error('Error al generar PDF:', error);
  alert('Error al generar el PDF: ' + error.message);
}
};
  const testCoordinates = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
  
      // Cargar la imagen de fondo
      const img = new Image();
      img.src = '/transponder-template.jpg';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
  
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
  
      // Dibujar cuadrícula
      doc.setDrawColor(255, 0, 0);
      doc.setTextColor(255, 0, 0);
  
      // Líneas verticales y números X
      for(let x = 0; x <= 210; x += 10) {
        doc.line(x, 0, x, 297);
        doc.text(`${x}`, x, 10);
      }
  
      // Líneas horizontales y números Y
      for(let y = 0; y <= 297; y += 10) {
        doc.line(0, y, 210, y);
        doc.text(`${y}`, 2, y);
      }
  
      doc.save('test-coordinates.pdf');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <div className="text-center py-8">
      <button
        onClick={() => setOpenModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Reporte de Transponder
      </button>

      <Dialog 
  open={openModal} 
  onClose={() => setOpenModal(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Reporte de Transponder</DialogTitle>
  <DialogContent>
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Datos Generales */}
      <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">O/T</label>
          <input
            type="text"
            value={formData.ordenTrabajo}
            onChange={(e) => setFormData(prev => ({ ...prev, ordenTrabajo: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Modelo de Aeronave</label>
          <input
            type="text"
            value={formData.modeloAeronave}
            onChange={(e) => setFormData(prev => ({ ...prev, modeloAeronave: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Matrícula</label>
          <input
            type="text"
            value={formData.matricula}
            onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Serial de Aeronave</label>
          <input
            type="text"
            value={formData.serialAeronave}
            onChange={(e) => setFormData(prev => ({ ...prev, serialAeronave: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Propietario</label>
          <input
            type="text"
            value={formData.propietario}
            onChange={(e) => setFormData(prev => ({ ...prev, propietario: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transponder 1 */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transponder 1</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              value={formData.modeloTransponder1}
              onChange={(e) => setFormData(prev => ({ ...prev, modeloTransponder1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Parte</label>
            <input
              type="text"
              value={formData.numeroParteTransponder1}
              onChange={(e) => setFormData(prev => ({ ...prev, numeroParteTransponder1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial</label>
            <input
              type="text"
              value={formData.serialTransponder1}
              onChange={(e) => setFormData(prev => ({ ...prev, serialTransponder1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PWR</label>
            <input
              type="text"
              value={formData.pwr1}
              onChange={(e) => setFormData(prev => ({ ...prev, pwr1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <input
              type="text"
              value={formData.frecuency1}
              onChange={(e) => setFormData(prev => ({ ...prev, frecuency1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">INTER</label>
            <input
              type="text"
              value={formData.inter1}
              onChange={(e) => setFormData(prev => ({ ...prev, inter1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IDENT</label>
            <input
              type="text"
              value={formData.ident1}
              onChange={(e) => setFormData(prev => ({ ...prev, ident1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sensitivity</label>
            <input
              type="text"
              value={formData.sensitivity1}
              onChange={(e) => setFormData(prev => ({ ...prev, sensitivity1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">A/C</label>
            <input
              type="text"
              value={formData.ac1}
              onChange={(e) => setFormData(prev => ({ ...prev, ac1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Transponder 2 */}
<div className="col-span-2 mt-6">
  <h3 className="text-lg font-medium text-gray-900 mb-4">Transponder 2</h3>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">Modelo</label>
      <input
        type="text"
        value={formData.modeloTransponder2}
        onChange={(e) => setFormData(prev => ({ ...prev, modeloTransponder2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Número de Parte</label>
      <input
        type="text"
        value={formData.numeroParteTransponder2}
        onChange={(e) => setFormData(prev => ({ ...prev, numeroParteTransponder2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Serial</label>
      <input
        type="text"
        value={formData.serialTransponder2}
        onChange={(e) => setFormData(prev => ({ ...prev, serialTransponder2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">PWR</label>
      <input
        type="text"
        value={formData.pwr2}
        onChange={(e) => setFormData(prev => ({ ...prev, pwr2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Frequency</label>
      <input
        type="text"
        value={formData.frecuency2}
        onChange={(e) => setFormData(prev => ({ ...prev, frecuency2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">INTER</label>
      <input
        type="text"
        value={formData.inter2}
        onChange={(e) => setFormData(prev => ({ ...prev, inter2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">IDENT</label>
      <input
        type="text"
        value={formData.ident2}
        onChange={(e) => setFormData(prev => ({ ...prev, ident2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Sensitivity</label>
      <input
        type="text"
        value={formData.sensitivity2}
        onChange={(e) => setFormData(prev => ({ ...prev, sensitivity2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">A/C</label>
      <input
        type="text"
        value={formData.ac2}
        onChange={(e) => setFormData(prev => ({ ...prev, ac2: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
</div>
        

      {/* Información Adicional */}
      <div className="col-span-2 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Datos del Equipo Utilizado</label>
            <textarea
              value={formData.datosEquipoUtilizado}
              onChange={(e) => setFormData(prev => ({ ...prev, datosEquipoUtilizado: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Técnico</label>
              <input
                type="text"
                value={formData.tecnico}
                onChange={(e) => setFormData(prev => ({ ...prev, tecnico: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inspector</label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
  <DialogActions>
  <button
    onClick={() => setOpenModal(false)}
    className="px-4 py-2 text-gray-700 hover:text-gray-900"
  >
    Cancelar
  </button>
  <button
    onClick={generatePDF}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    Generar PDF
  </button>
</DialogActions>
</Dialog>
    </div>
  );
}

export default TransponderForm;