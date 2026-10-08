import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { findContentByExternalId, registerContent } from '../api';
import { getTrackDetail } from '../discoverApi';
import { abbreviateNumbersInText } from '../utils/format';
import ReviewPanel from './ReviewPanel';
import { SkeletonTrackDetail } from './Skeleton';

const SOURCE_APP = 'tapebeat';

export default function TrackDetailPage({ sessionUser, onLoginClick }) {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [track, setTrack] = useState(location.state?.track || null);
  const [contentId, setContentId] = useState(null);
  const [albumDetail, setAlbumDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [reviewStats, setReviewStats] = useState({
    count: 0,
    average: null,
    yourRating: null,
    distribution: [0, 0, 0, 0, 0],
  });
  const [linkCopied, setLinkCopied] = useState(false);

  const token = localStorage.getItem('tapecloud_token');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const item = await findContentByExternalId(trackId).catch(() => null);
        if (cancelled) {
          return;
        }

        if (item) {
          setContentId(item.id);
          if (!track) {
            setTrack(item);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [trackId, track]);

  useEffect(() => {
    const artist = track?.subtitle || track?.genre;
    if (!track?.title || !artist) {
      return;
    }

    let cancelled = false;
    getTrackDetail(SOURCE_APP, artist, track.title).then((detail) => {
      if (!cancelled) {
        setAlbumDetail(detail);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [track]);

  async function handleRegisterContent() {
    // Los temas que vienen del descubrimiento todavía no existen como ContentItem.
    const registered = await registerContent(token, { ...track, externalId: trackId });
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
        <SkeletonTrackDetail />
      </main>
    );
  }

  if (!track) {
    return (
      <main className="app-main">
        <div className="detail-page">
          <h1>Canción no encontrada</h1>
          <button type="button" onClick={() => navigate('/catalog')}>
            Volver al catálogo
          </button>
        </div>
      </main>
    );
  }

  const artist = track.subtitle || track.genre;
  // La descripción trae Artista, N oyentes, N reproducciones
  const plays = track.description?.includes('·')
    ? abbreviateNumbersInText(track.description.split('·').slice(1).join(' · ').trim())
    : null;

  const shareText = `Mirá "${track.title}" en TapeBeat`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
  const maxDistribution = Math.max(1, ...reviewStats.distribution);
  const trackPosition = albumDetail?.albumTracks
    ? albumDetail.albumTracks.findIndex((name) => name.toLowerCase() === track.title.toLowerCase()) + 1 || null
    : null;

  return (
    <main className="app-main">
      <header className="topbar detail-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/catalog')}
          title="Volver al catálogo"
        >
          ← Catálogo
        </button>
      </header>

      <section className="detail-page">
        <div className="detail-hero">
          {track.imageUrl && (
            <img className="detail-poster detail-cover" src={track.imageUrl} alt={track.title} />
          )}

          <div className="detail-info">
            <h1>{track.title}</h1>
            {artist && (
              <button
                type="button"
                className="artist-link"
                onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
              >
                {artist}
              </button>
            )}

            {plays && (
              <div className="detail-stats">
                <span className="stat-pill">{plays}</span>
              </div>
            )}
          </div>

          <div className="entity-hero__right">
            <div className="entity-hero__stats">
              <div className="entity-hero__stat">
                <strong>{reviewStats.count}</strong>
                <span>Calificaciones</span>
              </div>
              <div className="entity-hero__stat">
                <strong>★ {reviewStats.average ? reviewStats.average.toFixed(1) : '—'}/5</strong>
                <span>Promedio</span>
              </div>
              <div className="entity-hero__stat">
                <strong>☆ {reviewStats.yourRating ?? 0}/5</strong>
                <span>Tu calificación</span>
              </div>
            </div>

            {!(sessionUser && reviewStats.yourRating != null) && (
              <button type="button" className="entity-hero__cta" onClick={handleRateClick}>
                {sessionUser ? '★ Calificar esta canción' : '🔒 Iniciá sesión para calificar'}
              </button>
            )}
          </div>
        </div>

        <nav className="entity-tabs">
          {[
            { value: 'home', label: 'Inicio' },
            { value: 'reviews', label: 'Reseñas' },
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
                  <h2 className="subsection-title">Información</h2>
                  <div className="information-panel">
                    {reviewStats.count > 0 && (
                      <div className="rating-distribution rating-distribution--wide">
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
                    )}

                    <div className="information-grid">
                      <div className="information-cell">
                        <h4>Álbum</h4>
                        {albumDetail?.albumName ? (
                          <p>
                            {trackPosition ? `Track ${trackPosition} en ` : ''}
                            <button
                              type="button"
                              className="information-cell__link"
                              onClick={() =>
                                navigate(`/album/${encodeURIComponent(artist)}/${encodeURIComponent(albumDetail.albumName)}`, {
                                  state: { currentTrack: track.title },
                                })
                              }
                            >
                              {albumDetail.albumName}
                            </button>
                          </p>
                        ) : (
                          <p className="information-cell__empty">Sin datos del álbum.</p>
                        )}
                      </div>

                      <div className="information-cell">
                        <h4>Artistas</h4>
                        {artist ? (
                          <button
                            type="button"
                            className="information-cell__link"
                            onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
                          >
                            {artist}
                          </button>
                        ) : (
                          <p className="information-cell__empty">—</p>
                        )}
                      </div>

                      {albumDetail?.durationSeconds > 0 && (
                        <div className="information-cell">
                          <h4>Duración</h4>
                          <p>
                            {Math.floor(albumDetail.durationSeconds / 60)} minutos{' '}
                            {albumDetail.durationSeconds % 60} segundos
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {albumDetail?.albumName && (
                  <section className="section-block">
                    <h2 className="subsection-title">Del álbum</h2>
                    <div className="track-album-card">
                      {albumDetail.albumImageUrl && (
                        <img
                          className="track-album-card__cover"
                          src={albumDetail.albumImageUrl}
                          alt={albumDetail.albumName}
                        />
                      )}
                      <div className="track-album-card__info">
                        <button
                          type="button"
                          className="track-album-card__title-link"
                          onClick={() =>
                            navigate(`/album/${encodeURIComponent(artist)}/${encodeURIComponent(albumDetail.albumName)}`, {
                              state: { currentTrack: track.title },
                            })
                          }
                        >
                          {albumDetail.albumName}
                        </button>
                        {albumDetail.albumTrackCount > 0 && (
                          <p className="track-album-card__meta">{albumDetail.albumTrackCount} canciones</p>
                        )}
                        <p className="track-album-card__description">
                          {albumDetail.albumDescription || 'Todavía no hay una descripción de este álbum.'}
                        </p>
                      </div>
                    </div>
                  </section>
                )}
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
                  emptyMessage="No hay reseñas para esta canción aún."
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

            {albumDetail?.albumTracks?.length > 0 && (
              <div className="entity-sidebar__panel">
                <h3>Canciones del álbum</h3>
                <div className="tracklist">
                  {albumDetail.albumTracks.map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                      className={`tracklist-item ${
                        name.toLowerCase() === track.title.toLowerCase() ? 'is-current' : ''
                      }`}
                    >
                      <span className="tracklist-item__index">{index + 1}</span>
                      <span className="tracklist-item__name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
