import { useEffect, useState } from 'react';
import { getMoviesPaginated } from '../api';

const PAGE_SIZE = 20;

export default function CategoryModal({ genre, onClose, onMovieSelect }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      try {
        setLoading(true);
        const data = await getMoviesPaginated(genre, 0, PAGE_SIZE);
        if (!cancelled) {
          setMovies(data || []);
          setPage(0);
          setHasMore((data || []).length === PAGE_SIZE);
        }
      } catch {
        if (!cancelled) {
          setMovies([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [genre]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const data = await getMoviesPaginated(genre, nextPage, PAGE_SIZE);
      setMovies((current) => [...current, ...(data || [])]);
      setPage(nextPage);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container category-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-header">
          <h2>{genre}</h2>
        </div>

        <div className="category-movies-grid">
          {movies.map((movie) => (
            <article
              key={movie.id}
              className="movie-card"
              onClick={() => {
                onMovieSelect(movie);
                onClose();
              }}
            >
              <div className="poster-container">
                {movie.imageUrl ? (
                  <img className="poster-image" src={movie.imageUrl} alt={movie.title} />
                ) : (
                  <div className="poster">{movie.title?.[0] || 'F'}</div>
                )}
                {movie.genre && <span className="genre-badge">{movie.genre.split(',')[0]}</span>}
              </div>
              <h3>{movie.title}</h3>
              <p className="movie-description">{movie.description}</p>
              <div className="movie-footer">
                <small>{movie.releaseDate || 'Sin fecha'}</small>
                {movie.genre && <span className="genre-subtag">{movie.genre}</span>}
              </div>
            </article>
          ))}

          {hasMore && (
            <div className="load-more-container">
              <button
                type="button"
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Ver más'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
