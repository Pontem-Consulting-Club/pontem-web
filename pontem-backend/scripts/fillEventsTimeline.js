const db = require('../src/db');

const fillEventsTimeline = async () => {
  const timelineData = [
    {
      id: 1,
      title: "Crack The Case",
      subtitle: "Mastercard",
      description: "Instancia en donde se resolverán casos reales de la consultora. Junto a los consultores de Mastercard, aprenderás a enfrentar desafíos y a desarrollar habilidades de resolución de problemas.",
      date: "2024-10-12T13:30:00",
      imageUrl: "logos_consultoras/Mastercard.png",
      location: "Sala A5, Campus San Joaquín",
      link: "https://link-evento1.com"
    },
    {
      id: 2,
      title: "CV Workshop",
      subtitle: "McKinsey & Company",
      description: "Descripción detallada del evento 2.",
      date: "2024-11-16T22:00:00",
      imageUrl: "logos_consultoras/McKinsey&Co.png",
      location: "Sala B, Campus Norte",
      link: "https://link-evento2.com"
    },
    {
      id: 3,
      title: "Networking Night",
      subtitle: "Bain & Company",
      description: "Descripción detallada del evento 3.",
      date: "2024-12-10T18:00:00",
      imageUrl: "logos_consultoras/Bain&Co.png",
      location: "Sala C, Campus Oriente",
      link: "https://link-evento3.com"
    },
    {
      id: 4,
      title: "Case Workshop",
      subtitle: "Boston Consulting Group",
      description: "Descripción detallada del evento 4.",
      date: "2025-01-20T14:00:00",
      imageUrl: "logos_consultoras/BCG.png",
      location: "Sala D, Campus San Joaquín",
      link: "https://link-evento4.com"
    },
    {
      id: 5,
      title: "CV Workshop",
      subtitle: "McKinsey & Company",
      description: "Descripción detallada del evento 5.",
      date: "2025-02-15T12:00:00",
      imageUrl: "logos_consultoras/McKinsey&Co.png",
      location: "Sala E, Campus Norte",
      link: "https://link-evento5.com"
    },
    {
      id: 6,
      title: "In Office",
      subtitle: "PwC",
      description: "Únete a nosotros para una charla sobre las últimas tendencias en tecnología con expertos de Google.",
      date: "2024-11-01T10:00:00",
      imageUrl: "logos_consultoras/PwC.png",
      location: "Sala F, Campus Central",
      link: "https://link-evento6.com"
    },
    {
      id: 7,
      title: "Networking Night",
      subtitle: "The House",
      description: "Explora el mundo de la innovación con un taller práctico dirigido por Apple.",
      date: "2024-11-20T15:00:00",
      imageUrl: "logos_consultoras/TheHouse.png",
      location: "Sala G, Campus Sur",
      link: "https://link-evento7.com"
    },
    {
      id: 8,
      title: "Crack The Case",
      subtitle: "Virtus Partners",
      description: "Desarrolla tus habilidades de liderazgo con expertos de Amazon en este seminario exclusivo.",
      date: "2024-12-05T09:00:00",
      imageUrl: "logos_consultoras/VirtusPartners.png",
      location: "Sala H, Campus Este",
      link: "https://link-evento8.com"
    }
  ];

  try {
    for (const event of timelineData) {
      await db.query(
        'INSERT INTO "Events" (title, subtitle, description, date, image_url, location, link) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [event.title, event.subtitle, event.description, event.date, event.imageUrl, event.location, event.link]
      );
    }
    console.log('Events timeline data inserted successfully');
  } catch (error) {
    console.error('Error inserting events timeline data:', error.message, error.stack);
  } finally {
    process.exit();
  }
};

fillEventsTimeline(); 