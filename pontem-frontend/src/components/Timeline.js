import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import '../styles/Timeline.css';
import Event from './Event';
import api from '../api';
import Spinner from './Spinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function Timeline() {
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
          .sort((a, b) => new Date(a.date) - new Date(b.date));

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
    <Container id="eventos" className="timeline-container">
      <div className="section-text my-4">
        <p>
          Descubre los eventos más importantes de nuestro Club. Inscríbete en nuestros eventos para no perderte la oportunidad de participar en ellos. En ellos podrás conocer a distintas consultoras, disfrutar de actividades exclusivas y contribuir al crecimiento de nuestra comunidad. ¡Te esperamos!
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="timeline">
          <div className="timeline-line"></div>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => <Event key={event.id} event={event} />)
          ) : (
            <div className="no-events">
              <p>No hay eventos programados en este momento.</p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}