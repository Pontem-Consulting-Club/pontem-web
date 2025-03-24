import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Event from './Event';
import api from '../api';
import Spinner from './Spinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function NextEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/scheduled');
        const data = response.data;

        const today = new Date();
        const filteredEvents = data
          .filter(event => new Date(event.date) > today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        // Fetch images from Supabase
        const updatedEvents = await Promise.all(
          filteredEvents.map(async (event) => {
            if (!event.image_url) {
              console.warn(`El evento con ID ${event.id} no tiene una URL de imagen.`);
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

        setUpcomingEvents(updatedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Container id="proximos-eventos" className="timeline-container next-events">
      <div className="section-text">
        <h3>Próximos Eventos</h3>
      </div>

      <div className="timeline">
        <div className="timeline-line"></div>

        {isLoading ? (
          <Spinner />
        ) : upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => <Event key={event.id} event={event} />)
        ) : (
          <div className="no-events">
            <p>No hay eventos próximos en este momento.</p>
          </div>
        )}
      </div>
    </Container>
  );
} 