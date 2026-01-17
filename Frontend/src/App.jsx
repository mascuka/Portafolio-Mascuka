import { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Proyectos from './pages/Proyectos';
import Habilidades from './pages/Habilidades';
import Experiencia from './pages/Experiencia';

function AppContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "portfolio"), (snap) => {
      if (snap.exists()) setData(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateDatabase = async (section, newData) => {
    try {
      const docRef = doc(db, "content", "portfolio");
      await updateDoc(docRef, { [section]: newData });
    } catch (e) {
      if (e.code === 'not-found') {
        await setDoc(doc(db, "content", "portfolio"), { [section]: newData });
      }
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0A0E17]">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin border-blue-400" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar data={data?.nav || {}} onUpdate={(val) => updateDatabase('nav', val)} />
      
      <main className="space-y-0">
        <section id="Home">
          <Home 
            data={data?.hero} 
            cvUrl={data?.cvUrl}
            onUpdate={(val) => updateDatabase('hero', val)} 
            onUpdateCV={(url) => updateDatabase('cvUrl', url)}
          />
        </section>
        
        <section id="Proyectos">
          <Proyectos 
            projects={data?.projects || []} 
            onUpdate={(val) => updateDatabase('projects', val)} 
          />
        </section>
        
        <section id="Habilidades">
          <Habilidades 
            data={data?.skills || []} 
            onUpdate={(val) => updateDatabase('skills', val)} 
          />
        </section>
        
        <section id="Experiencia">
          <Experiencia 
            data={data?.experience || []} 
            onUpdate={(val) => updateDatabase('experience', val)} 
          />
        </section>
      </main>
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