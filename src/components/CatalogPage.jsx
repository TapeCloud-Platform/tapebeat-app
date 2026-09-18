import { useMemo } from 'react';
import { Chip } from '@heroui/react';
import TrackCard from './TrackCard';
import ArtistCard from './ArtistCard';
import StackedShelf from './StackedShelf';
import TopSlider from './TopSlider';
import { SkeletonCatalogGrid } from './Skeleton';
import LoadingIcon from './LoadingIcon';

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
  const filmstrip = tracks.slice(10, 26);
  const more = tracks.slice(26, 32);

  return (
    <main className="app-main">
      <section className="section-block">
        <div className="section-header">
          <h2>{activeFilter?.label ?? 'Contenido'}</h2>
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
              {activeLabel}
              <span aria-hidden="true">✕</span>
            </Chip>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <div className="catalog-loading">
            <SkeletonCatalogGrid count={10} />
            <div className="catalog-loading-icon-row">
              <LoadingIcon size={22} />
            </div>
          </div>
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

            <div className="cards-grid">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </>
        ) : (
          <>
            <TopSlider title="Más escuchadas" tracks={hero} />

            {filmstrip.length > 0 && (
              <div className="filmstrip-block">
                <h3 className="subsection-title">Descubrí más</h3>
                <p className="stack-shelf__hint">Pasá el mouse para desplegar el mazo</p>
                <StackedShelf tracks={filmstrip} />
              </div>
            )}

            <div className="split-section">
              {featuredArtists.length > 0 && (
                <div className="split-col">
                  <h3 className="subsection-title">Artistas destacados</h3>
                  <div className="artists-row artists-row--compact">
                    {featuredArtists.map((artist) => (
                      <ArtistCard key={artist.externalId} artist={artist} />
                    ))}
                  </div>
                </div>
              )}

              {more.length > 0 && (
                <div className="split-col split-col--narrow">
                  <h3 className="subsection-title">Seguí escuchando</h3>
                  <div className="mini-grid">
                    {more.map((track) => (
                      <TrackCard key={track.id} track={track} variant="mini" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
