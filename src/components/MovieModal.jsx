import { useEffect, useState } from 'react';
import {
  getReviews,
  createReview,
  toggleReviewLike,
  deleteReview,
  getComments,
  createComment,
  deleteComment,
} from '../api';

export default function MovieModal({ movie, sessionUser, onClose }) {
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [commentsByReview, setCommentsByReview] = useState({});
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');

  const token = localStorage.getItem('tapecloud_token');

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoadingReviews(true);
        const data = await getReviews(movie.id);
        if (!cancelled) {
          setReviews(data || []);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false);
        }
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [movie.id]);

  async function handleSubmitReview(event) {
    event.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    try {
      const created = await createReview(movie.id, token, {
        rating: Number(rating),
        comment,
      });
      setReviews((current) => [created, ...current]);
      setComment('');
      setReviewSuccess('Reseña publicada.');
    } catch (err) {
      setReviewError(err.message || 'No se pudo publicar la reseña.');
    }
  }

  async function handleToggleLike(reviewId) {
    try {
      const updated = await toggleReviewLike(reviewId, token);
      setReviews((current) =>
        current.map((review) => (review.id === reviewId ? { ...review, ...updated } : review))
      );
    } catch {
      // El backend puede no tener soporte todavía; se ignora silenciosamente.
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await deleteReview(reviewId, token);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
    } catch (err) {
      setReviewError(err.message || 'No se pudo eliminar la reseña.');
    }
  }

  async function toggleComments(reviewId) {
    if (openCommentsFor === reviewId) {
      setOpenCommentsFor(null);
      return;
    }

    setOpenCommentsFor(reviewId);
    if (!commentsByReview[reviewId]) {
      try {
        const data = await getComments(reviewId);
        setCommentsByReview((current) => ({ ...current, [reviewId]: data || [] }));
      } catch {
        setCommentsByReview((current) => ({ ...current, [reviewId]: [] }));
      }
    }
  }

  async function handleSubmitComment(event, reviewId) {
    event.preventDefault();
    if (!commentDraft.trim()) {
      return;
    }

    try {
      const created = await createComment(reviewId, token, { content: commentDraft });
      setCommentsByReview((current) => ({
        ...current,
        [reviewId]: [...(current[reviewId] || []), created],
      }));
      setCommentDraft('');
    } catch {
      // Se ignora el error de comentario para no bloquear la UI.
    }
  }

  async function handleDeleteComment(reviewId, commentId) {
    try {
      await deleteComment(commentId, token);
      setCommentsByReview((current) => ({
        ...current,
        [reviewId]: (current[reviewId] || []).filter((c) => c.id !== commentId),
      }));
    } catch {
      // Se ignora el error de eliminación de comentario.
    }
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-movie-header">
          {movie.imageUrl ? (
            <img className="modal-movie-poster" src={movie.imageUrl} alt={movie.title} />
          ) : (
            <div className="modal-movie-poster-fallback">{movie.title?.[0] || 'F'}</div>
          )}
          <div className="modal-movie-info">
            {movie.genre && <span className="modal-genre">{movie.genre}</span>}
            <h2>{movie.title}</h2>
            <p className="modal-release">{movie.releaseDate || 'Sin fecha'}</p>
            {averageRating ? (
              <div className="modal-rating-summary">
                <span className="summary-stars">★ {averageRating}</span>
                <span className="summary-count">({reviews.length} reseñas)</span>
              </div>
            ) : (
              <p className="modal-no-rating">Todavía no tiene reseñas.</p>
            )}
          </div>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'details' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Detalles
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'reviews' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reseñas
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'details' && (
            <>
              <p className="modal-description-full">{movie.description || 'Sin descripción disponible.'}</p>
              <div className="details-metadata">
                <div className="meta-item">
                  <span>Género</span>
                  <strong>{movie.genre || 'Sin categorizar'}</strong>
                </div>
                <div className="meta-item">
                  <span>Estreno</span>
                  <strong>{movie.releaseDate || 'Sin fecha'}</strong>
                </div>
                <div className="meta-item">
                  <span>Puntuación</span>
                  <strong>{movie.voteAverage || movie.vote_average || 'N/D'}</strong>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="reviews-section-header">
                <h3>Reseñas</h3>
              </div>

              {!sessionUser && (
                <div className="login-notice flex-between">
                  <span>Iniciá sesión para dejar tu reseña.</span>
                  <a className="inline-login-btn" href="http://localhost:5173">
                    Iniciar sesión
                  </a>
                </div>
              )}

              {sessionUser && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                  {reviewError && <p className="error-text">{reviewError}</p>}
                  {reviewSuccess && <p className="success-text">{reviewSuccess}</p>}
                  <div className="review-form-row">
                    <label className="review-field width-auto">
                      Puntuación
                      <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} ★
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="review-field flex-1">
                      Comentario
                      <textarea
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <button type="submit" className="submit-review-btn">
                    Publicar reseña
                  </button>
                </form>
              )}

              {loadingReviews ? (
                <p className="loading-text">Cargando reseñas...</p>
              ) : reviews.length === 0 ? (
                <p className="empty-reviews-text">Todavía no hay reseñas para este contenido.</p>
              ) : (
                <div className="modal-reviews-list">
                  {reviews.map((review) => (
                    <article key={review.id} className="modal-review-card">
                      <div className="modal-review-header">
                        <strong>{review.userDisplayName || review.userEmail || 'Usuario'}</strong>
                        <div className="modal-review-actions">
                          <span className="modal-review-rating">★ {review.rating}</span>
                          {sessionUser?.email === review.userEmail && (
                            <button
                              type="button"
                              className="delete-review-btn"
                              onClick={() => handleDeleteReview(review.id)}
                              title="Eliminar reseña"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </div>
                      <p>{review.comment}</p>
                      <span className="modal-review-date">{review.createdAt || ''}</span>

                      <div className="review-interaction-bar">
                        <button
                          type="button"
                          className={`like-btn ${review.likedByCurrentUser ? 'is-liked' : ''}`}
                          onClick={() => handleToggleLike(review.id)}
                        >
                          ♥ {review.likesCount ?? 0}
                        </button>
                        <button
                          type="button"
                          className="comments-toggle-btn"
                          onClick={() => toggleComments(review.id)}
                        >
                          💬 Comentarios
                        </button>
                      </div>

                      {openCommentsFor === review.id && (
                        <div className="comments-thread">
                          <div className="comments-list">
                            {(commentsByReview[review.id] || []).map((c) => (
                              <div key={c.id} className="comment-item">
                                <div className="comment-item-header">
                                  <strong>{c.userDisplayName || c.userEmail || 'Usuario'}</strong>
                                  {sessionUser?.email === c.userEmail && (
                                    <button
                                      type="button"
                                      className="delete-comment-btn"
                                      onClick={() => handleDeleteComment(review.id, c.id)}
                                      title="Eliminar comentario"
                                    >
                                      🗑
                                    </button>
                                  )}
                                </div>
                                <p className="comment-item-body">{c.content}</p>
                              </div>
                            ))}
                          </div>

                          {sessionUser ? (
                            <form
                              className="comment-form"
                              onSubmit={(e) => handleSubmitComment(e, review.id)}
                            >
                              <input
                                type="text"
                                placeholder="Escribí un comentario..."
                                value={commentDraft}
                                onChange={(e) => setCommentDraft(e.target.value)}
                              />
                              <button type="submit" className="submit-comment-btn">
                                Enviar
                              </button>
                            </form>
                          ) : (
                            <p className="login-notice-small">Iniciá sesión para comentar.</p>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
