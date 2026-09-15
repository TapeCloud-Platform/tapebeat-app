import TrackCard from './TrackCard';
import ArtistCard from './ArtistCard';

export default function CatalogPage({
  items,
  loading,
  error,
  activeFilter,
  active,
  onClearFilters,
}) {
  const isFiltered = active.type !== 'top';
  const activeLabel = activeFilter?.options?.find((option) => option.value === active.value)?.label
    ?? active.value;

  const artists = items.filter((item) => item.kind === 'artist');
  const tracks = items
    .filter((item) => item.kind !== 'artist')
    .map((item) => ({ ...item, id: item.externalId }));

  return (
    <main className="app-main">
      <section className="section-block">
        <div className="section-header">
          <h2>{activeFilter?.label ?? 'Contenido'}</h2>
          {!loading && <span className="count-badge">{tracks.length} resultados</span>}

          {isFiltered && (
            <button type="button" className="active-filter-chip" onClick={onClearFilters}>
              {activeLabel}
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading-text">Cargando...</p>
        ) : (
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

            <div className="cards-grid">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
