import { useNavigate } from 'react-router-dom';

/** Mazo de portadas apiladas que se abanican hacia la derecha al pasar el mouse. */
export default function StackedShelf({ tracks }) {
  const navigate = useNavigate();

  if (tracks.length === 0) {
    return null;
  }

  function open(track) {
    navigate(`/track/${encodeURIComponent(track.id)}`, { state: { track } });
  }

  return (
    <div className="stack-shelf">
      <div className="stack-shelf__track">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            className="stack-shelf__item"
            onClick={() => open(track)}
            title={`${track.title} · ${track.subtitle}`}
          >
            {track.imageUrl ? (
              <img src={track.imageUrl} alt="" />
            ) : (
              <span className="stack-shelf__fallback">{track.title?.[0] || '♪'}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
