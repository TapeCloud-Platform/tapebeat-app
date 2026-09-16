import { useRef } from 'react';
import { Button } from '@heroui/react';
import TrackCard from './TrackCard';

const SCROLL_STEP = 380;

/** Carrusel horizontal con flechas para la sección de más escuchadas. */
export default function TopSlider({ title, tracks }) {
  const trackRef = useRef(null);

  function scrollBy(amount) {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="top-slider">
      <div className="top-slider__head">
        <h3 className="subsection-title">{title}</h3>
        <div className="top-slider__nav">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="top-slider__arrow"
            onClick={() => scrollBy(-SCROLL_STEP)}
            aria-label="Anterior"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="top-slider__arrow"
            onClick={() => scrollBy(SCROLL_STEP)}
            aria-label="Siguiente"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="top-slider__track" ref={trackRef}>
        {tracks.map((track, index) => (
          <div key={track.id} className="top-slider__item">
            <span className="top-slider__rank">{index + 1}</span>
            <TrackCard track={track} variant="hero" />
          </div>
        ))}
      </div>
    </div>
  );
}
