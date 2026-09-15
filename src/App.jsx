import { useEffect } from 'react';
import Hero from './components/Hero';
import OurStory from './components/OurStory';
import Proposal from './components/Proposal';
import Invitation from './components/Invitation';
import ScratchDate from './components/ScratchDate';
import Countdown from './components/Countdown';
import Events from './components/Events';
import Family from './components/Family';
import RSVP from './components/RSVP';
import Messages from './components/Messages';
import Footer from './components/Footer';
import MusicToggle from './components/MusicToggle';

function App() {
  useEffect(() => {
    // Disable automatic browser scroll restoration on refresh so page always starts at top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="global-bg" aria-hidden="true">
        <div className="global-bg-canvas"></div>
        <div className="pastel-orb orb-1"></div>
        <div className="pastel-orb orb-2"></div>
        <div className="pastel-orb orb-3"></div>
        <div className="pastel-orb orb-4"></div>
      </div>
      <div className="paper-texture"></div>
      <MusicToggle />
      <main>
        <Hero />
        <OurStory />
        <Proposal />
        <Invitation />
        <ScratchDate />
        <Countdown />
        <Events />
        <Family />
        <RSVP />
        <Messages />
      </main>
      <Footer />
    </>
  );
}

export default App;
