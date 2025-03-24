import React, { useEffect, useState } from 'react';
import '../styles/Admin.css';

function Tabs({ activeTab, setActiveTab, onLogout, tabCounts }) {
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 600);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 600);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('events')} className={activeTab === 'events' ? 'active' : ''}>
          Eventos {isWideScreen && <span className="tab-count">{tabCounts.events}</span>}
        </button>
        <button onClick={() => setActiveTab('projects')} className={activeTab === 'projects' ? 'active' : ''}>
          Proyectos {isWideScreen && <span className="tab-count">{tabCounts.projects}</span>}
        </button>
        <button onClick={() => setActiveTab('news')} className={activeTab === 'news' ? 'active' : ''}>
          Noticias {isWideScreen && <span className="tab-count">{tabCounts.news}</span>}
        </button>
      </div>
      <button onClick={onLogout} className="logout-button">Salir</button>
    </div>
  );
}

export default Tabs; 