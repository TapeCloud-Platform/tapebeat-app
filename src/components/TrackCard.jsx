import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@heroui/react';
import { abbreviateNumbersInText } from '../utils/format';

export default function TrackCard({ track, variant }) {
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/track/${encodeURIComponent(track.id)}`, { state: { track } });
  }

  return (
    <Card
      variant="transparent"
      className={`movie-card${variant ? ` movie-card--${variant}` : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && handleClick()}
    >
      <div className="poster-container cover-container">
        {track.imageUrl ? (
          <img className="poster-image" src={track.imageUrl} alt={track.title} />
        ) : (
          <div className="poster">{track.title?.[0] || '♪'}</div>
        )}

        {showPreview && (
          <div className="preview-overlay">
            <p className="preview-text">
              {abbreviateNumbersInText(track.description) || 'Sin datos de reproducción'}
            </p>
            <span className="click-hint">Ver más</span>
          </div>
        )}
      </div>

      <h3>{track.title}</h3>
      <div className="movie-footer">
        <small>{track.subtitle}</small>
      </div>
    </Card>
  );
}
