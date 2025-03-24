import React from 'react';
import Timeline from './Timeline';
import HeaderBanner from './HeaderBanner';

const headerBannerImage = '/BTGDay.jpeg';

function Events() {
    return (
        <div>
            <HeaderBanner imageSrc={headerBannerImage} title="Nuestros Eventos" />
            <Timeline />
        </div>
    );
}

export default Events;