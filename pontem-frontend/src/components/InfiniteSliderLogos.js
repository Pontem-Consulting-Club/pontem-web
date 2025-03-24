import { InfiniteSlider } from './InfiniteSlider';
import '../App.css';

export default function InfiniteSliderLogos() {
    const logos = [
        'Aurys.png',
        'Bain&Co.png',
        'BCG.png',
        'Deloitte.png',
        'Fix.png',
        'GudCompany.png',
        'Mastercard.png',
        'MatrixConsulting.png',
        'McKinsey&Co.png',
        'Montblanc.png',
        'PwC.png',
        'Summa.png',
        'TheHouse.png',
        'Vinson.png',
        'VirtusPartners.png',
    ];

    return (
        <div>
            <div className='soft-shadow'>
                <div className="section-text">
                    <h3>Consultoras que impulsan el talento</h3>
                    <p>
                        Gracias a nuestra colaboración con estas consultoras líderes, ofrecemos a los 
                        estudiantes oportunidades de desarrollo profesional y la posibilidad de 
                        trabajar en proyectos que impactan en el mundo real.
                    </p>
                </div>
            </div>
            <InfiniteSlider gap={100} reverse style={{ paddingBottom: '5%' }}>
                {logos.map((logo, index) => {
                    const imagePath = `logos_consultoras/${logo}`;
                    return (
                        <img
                            key={index}
                            src={imagePath}
                            alt={logo.split('.')[0]}
                            style={{ height: '65px', width: 'auto' }}
                        />
                    );
                })}
            </InfiniteSlider>
            <div className='padding-slider'></div>
        </div>
    );
}
