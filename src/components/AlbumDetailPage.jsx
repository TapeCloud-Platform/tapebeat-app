import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAlbumDetail } from '../discoverApi';
import { SkeletonCatalogGrid } from './Skeleton';

const SOURCE_APP = 'tapebeat';

export default function AlbumDetailPage() {
  const { artist: artistParam, albumName: albumParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const artist = decodeURIComponent(artistParam);
  const albumName = decodeURIComponent(albumParam);
  const currentTrack = location.state?.currentTrack || null;

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const detail = await getAlbumDetail(SOURCE_APP, artist, albumName);
        if (!cancelled) {
          if (detail) {
            setAlbum(detail);
          } else {
            setError('No se pudo cargar el álbum.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [artist, albumName]);

  if (loading) {
    return (
      <main className="app-main">
        <div className="detail-page">
          <SkeletonCatalogGrid count={4} />
        </div>
      </main>
    );
  }

  return (
    <main className="app-main">
      <header className="topbar detail-topbar">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {album && (
        <section className="detail-page">
          <div className="track-album-card track-album-card--hero">
            {album.albumImageUrl && (
              <img className="track-album-card__cover" src={album.albumImageUrl} alt={album.albumName} />
            )}
            <div className="track-album-card__info">
              <h1>{album.albumName}</h1>
              <button
                type="button"
                className="artist-link"
                onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
              >
                {artist}
              </button>
              {album.albumTrackCount > 0 && (
                <p className="track-album-card__meta">{album.albumTrackCount} canciones</p>
              )}
              <p className="track-album-card__description">
                {album.albumDescription || 'Todavía no hay una descripción de este álbum.'}
              </p>
            </div>
          </div>

          {album.albumTracks?.length > 0 && (
            <section className="section-block">
              <h2 className="subsection-title">Canciones</h2>
              <div className="tracklist tracklist--page">
                {album.albumTracks.map((name, index) => (
                  <div
                    key={`${name}-${index}`}
                    className={`tracklist-item ${
                      currentTrack && name.toLowerCase() === currentTrack.toLowerCase() ? 'is-current' : ''
                    }`}
                  >
                    <span className="tracklist-item__index">{index + 1}</span>
                    <span className="tracklist-item__name">{name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      )}
    </main>
  );
}
