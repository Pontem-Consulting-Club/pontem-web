import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogImage,
  DialogSubtitle,
  DialogDescription,
  DialogContainer,
  DialogClose,
} from './Dialog';
import { Row } from 'react-bootstrap';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

export default function Event({ event }) {
  return (
    <Row key={event.id} className="timeline-event">
      <div className="timeline-date">
        <div className="date-box">
          <span className="date-day">{format(new Date(event.date), 'dd')}</span>
          <span className="date-month">
            {format(new Date(event.date), 'LLL', { locale: es })}
          </span>
        </div>
      </div>
      <div className="timeline-dialog">
        <Dialog transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}>
          <DialogTrigger className="timeline-dialog-trigger">
            <div className="timeline-dialog-preview">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="timeline-event-thumbnail"
              />
              <div className="timeline-event-info">
                <h5 className="timeline-event-title">{event.title}</h5>
                <p className="timeline-event-subtitle">{event.subtitle}</p>
              </div>
            </div>
            <div className="btn-container">
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon"
              >
                <span className="btn-text">Inscribirse</span>
                <FontAwesomeIcon icon={faClipboardCheck} />
              </a>
            </div>
          </DialogTrigger>
          <DialogContainer>
            <DialogContent className="timeline-dialog-content">
              <DialogImage
                src={event.imageUrl}
                alt={event.title}
                className="timeline-dialog-content-image"
              />
              <div className="timeline-dialog-body">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <DialogTitle className="timeline-dialog-title-content">
                    {event.title}
                  </DialogTitle>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-inscripcion"
                  >
                    Inscribirse <FontAwesomeIcon icon={faClipboardCheck} />
                  </a>
                </div>
                <DialogSubtitle className="timeline-dialog-subtitle-content">
                  {event.subtitle}
                </DialogSubtitle>
                <p className="timeline-event-date-time">
                  {format(new Date(event.date), 'dd MMM yyyy', { locale: es })}{' '}
                  a las {format(new Date(event.date), 'HH:mm', { locale: es })}{' '}
                  en {event.location}
                </p>
                <DialogDescription>
                  <p className="timeline-dialog-text">{event.description}</p>
                </DialogDescription>
              </div>
              <DialogClose className="timeline-dialog-close-button" />
            </DialogContent>
          </DialogContainer>
        </Dialog>
      </div>
    </Row>
  );
}
