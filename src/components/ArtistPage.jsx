import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discover, getProfile } from '../discoverApi';
import { findContentByExternalId, getReviews, registerContent } from '../api';
import { SkeletonArtistDetail } from './Skeleton';
import ReviewPanel from './ReviewPanel';

const RELEASE_TABS = [
  { value: 'album', label: 'Álbumes' },
  { value: 'single', label: 'Singles y EPs' },
  { value: 'other', label: 'Compilados y directos' },
];

const TOP_TRACKS_LIMIT = 5;
const SIMILAR_ARTISTS_LIMIT = 5;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function ArtistPage({ sessionUser, onLoginClick }) {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(artistName);

  const [profile, setProfile] = useState(null);
  const [releases, setReleases] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [tab, setTab] = useState('home');
  const [releaseTab, setReleaseTab] = useState('album');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [artistContentId, setArtistContentId] = useState(null);
  const [artistStats, setArtistStats] = useState({ count: 0, average: null, yourRating: null });

  const token = localStorage.getItem('tapecloud_token');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        setTab('home');

        const [profileData, albumData, artistItems] = await Promise.all([
          getProfile('tapebeat', decodedName),
          discover('tapebeat', { type: 'discography', value: decodedName, limit: 40 }),
          discover('tapebeat', { type: 'artist', value: decodedName, limit: 24 }),
        ]);
        if (cancelled) {
          return;
        }

        setProfile(profileData);
        setReleases(albumData || []);

        const artistContent = await findContentByExternalId(decodedName, 'artist').catch(() => null);
        if (!cancelled) {
          setArtistContentId(artistContent?.id ?? null);
        }

        const tracks = (artistItems || [])
          .filter((item) => item.kind !== 'artist')
          .slice(0, TOP_TRACKS_LIMIT);

        // Los temas del descubrimiento todavía no tienen reseñas en TapeCloud hasta que
        // alguien los registra reseñándolos; si no existen como ContentItem, quedan sin calificar.
        const withReviews = await Promise.all(
          tracks.map(async (track) => {
            try {
              const contentItem = await findContentByExternalId(track.externalId);
              if (!contentItem) {
                return { ...track, contentId: null, reviews: [] };
              }
              const reviews = await getReviews(contentItem.id).catch(() => []);
              return { ...track, contentId: contentItem.id, reviews: reviews || [] };
            } catch {
              return { ...track, contentId: null, reviews: [] };
            }
          })
        );
        if (!cancelled) {
          setTopTracks(withReviews);
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

  useEffect(() => {
    const names = profile?.similar?.slice(0, SIMILAR_ARTISTS_LIMIT) || [];
    if (names.length === 0) {
      setSimilarArtists([]);
      return;
    }

    let cancelled = false;
    Promise.all(
      names.map((name) =>
        getProfile('tapebeat', name)
          .then((data) => ({ name, imageUrl: data?.imageUrl || null }))
          .catch(() => ({ name, imageUrl: null }))
      )
    ).then((list) => {
      if (!cancelled) {
        setSimilarArtists(list);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const allReviews = useMemo(
    () => topTracks.flatMap((track) => track.reviews.map((review) => ({ ...review, track }))),
    [topTracks]
  );

  const distribution = useMemo(() => {
    const counts = [1, 2, 3, 4, 5].map(
      (star) => allReviews.filter((review) => Math.round(review.rating) === star).length
    );
    return counts;
  }, [allReviews]);
  const maxDistribution = Math.max(1, ...distribution);

  const topReviews = useMemo(
    () => [...allReviews].sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0)).slice(0, 3),
    [allReviews]
  );

  const counts = {
    album: releases.filter((item) => item.kind === 'album').length,
    single: releases.filter((item) => item.kind === 'single').length,
    other: releases.filter((item) => item.kind === 'other').length,
  };
  const visibleReleases = releases.filter((item) => item.kind === releaseTab);

  function openTrack(track) {
    navigate(`/track/${encodeURIComponent(track.externalId)}`, { state: { track } });
  }

  async function handleRegisterArtist() {
    const registered = await registerContent(
      token,
      {
        externalId: decodedName,
        title: profile?.name || decodedName,
        description: profile?.bio || '',
        imageUrl: profile?.imageUrl || '',
        genre: profile?.tags?.[0] || 'Artista',
      },
      'artist'
    );
    setArtistContentId(registered.id);
    return registered.id;
  }

  function handleRateArtistClick() {
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

  const shareText = `Mirá a ${profile?.name || decodedName} en TapeBeat`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;

  function renderReview(review) {
    const initial = review.authorDisplayName?.[0]?.toUpperCase() || '?';
    return (
      <button
        key={review.id}
        type="button"
        className="entity-review-card"
        onClick={() => openTrack(review.track)}
      >
        <span className="entity-review-card__avatar">{initial}</span>
        <span className="entity-review-card__body">
          <span className="entity-review-card__meta">
            <strong>{review.authorDisplayName || 'Anónimo'}</strong>
            <span>· {review.track.title}</span>
            <span>· ★ {review.rating}/5</span>
            <span>· {formatDate(review.createdAt)}</span>
          </span>
          <p className="entity-review-card__text">{review.body}</p>
        </span>
      </button>
    );
  }

  function renderAlbumCard(album) {
    return (
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

      {loading ? (
        <SkeletonArtistDetail />
      ) : (
        <>
          <section className="entity-hero">
            <div className="entity-hero__left">
              <div className="artist-profile-avatar">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={profile.name} />
                ) : (
                  <span>{decodedName[0] || '♪'}</span>
                )}
              </div>
              <h1 className="entity-hero__name">{profile?.name || decodedName}</h1>
            </div>

            <div className="entity-hero__right">
              <div className="entity-hero__stats">
                <div className="entity-hero__stat">
                  <strong>{artistStats.count}</strong>
                  <span>Calificaciones</span>
                </div>
                <div className="entity-hero__stat">
                  <strong>★ {artistStats.average ? artistStats.average.toFixed(1) : '—'}/5</strong>
                  <span>Promedio</span>
                </div>
                <div className="entity-hero__stat">
                  <strong>☆ {artistStats.yourRating ?? 0}/5</strong>
                  <span>Tu calificación</span>
                </div>
              </div>

              {!(sessionUser && artistStats.yourRating != null) && (
                <button type="button" className="entity-hero__cta" onClick={handleRateArtistClick}>
                  {sessionUser ? '★ Calificar este artista' : '🔒 Iniciá sesión para calificar'}
                </button>
              )}
            </div>
          </section>

          <nav className="entity-tabs">
            {[
              { value: 'home', label: 'Inicio' },
              { value: 'discography', label: 'Discografía' },
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
                  {topTracks.length > 0 && (
                    <section className="section-block">
                      <h2 className="subsection-title">Canciones más populares</h2>
                      <ol className="track-rank-list">
                        {topTracks.map((track, index) => {
                          const avg = track.reviews.length
                            ? track.reviews.reduce((sum, review) => sum + review.rating, 0) / track.reviews.length
                            : null;
                          return (
                            <li key={track.externalId}>
                              <button type="button" className="track-rank-row" onClick={() => openTrack(track)}>
                                <span className="track-rank-row__index">{index + 1}</span>
                                <span className="track-rank-row__cover">
                                  {track.imageUrl ? <img src={track.imageUrl} alt="" /> : <span>♪</span>}
                                </span>
                                <span className="track-rank-row__info">
                                  <strong>{track.title}</strong>
                                  <small>{decodedName}</small>
                                </span>
                                <span className="track-rank-row__rating">
                                  {avg ? `★ ${avg.toFixed(1)}/5` : 'Sin calificar'}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  )}

                  {releases.length > 0 && (
                    <section className="section-block">
                      <div className="section-header">
                        <h2>Discografía</h2>
                        <button
                          type="button"
                          className="section-header__more"
                          onClick={() => setTab('discography')}
                        >
                          Ver todo →
                        </button>
                      </div>
                      <div className="cards-grid">{releases.slice(0, 8).map(renderAlbumCard)}</div>
                    </section>
                  )}

                  {topReviews.length > 0 && (
                    <section className="section-block">
                      <h2 className="subsection-title">Reseñas destacadas</h2>
                      <div className="review-list">{topReviews.map(renderReview)}</div>
                    </section>
                  )}

                  {(profile?.bio || profile?.tags?.length > 0) && (
                    <section className="section-block">
                      <h2 className="subsection-title">Acerca de</h2>
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
                    </section>
                  )}
                </>
              )}

              {tab === 'discography' && (
                <section className="section-block">
                  <div className="section-header">
                    <h2>Discografía</h2>
                    <span className="count-badge">{visibleReleases.length} resultados</span>

                    <div className="release-tabs">
                      {RELEASE_TABS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`release-tab${releaseTab === option.value ? ' is-active' : ''}`}
                          onClick={() => setReleaseTab(option.value)}
                        >
                          {option.label}
                          <span className="release-tab-count">{counts[option.value]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cards-grid">{visibleReleases.map(renderAlbumCard)}</div>
                </section>
              )}

              {tab === 'reviews' && (
                <>
                  <section className="section-block">
                    <h2 className="subsection-title">Reseñas del artista</h2>
                    <ReviewPanel
                      contentId={artistContentId}
                      onRegister={handleRegisterArtist}
                      sessionUser={sessionUser}
                      onLoginClick={onLoginClick}
                      emptyMessage="Todavía nadie calificó a este artista. ¡Sé el primero!"
                      onStatsChange={setArtistStats}
                    />
                  </section>

                  <section className="section-block">
                    <h2 className="subsection-title">Reseñas de sus canciones</h2>
                    {allReviews.length === 0 ? (
                      <p className="no-reviews">Todavía no hay reseñas para los temas de este artista.</p>
                    ) : (
                      <div className="review-list">{allReviews.map(renderReview)}</div>
                    )}
                  </section>
                </>
              )}
            </div>

            <aside className="entity-sidebar">
              <div className="entity-sidebar__actions">
                <button type="button" onClick={handleRateArtistClick}>
                  Escribir reseña
                </button>
                {profile?.url && (
                  <a href={profile.url} target="_blank" rel="noreferrer">
                    Escuchar en Last.fm
                  </a>
                )}
                <div className="entity-sidebar__share">
                  <button type="button" onClick={copyLink}>
                    {linkCopied ? 'Copiado ✓' : 'Copiar enlace'}
                  </button>
                  <a href={twitterShareUrl} target="_blank" rel="noreferrer">
                    Compartir en X
                  </a>
                </div>
              </div>

              {allReviews.length > 0 && (
                <div className="entity-sidebar__panel">
                  <h3>Distribución de calificaciones de sus canciones</h3>
                  <div className="rating-distribution">
                    {distribution.map((count, index) => (
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
                </div>
              )}

              {similarArtists.length > 0 && (
                <div className="entity-sidebar__panel">
                  <h3>También te puede gustar</h3>
                  <div className="similar-artist-list">
                    {similarArtists.map((artist) => (
                      <button
                        key={artist.name}
                        type="button"
                        className="similar-artist-item"
                        onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                      >
                        <span className="similar-artist-item__avatar">
                          {artist.imageUrl ? <img src={artist.imageUrl} alt="" /> : artist.name[0]}
                        </span>
                        <span>{artist.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
