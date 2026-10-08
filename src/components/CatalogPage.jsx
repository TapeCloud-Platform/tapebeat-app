import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@heroui/react';
import TrackCard from './TrackCard';
import ArtistCard from './ArtistCard';
import TopSlider from './TopSlider';
import GenreRow from './GenreRow';
import FeedReviewCard, { contentPath } from './FeedReviewCard';
import { SkeletonCatalogHome, SkeletonCatalogResults } from './Skeleton';
import { getReviews } from '../api';

const VIEW_MODE_KEY = 'tapecloud_catalog_view';
const RECENTLY_REVIEWED_LIMIT = 18;
const TRENDING_REVIEWS_LIMIT = 5;
const POPULAR_REVIEWERS_LIMIT = 8;

function getStoredViewMode() {
  if (typeof localStorage === 'undefined') {
    return 'grid';
  }
  return localStorage.getItem(VIEW_MODE_KEY) === 'list' ? 'list' : 'grid';
}

export default function CatalogPage({
  items,
  loading,
  error,
  activeFilter,
  active,
  filters,
  activeLabel,
  onApplyFilter,
  onClearFilters,
}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(getStoredViewMode);
  const [reviews, setReviews] = useState([]);
  const isFiltered = active.type !== 'top';
  const activeLabelText = activeLabel
    ?? activeFilter?.options?.find((option) => option.value === active.value)?.label
    ?? active.value;

  function changeViewMode(mode) {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }

  // El feed de reseñas de toda la app solo hace falta en el inicio.
  useEffect(() => {
    if (isFiltered) {
      return undefined;
    }
    let cancelled = false;
    getReviews()
      .then((data) => {
        if (!cancelled) {
          setReviews(data || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReviews([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isFiltered]);

  const recentlyReviewed = useMemo(() => {
    const seen = new Set();
    const unique = [];
    for (const review of reviews) {
      if (!seen.has(review.contentId)) {
        seen.add(review.contentId);
        unique.push(review);
      }
    }
    return unique.slice(0, RECENTLY_REVIEWED_LIMIT);
  }, [reviews]);

  const trendingReviews = useMemo(
    () =>
      [...reviews]
        .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, TRENDING_REVIEWS_LIMIT),
    [reviews]
  );

  const popularReviewers = useMemo(() => {
    const byAuthor = new Map();
    for (const review of reviews) {
      const name = review.authorDisplayName || 'Anónimo';
      const entry = byAuthor.get(name) || { name, reviews: 0, likes: 0 };
      entry.reviews += 1;
      entry.likes += review.likesCount ?? 0;
      byAuthor.set(name, entry);
    }
    return Array.from(byAuthor.values())
      .sort((a, b) => b.reviews - a.reviews || b.likes - a.likes)
      .slice(0, POPULAR_REVIEWERS_LIMIT);
  }, [reviews]);

  const artists = items.filter((item) => item.kind === 'artist');
  const tracks = items
    .filter((item) => item.kind !== 'artist')
    .map((item) => ({ ...item, id: item.externalId }));

  // No hay endpoint de "top artistas" en el backend: los derivamos de las
  // propias canciones más escuchadas, sin repetir artista.
  const featuredArtists = useMemo(() => {
    const seen = new Map();
    tracks.forEach((track) => {
      if (track.subtitle && !seen.has(track.subtitle)) {
        seen.set(track.subtitle, {
          externalId: `artist:${track.subtitle}`,
          title: track.subtitle,
          description: track.genre || '',
          imageUrl: track.imageUrl,
        });
      }
    });
    return Array.from(seen.values()).slice(0, 6);
  }, [tracks]);

  const hero = tracks.slice(0, 10);
  const more = tracks.slice(10, 19);

  const genreFilter = filters.find((filter) => filter.type === 'genre');
  const homeGenres = genreFilter?.options?.slice(0, 5) ?? [];

  return (
    <main className="app-main">
      <section className="section-block">
        <div className="section-header">
          <h2>{active.type === 'combined' ? 'Resultados' : (activeFilter?.label ?? 'Contenido')}</h2>
          {!loading && <span className="count-badge">{tracks.length} resultados</span>}

          {isFiltered && (
            <Chip
              color="accent"
              variant="soft"
              className="active-filter-chip"
              role="button"
              tabIndex={0}
              onClick={onClearFilters}
              onKeyDown={(event) => event.key === 'Enter' && onClearFilters()}
            >
              {activeLabelText}
              <span aria-hidden="true">✕</span>
            </Chip>
          )}

          {isFiltered && (
            <div className="view-toggle" role="group" aria-label="Estilo de resultados">
              <button
                type="button"
                className={`view-toggle__btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                onClick={() => changeViewMode('grid')}
                aria-label="Ver en bloques"
                aria-pressed={viewMode === 'grid'}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
              </button>
              <button
                type="button"
                className={`view-toggle__btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => changeViewMode('list')}
                aria-label="Ver en lista"
                aria-pressed={viewMode === 'list'}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          isFiltered ? (
            <SkeletonCatalogResults count={10} view={viewMode} />
          ) : (
            <SkeletonCatalogHome />
          )
        ) : isFiltered ? (
          <>
            {artists.length > 0 && (
              <div className="artists-block">
                <h3 className="subsection-title">Artistas</h3>
                <div className="artists-row">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.externalId} artist={artist} />
                  ))}
                </div>
              </div>
            )}

            {artists.length > 0 && tracks.length > 0 && (
              <h3 className="subsection-title">Canciones</h3>
            )}

            <div className={viewMode === 'list' ? 'cards-list' : 'cards-grid'}>
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} variant={viewMode === 'list' ? 'list' : undefined} />
              ))}
            </div>
          </>
        ) : (
          <>
            <TopSlider title="Populares esta semana" tracks={hero} />

            {homeGenres.map((genre) => (
              <GenreRow key={genre.value} genre={genre} />
            ))}

            {recentlyReviewed.length > 0 && (
              <div className="reviewed-block">
                <div className="section-header">
                  <h3 className="subsection-title">Recién reseñado...</h3>
                  <span className="reviewed-block__count">
                    {reviews.length.toLocaleString('es-AR')} calificaciones registradas
                  </span>
                </div>
                <div className="reviewed-strip">
                  {recentlyReviewed.map((review) => (
                    <button
                      key={review.contentId}
                      type="button"
                      className="reviewed-strip__item"
                      title={review.contentTitle}
                      onClick={() => navigate(contentPath(review))}
                    >
                      {review.contentImageUrl ? <img src={review.contentImageUrl} alt="" /> : <span>♪</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="split-section">
              <div className="split-col">
                <h3 className="subsection-title">Reseñas destacadas</h3>
                {trendingReviews.length === 0 ? (
                  <p className="no-reviews">Todavía no hay reseñas. ¡Sé el primero en escribir una!</p>
                ) : (
                  <div className="feed-review-list">
                    {trendingReviews.map((review) => (
                      <FeedReviewCard
                        key={review.id}
                        review={review}
                        onOpen={() => navigate(contentPath(review))}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="split-col split-col--narrow">
                {more.length > 0 && (
                  <>
                    <h3 className="subsection-title">Más para descubrir</h3>
                    <div className="mini-grid mini-grid--three">
                      {more.map((track) => (
                        <TrackCard key={track.id} track={track} variant="mini" />
                      ))}
                    </div>
                  </>
                )}

                {featuredArtists.length > 0 && (
                  <>
                    <h3 className="subsection-title">Artistas destacados</h3>
                    <div className="similar-artist-list">
                      {featuredArtists.map((artist) => (
                        <button
                          key={artist.externalId}
                          type="button"
                          className="similar-artist-item"
                          onClick={() => navigate(`/artist/${encodeURIComponent(artist.title)}`)}
                        >
                          <span className="similar-artist-item__avatar">
                            {artist.imageUrl ? <img src={artist.imageUrl} alt="" /> : artist.title[0]}
                          </span>
                          <span>{artist.title}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {popularReviewers.length > 0 && (
                  <>
                    <h3 className="subsection-title">Reseñadores populares</h3>
                    <div className="similar-artist-list">
                      {popularReviewers.map((reviewer) => (
                        <div key={reviewer.name} className="similar-artist-item similar-artist-item--static">
                          <span className="similar-artist-item__avatar">{reviewer.name[0].toUpperCase()}</span>
                          <span className="similar-artist-item__text">
                            {reviewer.name}
                            <small>
                              {reviewer.reviews} {reviewer.reviews === 1 ? 'reseña' : 'reseñas'} · ♥ {reviewer.likes}
                            </small>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
