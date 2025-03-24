import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogImage,
  DialogSubtitle,
  DialogClose,
  DialogDescription,
  DialogContainer,
} from './Dialog';
import { Container, Row } from 'react-bootstrap';
import { PlusIcon } from 'lucide-react';
import '../styles/Dialog.css';
import '../App.css';
import api from '../api';
import socialConsultingData from '../data/ConsultoriaSocial';
import { animateScroll as scroll } from 'react-scroll';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function DialogBasicOne() {
  const [cardsData, setCardsData] = useState([]);

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        const response = await api.get('/projects/social-consulting');
        const data = response.data;

        // Fetch images from Supabase
        const updatedData = await Promise.all(
          data.map(async (card) => {
            const { data: imageData, error } = await supabase.storage
              .from('images')
              .download(card.image_url);

            if (error) {
              console.error('Error fetching image:', error);
              return card;
            }

            const image_url = URL.createObjectURL(imageData);
            return { ...card, image_url };
          })
        );

        setCardsData(updatedData);
      } catch (error) {
        console.error('Error fetching cards data:', error);
      }
    };

    fetchCardsData();
  }, []);

  const handleOpenDialog = () => {
    scroll.scrollToTop({ behavior: 'smooth' });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <div id="consultoria-social" className="section-text">
          <h3>{socialConsultingData.title}</h3>
          <p>{socialConsultingData.text1}</p>
          <p>{socialConsultingData.text2}</p>
        </div>
      </Row>
      <Row className="justify-content-center">
        {cardsData.map((card) => (
          <Dialog
            key={card.id}
            transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}
          >
            <DialogTrigger
              className="dialog-trigger"
              onClick={handleOpenDialog}
            >
              <DialogImage
                src={card.image_url}
                alt={card.title}
                className="dialog-image"
              />
              <div className="dialog-info">
                <div>
                  <DialogTitle className="dialog-title-text">
                    {card.title}
                  </DialogTitle>
                  <DialogSubtitle className="dialog-subtitle-text">
                    {card.subtitle}
                  </DialogSubtitle>
                </div>
                <button
                  type="button"
                  className="dialog-plus-button"
                  aria-label="Open dialog"
                >
                  <PlusIcon size={24} />
                </button>
              </div>
            </DialogTrigger>
            <DialogContainer>
              <DialogContent className="dialog-content">
                <DialogImage
                  src={card.image_url}
                  alt={card.title}
                  className="dialog-content-image"
                />
                <div className="dialog-body">
                  <a
                    className="dialog-link"
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                  >
                    {card.link_text}
                  </a>
                  <DialogTitle className="dialog-title-content">
                    {card.title}
                  </DialogTitle>
                  <DialogSubtitle className="dialog-subtitle-content">
                    {card.subtitle}
                  </DialogSubtitle>
                  <DialogDescription>
                    <p className="dialog-text">{card.description}</p>
                  </DialogDescription>
                </div>
                <DialogClose className="dialog-close-button" />
              </DialogContent>
            </DialogContainer>
          </Dialog>
        ))}
      </Row>
    </Container>
  );
}
