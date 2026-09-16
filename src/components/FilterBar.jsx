import { useState } from 'react';
import { Select, ListBox, SearchField } from '@heroui/react';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'listeners', label: 'Más oyentes' },
  { value: 'playcount', label: 'Más reproducciones' },
];

/**
 * Barra de filtros horizontal, estilo Musicboard: selects de Género/País
 * a la izquierda, buscador a la derecha. Usa los mismos filtros que ya
 * expone el backend (getFilters) — nada de opciones inventadas.
 *
 * El orden (sortBy) se calcula del lado del cliente porque el backend de
 * discovery no expone un parámetro de sort ni fecha de lanzamiento; los
 * datos de oyentes/reproducciones ya vienen (como texto) en cada resultado.
 */
export default function FilterBar({ filters, active, onApply, sortBy, onSortChange }) {
  const [query, setQuery] = useState('');

  const genreFilter = filters.find((filter) => filter.type === 'genre');
  const countryFilter = filters.find((filter) => filter.type === 'country');
  // El orden por oyentes/reproducciones solo tiene datos reales en la vista
  // "Más escuchadas": los resultados de género/país/búsqueda no traen esos
  // números desde el backend, así que ahí no tendría ningún efecto.
  const canSort = active.type === 'top';

  function handleSelect(type, value) {
    if (!value) {
      onApply({ type: 'top', value: '' });
      return;
    }
    onApply({ type, value });
  }

  function submitSearch(event) {
    event.preventDefault();
    if (query.trim()) {
      onApply({ type: 'search', value: query.trim() });
    }
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__selects">
        {genreFilter && (
          <Select
            className="filter-select"
            aria-label="Filtrar por género"
            placeholder="Género"
            selectedKey={active.type === 'genre' ? active.value : null}
            onSelectionChange={(key) => handleSelect('genre', key)}
            onClear={() => handleSelect('genre', '')}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
              <Select.ClearButton />
            </Select.Trigger>
            <Select.Popover>
              <ListBox items={genreFilter.options}>
                {(option) => (
                  <ListBox.Item id={option.value} textValue={option.label}>
                    {option.label}
                  </ListBox.Item>
                )}
              </ListBox>
            </Select.Popover>
          </Select>
        )}

        {countryFilter && (
          <Select
            className="filter-select"
            aria-label="Filtrar por país"
            placeholder="País"
            selectedKey={active.type === 'country' ? active.value : null}
            onSelectionChange={(key) => handleSelect('country', key)}
            onClear={() => handleSelect('country', '')}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
              <Select.ClearButton />
            </Select.Trigger>
            <Select.Popover>
              <ListBox items={countryFilter.options}>
                {(option) => (
                  <ListBox.Item id={option.value} textValue={option.label}>
                    {option.label}
                  </ListBox.Item>
                )}
              </ListBox>
            </Select.Popover>
          </Select>
        )}

        {canSort && (
          <Select
            className="filter-select"
            aria-label="Ordenar por"
            selectedKey={sortBy}
            onSelectionChange={(key) => onSortChange(key)}
            disallowEmptySelection
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox items={SORT_OPTIONS}>
                {(option) => (
                  <ListBox.Item id={option.value} textValue={option.label}>
                    {option.label}
                  </ListBox.Item>
                )}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      </div>

      <form className="filter-bar__search" onSubmit={submitSearch}>
        <SearchField aria-label="Buscar música" value={query} onChange={setQuery}>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Buscar música..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </form>
    </div>
  );
}
