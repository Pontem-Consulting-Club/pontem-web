import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from 'lucide-react';
import '../styles/StageFlow.css';

const stages = [
  {
    image: 'stage_flow/Stage1.png',
    title: '1. Envío de CV e Inscripción al Proceso',
    description: [
      'Usualmente, se realiza a través de la página web de la empresa. Es importante enviar un CV impecable que destaque tus habilidades y logros relevantes.',
    ],
  },
  {
    image: 'stage_flow/Stage2.png',
    title: '2. Realización de Prueba Analítica',
    description: [
      'Esta etapa suele incluir evaluaciones estilo GMAT, aunque las pruebas pueden variar dependiendo de la consultora. Estas evaluaciones miden habilidades analíticas, de razonamiento lógico y resolución de problemas.',
    ],
  },
  {
    image: 'stage_flow/Stage3.png',
    title: '3. Entrevistas Personales',
    description: [
      'Por lo general, consisten en varias rondas de entrevistas que se dividen en:',
      'Parte Personal (15 min): Una conversación sobre tu experiencia, motivaciones y adecuación al puesto.',
      'Resolución de Caso de Negocio (30 min): Un ejercicio práctico para evaluar tus habilidades de estructuración y análisis.',
      'Preguntas al Entrevistador (5 min): Tu oportunidad para demostrar interés y curiosidad sobre la firma.',
    ],
  },
  {
    image: 'stage_flow/Stage4.png',
    title: '4. ¡Término del Proceso!',
    description: [
      'Si completas todas las etapas con éxito, estarás más cerca de convertirte en consultor estratégico.',
    ],
  },
];

const arrowImage = 'arrow.png'; // Asegúrate de tener esta imagen en el directorio adecuado

const StageFlow = () => {
  const [openStage, setOpenStage] = useState(null);

  const toggleDescription = (index) => {
    setOpenStage(openStage === index ? null : index);
  };

  return (
    <div className="stage-flow">
      {stages.map((stage, index) => (
        <React.Fragment key={index}>
          <div className="stage">
            <div
              className="stage-header"
              onClick={() => toggleDescription(index)}
            >
              <img
                src={stage.image}
                alt={stage.title}
                className="stage-image"
              />
              <h3 className="stage-title">{stage.title}</h3>
              <button className={`stage-toggle-button ${openStage === index ? 'open' : 'closed'}`}>
                <PlusIcon className={openStage !== index ? 'visible' : 'hidden'} />
                <MinusIcon className={openStage === index ? 'visible' : 'hidden'} />
              </button>
            </div>
            <div
              className={`stage-description-container ${
                openStage === index ? 'open' : ''
              }`}
            >
              {stage.description.map((description, index) => (
                <p key={index} className="stage-description">
                  {description}
                </p>
              ))}
            </div>
          </div>
          {index < stages.length - 1 && (
            <img src={arrowImage} alt="Flecha" className="stage-arrow" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StageFlow;
