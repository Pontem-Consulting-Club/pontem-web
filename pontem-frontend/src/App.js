import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import SocialConsulting from './components/SocialConsulting';
import Events from './components/Events';
import News from './components/News';
import About from './components/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/authContext';
import NewsDetail from './components/NewsDetail';
import StudyMaterial from './components/StudyMaterial';
import Admin from './components/Admin';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

import './styles/BackgroundGradient.css';
import './App.css';

function App() {
  return (
    <div id="root">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/consultoria-social" element={<SocialConsulting />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/noticias" element={<News />} />
              <Route path="/noticias/:id" element={<NewsDetail />} />
              <Route path="/material-estudio" element={<StudyMaterial />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;