import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  function open() {
    navigate(`/artist/${encodeURIComponent(artist.title)}`);
  }

  return (
    <article
      className="artist-card"
      onClick={open}
      role="button"
      tabIndex="0"
      onKeyDown={(event) => event.key === 'Enter' && open()}
    >
      <div className="artist-avatar">
        {artist.imageUrl ? (
          <img src={artist.imageUrl} alt={artist.title} />
        ) : (
          <span>{artist.title?.[0] || '♪'}</span>
        )}
      </div>
      <h3>{artist.title}</h3>
      <small>{artist.description}</small>
    </article>
  );
}
