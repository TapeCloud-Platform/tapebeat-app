import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { findContentByExternalId, registerContent } from '../api';
import { getAlbumDetail } from '../discoverApi';
import { SkeletonAlbumDetail } from './Skeleton';
import ReviewPanel from './ReviewPanel';
import StarRating from './StarRating';
import { LockIcon } from './icons';

const SOURCE_APP = 'tapebeat';
const SOURCE_TYPE = 'album';
const COLLAPSED_TRACKS = 8;

export default function AlbumDetailPage({ sessionUser, onLoginClick }) {
  const { artist: artistParam, albumName: albumParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const artist = decodeURIComponent(artistParam);
  const albumName = decodeURIComponent(albumParam);
  const currentTrack = location.state?.currentTrack || null;

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('home');
  const [contentId, setContentId] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    count: 0,
    average: null,
    yourRating: null,
    distribution: [0, 0, 0, 0, 0],
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  const albumExternalId = `album:${artist}:${albumName}`;
  const token = localStorage.getItem('tapecloud_token');

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

  useEffect(() => {
    let cancelled = false;
    findContentByExternalId(albumExternalId, SOURCE_TYPE)
      .then((item) => {
        if (!cancelled && item) {
          setContentId(item.id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [albumExternalId]);

  async function handleRegisterContent() {
    const registered = await registerContent(
      token,
      {
        externalId: albumExternalId,
        title: albumName,
        description: artist,
        imageUrl: album?.albumImageUrl || '',
        genre: artist,
      },
      SOURCE_TYPE,
    );
    setContentId(registered.id);
    return registered.id;
  }

  function handleRateClick() {
    if (!sessionUser) {
      onLoginClick?.();
      return;
    }
    setTab('reviews');
  }

  function copyLink() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(() => {});
  }

  if (loading) {
    return (
      <main className="app-main">
        <SkeletonAlbumDetail />
      </main>
    );
  }

  if (error || !album) {
    return (
      <main className="app-main">
        <header className="topbar detail-topbar">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </header>
        <p className="error">{error || 'No se pudo cargar el álbum.'}</p>
      </main>
    );
  }

  const tracks = album.albumTracks || [];
  const visibleTracks = showAllTracks ? tracks : tracks.slice(0, COLLAPSED_TRACKS);
  const maxDistribution = Math.max(1, ...reviewStats.distribution);
  const shareText = `Mirá "${albumName}" de ${artist} en TapeBeat`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;

  function openTrack(name) {
    const trackId = `${artist}-${name}`;
    navigate(`/track/${encodeURIComponent(trackId)}`, {
      state: {
        track: {
          externalId: trackId,
          title: name,
          subtitle: artist,
          genre: artist,
          description: artist,
          imageUrl: album.albumImageUrl || '',
        },
        currentTrack: name,
      },
    });
  }

  return (
    <main className="app-main">
      <header className="topbar detail-topbar">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </header>

      <section className="detail-page">
        <div className="detail-hero">
          {album.albumImageUrl && (
            <img className="detail-poster detail-cover" src={album.albumImageUrl} alt={albumName} />
          )}

          <div className="detail-info">
            <p className="eyebrow">Álbum</p>
            <h1>{albumName}</h1>
            <button
              type="button"
              className="artist-link"
              onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
            >
              {artist}
            </button>
            {album.albumTrackCount > 0 && (
              <div className="detail-stats">
                <span className="stat-pill">{album.albumTrackCount} canciones</span>
                {reviewStats.count > 0 && (
                  <span className="stat-pill rating">
                    ★ {reviewStats.average != null ? reviewStats.average.toFixed(1) : '—'}/5 ·{' '}
                    {reviewStats.count} {reviewStats.count === 1 ? 'calificación' : 'calificaciones'}
                  </span>
                )}
              </div>
            )}
            {album.albumDescription && (
              <p className="track-album-card__description">{album.albumDescription}</p>
            )}
          </div>

          <div className="entity-hero__right">
            <div className="entity-hero__stats">
              <div className="entity-hero__stat">
                <strong>{reviewStats.count}</strong>
                <span>Calificaciones</span>
              </div>
              <div className="entity-hero__stat">
                <strong>★ {reviewStats.average != null ? reviewStats.average.toFixed(1) : '—'}/5</strong>
                <span>Promedio</span>
              </div>
              <div className="entity-hero__stat">
                <strong>☆ {reviewStats.yourRating ?? 0}/5</strong>
                <span>Tu calificación</span>
              </div>
            </div>

            {!(sessionUser && reviewStats.yourRating != null) && (
              <button type="button" className="entity-hero__cta" onClick={handleRateClick}>
                {sessionUser ? (
                  '★ Calificar este álbum'
                ) : (
                  <>
                    <LockIcon size={15} /> Iniciá sesión para calificar
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <nav className="entity-tabs">
          {[
            { value: 'home', label: 'Inicio' },
            { value: 'reviews', label: `Reseñas${reviewStats.count > 0 ? ` (${reviewStats.count})` : ''}` },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`entity-tabs__item ${tab === option.value ? 'is-active' : ''}`}
              onClick={() => setTab(option.value)}
            >
              {option.label}
            </button>
          ))}
        </nav>

        <div className="entity-layout">
          <div className="entity-main">
            {tab === 'home' && (
              <>
                <section className="section-block">
                  <div className="tracklist-header">
                    <h2 className="subsection-title tracklist-header__title">
                      Tracklist <span className="count-badge">{tracks.length}</span>
                    </h2>
                    {tracks.length > COLLAPSED_TRACKS && (
                      <button
                        type="button"
                        className="tracklist-toggle"
                        onClick={() => setShowAllTracks((v) => !v)}
                        aria-expanded={showAllTracks}
                      >
                        {showAllTracks ? 'Ver menos ▲' : `Ver las ${tracks.length} ▾`}
                      </button>
                    )}
                  </div>

                  {tracks.length > 0 ? (
                    <div className="tracklist tracklist--page tracklist--rich">
                      {visibleTracks.map((name, index) => {
                        const position = showAllTracks ? index + 1 : tracks.indexOf(name) + 1 || index + 1;
                        const isCurrent =
                          currentTrack && name.toLowerCase() === currentTrack.toLowerCase();
                        return (
                          <button
                            key={`${name}-${index}`}
                            type="button"
                            title={`Abrir "${name}"`}
                            className={`tracklist-item tracklist-item--clickable ${isCurrent ? 'is-current' : ''}`}
                            onClick={() => openTrack(name)}
                          >
                            <span className="tracklist-item__index">{position}</span>
                            <span className="tracklist-item__body">
                              <span className="tracklist-item__name">{name}</span>
                              <span className="tracklist-item__artist">{artist}</span>
                            </span>
                            <span className="tracklist-item__chevron" aria-hidden="true">
                              ›
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="no-reviews">Todavía no hay canciones registradas para este álbum.</p>
                  )}
                </section>

                <section className="section-block">
                  <h2 className="subsection-title">Estadística de rating</h2>
                  <div className="information-panel">
                    {reviewStats.count > 0 ? (
                      <div className="rating-distribution rating-distribution--wide">
                        <div className="rating-summary">
                          <strong className="rating-summary__value">
                            ★ {reviewStats.average != null ? reviewStats.average.toFixed(1) : '—'}/5
                          </strong>
                          <StarRating value={reviewStats.average ?? 0} size="sm" />
                          <span className="rating-summary__count">
                            {reviewStats.count} {reviewStats.count === 1 ? 'calificación' : 'calificaciones'}
                            {reviewStats.yourRating != null && ` · Tu nota: ${reviewStats.yourRating}/5`}
                          </span>
                          <button
                            type="button"
                            className="rating-summary__cta"
                            onClick={() => setTab('reviews')}
                          >
                            Ver reseñas
                          </button>
                        </div>
                        {reviewStats.distribution.map((count, index) => (
                          <div key={index} className="rating-distribution__bar-row">
                            <span>{index + 1}★</span>
                            <span className="rating-distribution__track">
                              <span
                                className="rating-distribution__fill"
                                style={{ width: `${(count / maxDistribution) * 100}%` }}
                              />
                            </span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rating-distribution rating-distribution--wide">
                        <p className="no-reviews">
                          Este álbum todavía no tiene calificaciones.{' '}
                          <button type="button" className="information-cell__link" onClick={handleRateClick}>
                            Sé el primero en calificarlo
                          </button>
                        </p>
                      </div>
                    )}

                    <div className="information-grid">
                      <div className="information-cell">
                        <h4>Álbum</h4>
                        <p>{albumName}</p>
                      </div>
                      <div className="information-cell">
                        <h4>Artista</h4>
                        <button
                          type="button"
                          className="information-cell__link"
                          onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
                        >
                          {artist}
                        </button>
                      </div>
                      <div className="information-cell">
                        <h4>Canciones</h4>
                        <p>{album.albumTrackCount > 0 ? `${album.albumTrackCount} temas` : '—'}</p>
                      </div>
                      <div className="information-cell">
                        <h4>Promedio</h4>
                        <p>
                          {reviewStats.average != null
                            ? `★ ${reviewStats.average.toFixed(1)}/5 en ${reviewStats.count}`
                            : 'Sin calificaciones'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {tab === 'reviews' && (
              <section className="section-block">
                <h2 className="subsection-title">Reseñas y comentarios</h2>
                <ReviewPanel
                  contentId={contentId}
                  onRegister={handleRegisterContent}
                  sessionUser={sessionUser}
                  onLoginClick={onLoginClick}
                  emptyMessage="No hay reseñas para este álbum aún."
                  onStatsChange={setReviewStats}
                />
              </section>
            )}
          </div>

          <aside className="entity-sidebar">
            <div className="entity-sidebar__actions">
              <button type="button" onClick={handleRateClick}>
                Escribir reseña
              </button>
              <div className="entity-sidebar__share">
                <button type="button" onClick={copyLink}>
                  {linkCopied ? 'Copiado ✓' : 'Copiar enlace'}
                </button>
                <a href={twitterShareUrl} target="_blank" rel="noreferrer">
                  Compartir en X
                </a>
              </div>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
