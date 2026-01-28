import { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Proyectos from './pages/Proyectos';
import Habilidades from './pages/Habilidades';
import Experiencia from './pages/Experiencia';
import Footer from './components/Footer'; // Asegúrate de crear este archivo

function AppContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suscripción en tiempo real a Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "portfolio"), (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        // Inicializar estructura si el documento no existe
        setData({});
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Función unificada para actualizar cualquier sección en la DB
  const updateDatabase = async (section, newData) => {
    try {
      const docRef = doc(db, "content", "portfolio");
      await updateDoc(docRef, { [section]: newData });
    } catch (e) {
      // Si el documento no existe (error 404), lo creamos con setDoc
      if (e.code === 'not-found' || !data) {
        await setDoc(doc(db, "content", "portfolio"), { [section]: newData });
      } else {
        console.error("Error actualizando Firebase:", e);
      }
    }
  };

  // Pantalla de carga profesional
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0A0E17]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#0078C8]/20 rounded-full" />
        <div className="absolute top-0 w-16 h-16 border-4 border-t-[#0078C8] rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-700">
      {/* Barra de navegación */}
      <Navbar 
        data={data?.nav || {}} 
        onUpdate={(val) => updateDatabase('nav', val)} 
      />
      
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