import HeroSlider from '../components/HeroSlider';
import FeatureCards from '../components/FeatureCards';
import Testimonial from '../components/Testimonial';
import ZellePromo from '../components/ZellePromo';
import AboutUs from '../components/AboutUs';
import Careers from '../components/Careers';
import Locations from '../components/Locations';

function LandingPage() {
  return (
    <>
      <HeroSlider />
      <FeatureCards />
      <Testimonial />
      <ZellePromo />
      <AboutUs />
      <Careers />
      <Locations />
    </>
  );
}

export default LandingPage;