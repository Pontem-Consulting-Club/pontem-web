import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Tabs from './Tabs';
import Card from './Card';
import NewCard from './NewCard';
import NewCardForm from './NewCardForm';
import ConfirmationModal from './ConfirmationModal';
import Spinner from './Spinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Admin() {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [editingItem, setEditingItem] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const today = new Date();

  const futureEvents = events.filter((event) => new Date(event.date) >= today);
  const pastEvents = events.filter((event) => new Date(event.date) < today);

  const fetchData = async () => {
    try {
      const eventsResponse = await api.get('/admin/events');
      const projectsResponse = await api.get('/admin/projects');
      const newsResponse = await api.get('/admin/news');

      const sortedEvents = await Promise.all(
        eventsResponse.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(async (event) => {
            if (!event.image_url) {
              console.warn(
                `El evento con ID ${event.id} no tiene una URL de imagen.`
              );
              return event;
            }

            const { data: imageData, error } = await supabase.storage
              .from('images')
              .download(event.image_url);

            if (error) {
              console.error('Error al obtener la imagen:', error);
              return event;
            }

            const imageUrl = URL.createObjectURL(imageData);
            return { ...event, imageUrl };
          })
      );

      const sortedNews = newsResponse.data.sort(
        (a, b) => new Date(b.published_date) - new Date(a.published_date)
      );

      setEvents(sortedEvents);
      setProjects(projectsResponse.data);
      setNews(sortedNews);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = (id, type) => {
    setItemToDelete({ id, type });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/admin/${itemToDelete.type}/${itemToDelete.id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting item', error);
    } finally {
      setIsModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = async (item, type) => {
    setIsLoading(true);
    try {
      if (item.id) {
        await api.put(`/admin/${type}/${item.id}`, item);
      } else {
        await api.post(`/admin/${type}`, item);
        setEditingItem(null);
        setShowNewCardForm(false);
      }
      fetchData();
    } catch (error) {
      console.error('Error saving item', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewItem = (type) => {
    setEditingItem({ type });
    setShowNewCardForm(true);
  };

  const handleCancelNewItem = () => {
    setEditingItem(null);
    setShowNewCardForm(false);
  };

  const tabCounts = {
    events: events.length,
    projects: projects.length,
    news: news.length,
  };

  return (
    <div className="admin-container">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <h3 className="admin-title">Panel de administración</h3>
          <Tabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            tabCounts={tabCounts}
          />
          <div className="cards-container">
            {activeTab === 'events' && (
              <div className="cards-container-inner">
                {!editingItem && !showNewCardForm && (
                  <NewCard type="events" onNewItem={handleNewItem} />
                )}
                {showNewCardForm &&
                  editingItem &&
                  editingItem.type === 'events' && (
                    <NewCardForm
                      type="events"
                      onSave={(item) => handleSave(item, 'events')}
                      onCancel={handleCancelNewItem}
                    />
                  )}
                <h4 className="current-events-label">Eventos Programados</h4>
                {futureEvents.map((event) => (
                  <Card
                    key={event.id}
                    item={event}
                    type="event"
                    onEdit={() => handleEdit(event)}
                    onDelete={() => handleDelete(event.id, 'events')}
                  />
                ))}
                {pastEvents.length > 0 && (
                  <>
                    <h4 className="past-events-label">Eventos Pasados</h4>
                    {pastEvents.map((event) => (
                      <Card
                        key={event.id}
                        item={event}
                        type="event"
                        onEdit={() => handleEdit(event)}
                        onDelete={() => handleDelete(event.id, 'events')}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
            {activeTab === 'projects' && (
              <div className="cards-container-inner">
                {!editingItem && !showNewCardForm && (
                  <NewCard type="projects" onNewItem={handleNewItem} />
                )}
                {showNewCardForm &&
                  editingItem &&
                  editingItem.type === 'projects' && (
                    <NewCardForm
                      type="projects"
                      onSave={(item) => handleSave(item, 'projects')}
                      onCancel={handleCancelNewItem}
                    />
                  )}
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    item={project}
                    type="project"
                    onEdit={() => handleEdit(project)}
                    onDelete={() => handleDelete(project.id, 'projects')}
                  />
                ))}
              </div>
            )}
            {activeTab === 'news' && (
              <div className="cards-container-inner">
                {!editingItem && !showNewCardForm && (
                  <NewCard type="news" onNewItem={handleNewItem} />
                )}
                {showNewCardForm &&
                  editingItem &&
                  editingItem.type === 'news' && (
                    <NewCardForm
                      type="news"
                      onSave={(item) => handleSave(item, 'news')}
                      onCancel={handleCancelNewItem}
                    />
                  )}
                {news.map((newsItem) => (
                  <Card
                    key={newsItem.id}
                    item={newsItem}
                    type="news"
                    onEdit={() => handleEdit(newsItem)}
                    onDelete={() => handleDelete(newsItem.id, 'news')}
                  />
                ))}
              </div>
            )}
          </div>
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={confirmDelete}
            message="¿Estás seguro de que deseas eliminar este elemento?"
          />
        </>
      )}
    </div>
  );
}

export default Admin;
