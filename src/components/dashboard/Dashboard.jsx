import { useState, useEffect } from 'react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import logo from '../../assets/images/logo.png';
// Importar las imágenes del carrusel desde la misma carpeta

import avion2 from './avion2.jpg';
import avion3 from './avion3.jpg';
import avion4 from './avion4.jpg';
import EmployeeFolder from '../employee/EmployeeFolder';
import CompanyFolder from '../companyfolder/CompanyFolder'; 
import AircraftFolder from '../aircraft/AircraftFolder';
 

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(''); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState({ index: null, show: false });
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Filtrar carpetas basado en el término de búsqueda
  const filteredFolders = (categoryFolders = []) => {
    if (!searchTerm) return categoryFolders;
    return categoryFolders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Cargar carpetas existentes
  useEffect(() => {
    const loadFolders = async () => {
      const foldersData = {};
      for (const item of menuItems) {
        const q = query(
          collection(db, 'folders'),
          where('category', '==', item.title)
        );
        const querySnapshot = await getDocs(q);
        foldersData[item.title] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      setFolders(foldersData);
    };

    loadFolders();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
  
    return () => unsubscribe();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // La redirección se manejará automáticamente por el AuthContext/Router
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCreateFolder = async (categoryIndex) => {
    if (newFolderName.trim()) {
      try {
        const category = menuItems[categoryIndex].title;
        const folderData = {
          name: newFolderName.trim(),
          category: category,
          createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, 'folders'), folderData);
        
        setFolders(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), { id: docRef.id, ...folderData }]
        }));

        setNewFolderName('');
        setShowNewFolderInput({ index: null, show: false });
      } catch (error) {
        console.error('Error al crear la carpeta:', error);
        alert('Error al crear la carpeta');
      }
    }
  };

  const handleDeleteFolder = async (folderId, category) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) {
      try {
        await deleteDoc(doc(db, 'folders', folderId));
        
        setFolders(prev => ({
          ...prev,
          [category]: prev[category].filter(folder => folder.id !== folderId)
        }));
      } catch (error) {
        console.error('Error al eliminar la carpeta:', error);
        alert('Error al eliminar la carpeta');
      }
    }
  };
  const handleFolderClick = (folder, category) => {
    console.log("Folder clicked:", folder, category);
    if (category === 'Documentos Empleados') {
      setSelectedFolder({ 
        ...folder, 
        type: 'employee',
        collectionName: 'employees' 
      });
    } else if (category === 'Documentos de la Empresa') {
      setSelectedFolder({ 
        ...folder, 
        type: 'company',
        collectionName: 'company_folders' 
      });
    } else if (category === 'Aeronaves') {
      setSelectedFolder({ 
        ...folder, 
        type: 'aircraft',
        collectionName: 'aircrafts' 
      });
    }
  };
  
  const menuItems = [
    {
      title: 'Aeronaves',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      ),
    },
    {
      title: 'Documentos de la Empresa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      ),
    },
    {
      title: 'Documentos Empleados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full px-3 py-4 overflow-y-auto bg-gradient-to-b from-blue-800 to-blue-900">
  <div className="flex flex-col items-center justify-center mb-4 p-4">
    <img 
      src={logo} 
      alt="Wings Air Logo" 
      className="h-20 w-auto object-contain mb-2"
    />
    {userEmail && (
      <div className="text-white text-sm text-center mt-2 px-2 py-1 bg-blue-700 rounded-lg">
        <p className="font-medium">{userEmail}</p>
      </div>
    )}
  </div>
  {/* ... resto del código ... */}

          {/* Barra de búsqueda */}
          <div className="px-3 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar carpeta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-900 bg-white rounded-lg border focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index} className="mb-4">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                  className="flex items-center w-full p-3 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {item.icon}
                  <span className="ml-3 flex-1 text-left whitespace-nowrap">{item.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <div
                  className={`transition-all duration-300 ${
                    activeDropdown === index ? 'max-h-[400px]' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="pl-6 mt-2 space-y-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
                    <button
                      onClick={() => setShowNewFolderInput({ index, show: true })}
                      className="flex items-center w-full p-2 text-gray-300 rounded-lg hover:bg-blue-700 hover:text-white transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      <span>Nueva Carpeta</span>
                    </button>

                    {showNewFolderInput.index === index && showNewFolderInput.show && (
                      <div className="px-2 py-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            className="w-full px-2 py-1 text-sm text-gray-900 bg-white rounded border focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateFolder(index);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleCreateFolder(index)}
                            className="p-1 text-green-500 hover:text-green-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowNewFolderInput({ index: null, show: false })}
                            className="p-1 text-red-500 hover:text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

<div className="space-y-1 overflow-y-auto custom-scrollbar">
  {filteredFolders(folders[item.title])?.map((folder) => (
    <div 
      key={folder.id} 
      className="group cursor-pointer"
      onClick={() => handleFolderClick(folder, item.title)}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center justify-between p-2 text-gray-300 rounded-lg hover:bg-blue-700 hover:text-white transition-colors duration-200">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <span className="ml-3">{folder.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteFolder(folder.id, item.title);
          }}
          className="hidden group-hover:block p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  ))}
</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 lg:ml-72">
        <header className="bg-white shadow-md rounded-lg mb-6">
          <div className="px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            
            <h1 className="text-2xl font-semibold text-gray-900">Panel de Control</h1>
            
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-gray-600"
            >
              <span className="mr-2">Cerrar Sesión</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </header>

        {selectedFolder && (
  <div className="bg-white rounded-lg shadow-md">
    {selectedFolder.type === 'employee' ? (
      <EmployeeFolder
        folderId={selectedFolder.id}
        onClose={() => setSelectedFolder(null)}
      />
    ) : selectedFolder.type === 'company' ? (
      <CompanyFolder
        folderId={selectedFolder.id}
        onClose={() => setSelectedFolder(null)}
      />
    ) : selectedFolder.type === 'aircraft' ? (
      <AircraftFolder
        folderId={selectedFolder.id}
        onClose={() => setSelectedFolder(null)}
      />
    ) : null}
  </div>
)}

{!selectedFolder && (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fade-in">
      Bienvenido al Sistema de Gestión
    </h2>
    <p className="text-xl text-gray-600 mb-8">
      Wings Air - Control y Documentación
    </p>
    
    {/* Carrusel de imágenes */}
    <div className="relative h-96 overflow-hidden rounded-lg">
  <div className="flex animate-slide">
    {/* Primer conjunto de imágenes */}
    <img src={avion2} alt="Avión 2" className="w-full h-96 object-cover flex-shrink-0" />
    <img src={avion3} alt="Avión 3" className="w-full h-96 object-cover flex-shrink-0" />
    <img src={avion4} alt="Avión 4" className="w-full h-96 object-cover flex-shrink-0" />
    
    {/* Duplicar las imágenes para crear un efecto infinito */}
    <img src={avion2} alt="Avión 2" className="w-full h-96 object-cover flex-shrink-0" />
    <img src={avion3} alt="Avión 3" className="w-full h-96 object-cover flex-shrink-0" />
    <img src={avion4} alt="Avión 4" className="w-full h-96 object-cover flex-shrink-0" />
  </div>
</div>
  </div>
)}
      </div>
    </div>
  );
}

export default Dashboard;