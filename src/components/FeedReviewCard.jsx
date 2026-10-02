import { useState } from 'react';
import StarRating from './StarRating';
import { HeartIcon, MessageIcon } from './icons';

const COLLAPSE_LIMIT = 280;

/** Devuelve la ruta del contenido reseñado (canción o artista) según su tipo. */
export function contentPath(review) {
  const id = encodeURIComponent(review.contentExternalId || '');
  return review.contentSourceType === 'artist' ? `/artist/${id}` : `/track/${id}`;
}

/** Reseña del feed de inicio: portada, título, estrellas, texto plegable y autor. */
export default function FeedReviewCard({ review, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > COLLAPSE_LIMIT;
  const body = expanded || !isLong ? review.body : `${review.body.slice(0, COLLAPSE_LIMIT).trim()}…`;
  const initial = review.authorDisplayName?.[0]?.toUpperCase() || '?';

  return (
    <article className="feed-review">
      <button type="button" className="feed-review__head" onClick={onOpen}>
        <span className="feed-review__cover">
          {review.contentImageUrl ? <img src={review.contentImageUrl} alt="" /> : <span>♪</span>}
        </span>
        <span className="feed-review__heading">
          <strong>{review.contentTitle}</strong>
          <small>{review.contentSourceType === 'artist' ? 'Artista' : 'Canción'}</small>
        </span>
      </button>

      <h4 className="feed-review__title">{review.title}</h4>
      <StarRating value={review.rating} size="sm" />

      <p className="feed-review__body">{body}</p>
      {isLong && (
        <button type="button" className="feed-review__more" onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Leer menos' : 'Leer más…'}
        </button>
      )}

      <div className="feed-review__footer">
        <span className="feed-review__author">
          <span className="feed-review__avatar">{initial}</span>
          {review.authorDisplayName || 'Anónimo'}
        </span>
        <span className="feed-review__counts">
          <span class="feed-review__count"><HeartIcon size={14} filled /> {review.likesCount ?? 0}</span>
          <span class="feed-review__count"><MessageIcon size={14} /> {review.commentsCount ?? 0}</span>
        </span>
      </div>
    </article>
  );
}
