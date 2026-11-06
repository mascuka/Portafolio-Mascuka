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

  // Pantalla de carga: colores del tema actual (variables --tema-* de index.css)
  if (loading) return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center gap-5 bg-[var(--tema-fondo)]"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--tema-linea)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--tema-deco)] animate-spin motion-reduce:animate-none" />
      </div>
      <p className="text-[13px] font-medium tracking-[0.14em] uppercase text-[var(--tema-texto-suave)]">
        Cargando
      </p>
    </div>
  );

  if (loadError) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--tema-fondo)] px-6 text-center" role="alert">
      <h1 className="text-3xl text-[var(--tema-texto)]">No se pudo cargar el portafolio</h1>
      <p className="max-w-md text-[17px] leading-relaxed text-[var(--tema-texto-suave)]">Revisa tu conexión e inténtalo nuevamente.</p>
      <button
        className="mt-2 h-11 px-6 rounded-[10px] bg-[var(--tema-boton)] text-[var(--tema-boton-texto)] text-[12.5px] font-semibold uppercase tracking-[0.07em] hover:bg-[var(--tema-boton-hover)]"
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