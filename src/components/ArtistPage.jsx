import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discover, getProfile } from '../discoverApi';
import { formatCompactNumber } from '../utils/format';

const TABS = [
  { value: 'album', label: 'Álbumes' },
  { value: 'single', label: 'Singles y EPs' },
  { value: 'other', label: 'Compilados y directos' },
];

export default function ArtistPage() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [releases, setReleases] = useState([]);
  const [tab, setTab] = useState('album');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const decodedName = decodeURIComponent(artistName);

  const counts = {
    album: releases.filter((item) => item.kind === 'album').length,
    single: releases.filter((item) => item.kind === 'single').length,
    other: releases.filter((item) => item.kind === 'other').length,
  };
  const visible = releases.filter((item) => item.kind === tab);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const [profileData, albumData] = await Promise.all([
          getProfile('tapebeat', decodedName),
          discover('tapebeat', { type: 'discography', value: decodedName, limit: 40 }),
        ]);
        if (!cancelled) {
          setProfile(profileData);
          setReleases(albumData || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudo cargar el artista.');
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
  }, [decodedName]);

  return (
    <main className="app-main">
      <header className="topbar detail-topbar">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </header>

      <section className="artist-profile">
        <div className="artist-profile-avatar">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} />
          ) : (
            <span>{decodedName[0] || '♪'}</span>
          )}
        </div>

        <div className="artist-profile-info">
          <p className="eyebrow">Artista</p>
          <h1>{profile?.name || decodedName}</h1>

          {profile && (
            <div className="artist-stats">
              <span>
                <strong>{formatCompactNumber(profile.listeners)}</strong> oyentes
              </span>
              <span>
                <strong>{formatCompactNumber(profile.playcount)}</strong> reproducciones
              </span>
            </div>
          )}

          {profile?.tags?.length > 0 && (
            <div className="artist-tags">
              {profile.tags.map((tag) => (
                <span key={tag} className="artist-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {profile?.bio && <p className="artist-bio">{profile.bio}</p>}

          {profile?.similar?.length > 0 && (
            <div className="artist-similar">
              <span className="artist-similar-label">Artistas similares:</span>
              {profile.similar.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="artist-similar-link"
                  onClick={() => navigate(`/artist/${encodeURIComponent(name)}`)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <h2>Discografía</h2>
          {!loading && <span className="count-badge">{visible.length} resultados</span>}

          <div className="release-tabs">
            {TABS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`release-tab${tab === option.value ? ' is-active' : ''}`}
                onClick={() => setTab(option.value)}
              >
                {option.label}
                <span className="release-tab-count">{counts[option.value]}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading-text">Cargando...</p>
        ) : (
          <div className="cards-grid">
            {visible.map((album) => (
              <article key={album.externalId} className="movie-card album-card">
                <div className="poster-container">
                  {album.imageUrl ? (
                    <img
                      className="poster-image"
                      src={album.imageUrl}
                      alt={album.title}
                      onError={(event) => {
                        // Cover Art Archive no tiene portada para todos los álbumes.
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="poster">{album.title?.[0] || '♪'}</div>
                  )}
                </div>
                <h3>{album.title}</h3>
                <div className="movie-footer">
                  <small>{album.description}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
