import { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Proyectos from './pages/Proyectos';
import Habilidades from './pages/Habilidades';
import Experiencia from './pages/Experiencia';
import Footer from './components/Footer';

function AppContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Suscripción en tiempo real a Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "portfolio"), (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        // Inicializar estructura si el documento no existe
        setData({});
      }
      setLoadError(false);
      setLoading(false);
    }, (error) => {
      console.error('Error cargando contenido desde Firebase:', error);
      setLoadError(true);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Función unificada para actualizar cualquier sección en la DB
  const updateDatabase = async (section, newData) => {
    const docRef = doc(db, 'content', 'portfolio');
    try {
      await updateDoc(docRef, { [section]: newData });
    } catch (error) {
      if (error.code === 'not-found') {
        await setDoc(docRef, { [section]: newData }, { merge: true });
      } else {
        console.error('Error actualizando Firebase:', error);
        throw error;
      }
    }
  };

  // Pantalla de carga profesional
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0A0E17]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-acento/20 rounded-full" />
        <div className="absolute top-0 w-16 h-16 border-4 border-t-acento rounded-full animate-spin" />
      </div>
    </div>
  );

  if (loadError) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0A0E17] px-6 text-center text-white" role="alert">
      <h1 className="text-xl font-semibold">No se pudo cargar el portafolio</h1>
      <p className="max-w-md text-white/70">Revisa tu conexión e inténtalo nuevamente.</p>
      <button
        className="rounded-md bg-acento px-4 py-2 font-medium hover:bg-[#0067ad]"
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-700">
      {/* Barra de navegación */}
      <Navbar />
      
      {/* Contenido principal */}
      <main className="flex-grow space-y-0">
        <section id="Home">
          <Home 
            data={data?.hero} 
            cvUrl={data?.cvUrl}
            onUpdate={(val) => updateDatabase('hero', val)} 
            onUpdateCV={(url) => updateDatabase('cvUrl', url)}
          />
        </section>

        <section id="Habilidades">
          <Habilidades 
            data={data?.skills || []} 
            onUpdate={(val) => updateDatabase('skills', val)} 
          />
        </section>

        <section id="Proyectos">
          <Proyectos 
            projects={data?.projects || []} 
            onUpdate={(val) => updateDatabase('projects', val)} 
          />
        </section>
        
        <section id="Experiencia">
          <Experiencia 
            data={data?.experience || []} 
            onUpdate={(val) => updateDatabase('experience', val)} 
          />
        </section>
      </main>

      {/* FOOTER: Integrado con los datos de Firebase */}
      <Footer 
        data={data?.footer} 
        onUpdate={(val) => updateDatabase('footer', val)} 
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;