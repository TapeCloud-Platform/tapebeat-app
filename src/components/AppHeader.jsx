import { useEffect, useState } from 'react';
import { Button, Link, SearchField } from '@heroui/react';
import tapebeatIcon from '../assets/tapebeat-icon.png';

export default function AppHeader({
  appName,
  tagline,
  portalUrl,
  sessionUser,
  onLogout,
  onSearch,
  onOpenMenu,
  onHome,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!searchOpen) {
      setQuery('');
    }
  }, [searchOpen]);

  function submitSearch(event) {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setSearchOpen(false);
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__bar">
        <button type="button" className="app-header__brand" onClick={onHome} aria-label="Volver al inicio">
          <img className="app-header__logo" src={tapebeatIcon} alt="" aria-hidden="true" />
          <div>
            <h1 className="app-header__title">{appName}</h1>
            <p className="app-header__tagline">{tagline}</p>
          </div>
        </button>

        <div className="app-header__actions">
          {searchOpen && (
            <form className="header-search" onSubmit={submitSearch}>
              <SearchField aria-label="Buscar" value={query} onChange={setQuery}>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    autoFocus
                    placeholder="Buscar..."
                    onBlur={() => !query && setSearchOpen(false)}
                  />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </form>
          )}

          <Button
            isIconOnly
            variant="ghost"
            className="icon-button"
            onClick={() => (searchOpen ? setSearchOpen(false) : setSearchOpen(true))}
            aria-label="Buscar"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </Button>

          <Button isIconOnly variant="ghost" className="icon-button" onClick={onOpenMenu} aria-label="Abrir categorías">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </Button>

          <Link className="back-to-portal" href={portalUrl}>
            Portal
          </Link>

          {sessionUser ? (
            <div className="session-container">
              <span className="session-badge">{sessionUser.displayName}</span>
              <Button size="sm" variant="outline" className="logout-button-small" onClick={onLogout}>
                Salir
              </Button>
            </div>
          ) : (
            <Link className="inline-login-btn" href={portalUrl}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
