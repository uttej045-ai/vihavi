import "./LandingPage.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import EventCategories from "./components/EventCategories";
import EventHighlights from "./components/EventHighlights";
import HowItWorks from "./components/HowItWorks";
import OrganizerSection from "./components/OrganizerSection";
import Testimonials from "./components/Testimonials";
import Statistics from "./components/Statistics";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <div id="home"><Hero /></div>
        <Statistics />
        <div id="categories" className="section-bg-white"><EventCategories /></div>
        <div className="section-bg-light"><EventHighlights /></div>
        <div className="section-bg-white"><HowItWorks /></div>
        <div id="organizers" className="section-bg-light"><OrganizerSection /></div>
        <div className="section-bg-white"><Testimonials /></div>
        <div id="faq" className="section-bg-light"><FAQ /></div>
        <div className="section-bg-white"><FinalCTA /></div>
      </main>
      <Footer />
    </div>
  );
}
