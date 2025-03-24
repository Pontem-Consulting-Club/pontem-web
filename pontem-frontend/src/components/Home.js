import React from 'react';

import IntroductionSection from './IntroductionSection';
import SocialConsultingSection from './SocialConsultingSection';
import InfiniteSliderLogos from './InfiniteSliderLogos';
import NextEvents from './NextEvents';
import SmallNewsSection from './SmallNewsSection';
import SocialMediaLinks from './SocialMediaLinks';

function Home() {
  return (
    <div>
      <IntroductionSection />
      <SocialConsultingSection />
      <InfiniteSliderLogos />
      <div className="next-events-container">
        <NextEvents />
      </div>
      <SmallNewsSection />
      <SocialMediaLinks />
    </div>
  );
}

export default Home;