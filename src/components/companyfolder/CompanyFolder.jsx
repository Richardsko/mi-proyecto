import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

function CompanyFolder({ folderId, onClose }) {
  const [company, setCompany] = useState({
    documentos: [],
    fotos: []
  });
  const [activeTab, setActiveTab] = useState('documentos');
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanyData = async () => {
    try {
      const docRef = doc(db, 'company_folders', folderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCompany(docSnap.data());
      } else {
        const initialData = {
          documentos: [],
          fotos: [],
          createdAt: new Date().toISOString()
        };
        
        await setDoc(docRef, initialData);
        setCompany(initialData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [folderId]);

  const handleDeleteFile = async (fileId, type) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      try {
        setIsLoading(true);
        const updatedFiles = company[type].filter(file => file.id !== fileId);
        
        await updateDoc(doc(db, 'company_folders', folderId), {
          [type]: updatedFiles
        });
  
        setCompany(prev => ({
          ...prev,
          [type]: updatedFiles
        }));
  
        alert('Archivo eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        alert('Error al eliminar el archivo: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 1MB');
      return;
    }

    try {
      setIsLoading(true);

      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const newFile = {
        id: Date.now().toString(),
        nombre: file.name,
        data: base64,
        tipo: file.type,
        fechaSubida: new Date().toISOString()
      };

      const updatedFiles = [...company[type], newFile];
      await updateDoc(doc(db, 'company_folders', folderId), {
        [type]: updatedFiles
      });

      setCompany(prev => ({
        ...prev,
        [type]: updatedFiles
      }));
      
      alert('Archivo guardado correctamente');
    } catch (error) {
      console.error('Error al guardar archivo:', error);
      alert('Error al guardar el archivo: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = (file) => {
    if (file.tipo.startsWith('image/')) {
      return (
        <img
          src={file.data}
          alt={file.nombre}
          className="w-12 h-12 object-cover rounded"
        />
      );
    } else if (file.tipo === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
          <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'documentos'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Documentos
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'fotos'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Fotos
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {activeTab === 'documentos' && (
        <div>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e.target.files[0], 'documentos')}
            className="mb-4"
          />
          <div className="space-y-4">
            {company.documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {renderPreview(doc)}
                  <div>
                    <p className="font-medium">{doc.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.fechaSubida).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.data}
                    download={doc.nombre}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDeleteFile(doc.id, 'documentos')}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fotos' && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0], 'fotos')}
            className="mb-4"
          />
          <div className="grid grid-cols-3 gap-4">
            {company.fotos.map((foto) => (
              <div key={foto.id} className="relative group">
                <img
                  src={foto.data}
                  alt={foto.nombre}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center space-x-2">
                  <a
                    href={foto.data}
                    download={foto.nombre}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDeleteFile(foto.id, 'fotos')}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

export default CompanyFolder;