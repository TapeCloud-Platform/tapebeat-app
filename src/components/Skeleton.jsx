export function SkeletonBlock({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCatalogGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid" role="status" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-grid__item">
          <SkeletonBlock className="skeleton--poster" />
          <SkeletonBlock className="skeleton--line" style={{ width: '85%' }} />
          <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
        </div>
      ))}
    </div>
  );
}

/** Catálogo con filtros: fila de artistas + grilla/lista de resultados. */
export function SkeletonCatalogResults({ count = 10, view = 'grid' }) {
  return (
    <div role="status" aria-label="Cargando resultados">
      <div className="artists-block" aria-hidden="true">
        <SkeletonBlock className="skeleton--line" style={{ width: 120, marginBottom: 14 }} />
        <div className="artists-row">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-artist">
              <SkeletonBlock className="skeleton--circle" style={{ width: 104, height: 104 }} />
              <SkeletonBlock className="skeleton--line" style={{ width: '70%' }} />
              <SkeletonBlock className="skeleton--line" style={{ width: '45%' }} />
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true">
        <SkeletonBlock className="skeleton--line" style={{ width: 120, marginBottom: 14 }} />
        {view === 'list' ? (
          <div className="cards-list">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-row">
                <SkeletonBlock style={{ width: 52, height: 52, borderRadius: 8, flex: 'none' }} />
                <div style={{ flex: 1 }}>
                  <SkeletonBlock className="skeleton--line" style={{ width: '60%' }} />
                  <SkeletonBlock className="skeleton--line" style={{ width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-grid__item">
                <SkeletonBlock className="skeleton--poster" />
                <SkeletonBlock className="skeleton--line" style={{ width: '85%' }} />
                <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Inicio del catálogo: slider hero + tira de recién reseñado + sección partida. */
export function SkeletonCatalogHome() {
  return (
    <div role="status" aria-label="Cargando contenido">
      <div className="top-slider" aria-hidden="true">
        <div className="top-slider__head">
          <SkeletonBlock className="skeleton--line" style={{ width: 220, height: 18 }} />
        </div>
        <div className="top-slider__track">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="top-slider__item">
              <SkeletonBlock className="skeleton--poster" />
              <SkeletonBlock className="skeleton--line" style={{ width: '85%' }} />
              <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="reviewed-block" aria-hidden="true">
        <div className="section-header">
          <SkeletonBlock className="skeleton--line" style={{ width: 180, height: 16 }} />
        </div>
        <div className="reviewed-strip">
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonBlock key={index} className="skeleton--strip-item" />
          ))}
        </div>
      </div>

      <div className="split-section" aria-hidden="true">
        <div className="split-col">
          <SkeletonBlock className="skeleton--line" style={{ width: 200, marginBottom: 14 }} />
          <div className="feed-review-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="feed-review">
                <div className="feed-review__head">
                  <SkeletonBlock style={{ width: 56, height: 56, borderRadius: 8, flex: 'none' }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonBlock className="skeleton--line" style={{ width: '60%' }} />
                    <SkeletonBlock className="skeleton--line" style={{ width: '40%' }} />
                  </div>
                </div>
                <SkeletonBlock className="skeleton--line" style={{ width: '90%' }} />
                <SkeletonBlock className="skeleton--line" style={{ width: '75%' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="split-col split-col--narrow">
          <SkeletonBlock className="skeleton--line" style={{ width: 160, marginBottom: 14 }} />
          <div className="mini-grid mini-grid--three">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <SkeletonBlock className="skeleton--poster" />
                <SkeletonBlock className="skeleton--line" style={{ width: '80%' }} />
              </div>
            ))}
          </div>
          <SkeletonBlock className="skeleton--line" style={{ width: 170, margin: '26px 0 14px' }} />
          <div className="similar-artist-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-row">
                <SkeletonBlock className="skeleton--circle" style={{ width: 36, height: 36 }} />
                <div style={{ flex: 1 }}>
                  <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
                  <SkeletonBlock className="skeleton--line" style={{ width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonHeroStats() {
  return (
    <div className="entity-hero__stats" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="entity-hero__stat">
          <SkeletonBlock className="skeleton--stat" />
          <SkeletonBlock className="skeleton--line" style={{ width: 64 }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonTabs({ count = 2 }) {
  return (
    <div className="entity-tabs" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} className="skeleton--tab" />
      ))}
    </div>
  );
}

function SkeletonSidebarActions() {
  return (
    <div className="entity-sidebar__actions" aria-hidden="true">
      <SkeletonBlock className="skeleton--action-row" />
      <div className="entity-sidebar__share">
        <SkeletonBlock className="skeleton--action-row" />
        <SkeletonBlock className="skeleton--action-row" />
      </div>
    </div>
  );
}

function SkeletonRatingBars({ count = 5 }) {
  return (
    <div className="rating-distribution" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rating-distribution__bar-row">
          <SkeletonBlock className="skeleton--line" style={{ width: 20 }} />
          <SkeletonBlock className="skeleton--bar" />
          <SkeletonBlock className="skeleton--line" style={{ width: 24 }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonRankRows({ count = 5 }) {
  return (
    <ol className="track-rank-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="skeleton-row skeleton-row--rank">
          <SkeletonBlock className="skeleton--line" style={{ width: 20 }} />
          <SkeletonBlock style={{ width: 44, height: 44, borderRadius: 8, flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
            <SkeletonBlock className="skeleton--line" style={{ width: '30%' }} />
          </div>
          <SkeletonBlock className="skeleton--line" style={{ width: 70 }} />
        </li>
      ))}
    </ol>
  );
}

/** Ficha de canción: hero + tabs + info/álbum y sidebar con tracklist. */
export function SkeletonTrackDetail() {
  return (
    <div className="detail-page" role="status" aria-label="Cargando canción">
      <div className="detail-hero" aria-hidden="true">
        <SkeletonBlock className="skeleton--detail-cover" />
        <div className="detail-info">
          <SkeletonBlock className="skeleton--title" style={{ width: '60%' }} />
          <SkeletonBlock className="skeleton--pill" style={{ width: 140 }} />
          <SkeletonBlock className="skeleton--pill" style={{ width: 210 }} />
        </div>
        <div className="entity-hero__right">
          <SkeletonHeroStats />
          <SkeletonBlock className="skeleton--btn" style={{ width: 210 }} />
        </div>
      </div>

      <SkeletonTabs count={2} />

      <div className="entity-layout" aria-hidden="true">
        <div className="entity-main">
          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 140, marginBottom: 14 }} />
            <div className="information-panel">
              <div className="rating-distribution rating-distribution--wide">
                <SkeletonBlock className="skeleton--line" style={{ width: '40%', marginBottom: 8 }} />
                <SkeletonRatingBars count={5} />
              </div>
              <div className="information-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="information-cell">
                    <SkeletonBlock className="skeleton--line" style={{ width: '40%', marginBottom: 6 }} />
                    <SkeletonBlock className="skeleton--line" style={{ width: '75%' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 120, marginBottom: 14 }} />
            <div className="track-album-card">
              <SkeletonBlock style={{ width: 120, height: 120, borderRadius: 12, flex: 'none' }} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock className="skeleton--line" style={{ width: '50%', marginBottom: 8 }} />
                <SkeletonBlock className="skeleton--line" style={{ width: '30%', marginBottom: 8 }} />
                <SkeletonBlock className="skeleton--line" style={{ width: '90%' }} />
              </div>
            </div>
          </section>
        </div>

        <aside className="entity-sidebar">
          <SkeletonSidebarActions />
          <div className="entity-sidebar__panel">
            <SkeletonBlock className="skeleton--line" style={{ width: 150, marginBottom: 12 }} />
            <div className="tracklist">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton-row skeleton-row--track">
                  <SkeletonBlock className="skeleton--line" style={{ width: 18 }} />
                  <SkeletonBlock className="skeleton--line" style={{ width: `${70 - index * 4}%` }} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Ficha de álbum: hero + tabs + tracklist y estadística de rating. */
export function SkeletonAlbumDetail() {
  return (
    <div className="detail-page" role="status" aria-label="Cargando álbum">
      <div className="detail-hero" aria-hidden="true">
        <SkeletonBlock className="skeleton--hero-cover" />
        <div className="detail-info">
          <SkeletonBlock className="skeleton--line" style={{ width: 90 }} />
          <SkeletonBlock className="skeleton--title" style={{ width: '55%' }} />
          <SkeletonBlock className="skeleton--pill" style={{ width: 160 }} />
          <SkeletonBlock className="skeleton--pill" style={{ width: 130 }} />
        </div>
        <div className="entity-hero__right">
          <SkeletonHeroStats />
          <SkeletonBlock className="skeleton--btn" style={{ width: 210 }} />
        </div>
      </div>

      <SkeletonTabs count={2} />

      <div className="entity-layout" aria-hidden="true">
        <div className="entity-main">
          <section className="section-block">
            <div className="tracklist-header">
              <SkeletonBlock className="skeleton--line" style={{ width: 160 }} />
              <SkeletonBlock className="skeleton--pill" style={{ width: 110, height: 32 }} />
            </div>
            <div className="tracklist tracklist--page tracklist--rich">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton-row skeleton-row--track">
                  <SkeletonBlock className="skeleton--line" style={{ width: 18 }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonBlock className="skeleton--line" style={{ width: `${65 - (index % 4) * 8}%` }} />
                    <SkeletonBlock className="skeleton--line" style={{ width: '25%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 170, marginBottom: 14 }} />
            <div className="information-panel">
              <div className="rating-distribution rating-distribution--wide">
                <SkeletonBlock className="skeleton--line" style={{ width: '35%', marginBottom: 8 }} />
                <SkeletonRatingBars count={5} />
              </div>
              <div className="information-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="information-cell">
                    <SkeletonBlock className="skeleton--line" style={{ width: '40%', marginBottom: 6 }} />
                    <SkeletonBlock className="skeleton--line" style={{ width: '70%' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="entity-sidebar">
          <SkeletonSidebarActions />
        </aside>
      </div>
    </div>
  );
}

/** Ficha de artista: hero + tabs + top tracks, discografía y sidebar. */
export function SkeletonArtistDetail() {
  return (
    <div role="status" aria-label="Cargando artista">
      <section className="entity-hero" aria-hidden="true">
        <div className="entity-hero__left">
          <SkeletonBlock className="skeleton--avatar" />
          <SkeletonBlock className="skeleton--title" style={{ width: 220 }} />
        </div>
        <div className="entity-hero__right">
          <SkeletonHeroStats />
          <SkeletonBlock className="skeleton--btn" style={{ width: 210 }} />
        </div>
      </section>

      <SkeletonTabs count={3} />

      <div className="entity-layout" aria-hidden="true">
        <div className="entity-main">
          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 200, marginBottom: 14 }} />
            <SkeletonRankRows count={5} />
          </section>

          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 170, marginBottom: 14 }} />
            <div className="artist-tags" aria-hidden="true">
              {[90, 70, 110, 60].map((width, index) => (
                <SkeletonBlock key={index} className="skeleton--pill" style={{ width, height: 26 }} />
              ))}
            </div>
            <SkeletonBlock className="skeleton--line" style={{ width: '100%', marginTop: 16 }} />
            <SkeletonBlock className="skeleton--line" style={{ width: '95%' }} />
            <SkeletonBlock className="skeleton--line" style={{ width: '70%' }} />
          </section>
        </div>

        <aside className="entity-sidebar">
          <SkeletonSidebarActions />
          <div className="entity-sidebar__panel">
            <SkeletonBlock className="skeleton--line" style={{ width: 170, marginBottom: 12 }} />
            <SkeletonRatingBars count={5} />
          </div>
          <div className="entity-sidebar__panel">
            <SkeletonBlock className="skeleton--line" style={{ width: 150, marginBottom: 12 }} />
            <div className="similar-artist-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="skeleton-row">
                  <SkeletonBlock className="skeleton--circle" style={{ width: 36, height: 36 }} />
                  <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Perfil público: hero estilo artista + tabs, actividad y sidebar. */
export function SkeletonUserProfile() {
  return (
    <div role="status" aria-label="Cargando perfil">
      <section className="entity-hero" aria-hidden="true">
        <div className="entity-hero__left">
          <SkeletonBlock className="skeleton--avatar" />
          <div style={{ flex: 1 }}>
            <SkeletonBlock className="skeleton--line" style={{ width: 130, marginBottom: 8 }} />
            <SkeletonBlock className="skeleton--title" style={{ width: 220, marginBottom: 8 }} />
            <SkeletonBlock className="skeleton--line" style={{ width: 120 }} />
          </div>
        </div>
        <div className="entity-hero__right">
          <SkeletonHeroStats />
        </div>
      </section>

      <SkeletonTabs count={1} />

      <div className="entity-layout" aria-hidden="true">
        <div className="entity-main">
          <section className="section-block">
            <SkeletonBlock className="skeleton--line" style={{ width: 120, marginBottom: 14 }} />
            <div className="information-panel">
              <div className="information-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="information-cell">
                    <SkeletonBlock className="skeleton--line" style={{ width: '45%', marginBottom: 6 }} />
                    <SkeletonBlock className="skeleton--line" style={{ width: '60%' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="entity-sidebar">
          <SkeletonSidebarActions />
          <div className="entity-sidebar__panel">
            <SkeletonBlock className="skeleton--line" style={{ width: 140, marginBottom: 12 }} />
            <SkeletonRatingBars count={2} />
          </div>
        </aside>
      </div>
    </div>
  );
}
