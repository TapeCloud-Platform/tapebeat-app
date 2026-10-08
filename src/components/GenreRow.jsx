import { useEffect, useRef, useState } from 'react';
import { discover } from '../discoverApi';
import TrackCard from './TrackCard';
import { SkeletonBlock } from './Skeleton';

const SOURCE_APP = 'tapebeat';
const ROW_LIMIT = 14;
const SCROLL_STEP = 380;

/** Fila horizontal con las canciones de un género, cargada de forma independiente. */
export default function GenreRow({ genre }) {
  const [tracks, setTracks] = useState(null);
  const trackRef = useRef(null);

  function scrollBy(amount) {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  useEffect(() => {
    let cancelled = false;
    discover(SOURCE_APP, { type: 'genre', value: genre.value, limit: ROW_LIMIT })
      .then((data) => {
        if (!cancelled) {
          setTracks(
            (data || [])
              .filter((item) => item.kind !== 'artist')
              .map((item) => ({ ...item, id: item.externalId }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTracks([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [genre.value]);

  if (tracks !== null && tracks.length === 0) {
    return null;
  }

  return (
    <div className="top-slider">
      <div className="top-slider__head">
        <h3 className="subsection-title">{genre.label}</h3>
      </div>

      <button
        type="button"
        className="top-slider__arrow top-slider__arrow--prev"
        onClick={() => scrollBy(-SCROLL_STEP)}
        aria-label="Anterior"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="top-slider__arrow top-slider__arrow--next"
        onClick={() => scrollBy(SCROLL_STEP)}
        aria-label="Siguiente"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="top-slider__track" ref={trackRef}>
        {tracks === null
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="top-slider__item">
                <SkeletonBlock className="skeleton--poster" />
                <SkeletonBlock className="skeleton--line" style={{ width: '85%' }} />
                <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
              </div>
            ))
          : tracks.map((track) => (
              <div key={track.id} className="top-slider__item">
                <TrackCard track={track} />
              </div>
            ))}
      </div>
    </div>
  );
}
