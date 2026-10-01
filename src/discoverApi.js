const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getFilters(sourceApp) {
  const response = await fetch(`${API_URL}/api/discover/${sourceApp}/filters`);
  if (!response.ok) {
    throw new Error('No se pudieron cargar los filtros.');
  }
  return response.json();
}

export async function discover(sourceApp, { type = 'top', value = '', limit = 30 } = {}) {
  const params = new URLSearchParams({ type, limit: String(limit) });
  if (value) {
    params.set('value', value);
  }

  const response = await fetch(`${API_URL}/api/discover/${sourceApp}?${params}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'No se pudo cargar el contenido.');
  }
  return response.json();
}

export async function getProfile(sourceApp, name) {
  const params = new URLSearchParams({ value: name });
  const response = await fetch(`${API_URL}/api/discover/${sourceApp}/profile?${params}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

/** Álbum de origen de una canción (nombre, portada y descripción, si el backend los tiene). */
export async function getTrackDetail(sourceApp, artist, track) {
  const params = new URLSearchParams({ artist, track });
  const response = await fetch(`${API_URL}/api/discover/${sourceApp}/track?${params}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

/** Ficha de un álbum (portada, descripción, lista de temas), sin pasar por una canción puntual. */
export async function getAlbumDetail(sourceApp, artist, album) {
  const params = new URLSearchParams({ artist, album });
  const response = await fetch(`${API_URL}/api/discover/${sourceApp}/album?${params}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

/** Búsqueda pública de usuarios (nombre visible + avatar, sin emails). */
export async function searchUsers(query, limit = 4) {
  const q = (query || '').trim();
  if (q.length < 2) {
    return [];
  }
  const response = await fetch(`${API_URL}/api/users/search?${new URLSearchParams({ q })}`);
  if (!response.ok) {
    return [];
  }
  const users = await response.json().catch(() => []);
  return (Array.isArray(users) ? users : []).slice(0, limit).map((u) => ({
    externalId: `user:${u.username}`,
    title: u.displayName || u.username,
    subtitle: `@${u.username}`,
    description: 'Usuario de TapeCloud',
    imageUrl: u.avatarDataUri || null,
    genre: u.username,
    kind: 'user',
  }));
}

/**
 * Búsqueda agrupada del header: canciones + artistas + álbumes + usuarios en paralelo.
 * `discover(search)` ya trae artistas y canciones unificados; los álbumes van aparte.
 */
export async function searchAll(sourceApp, query, perGroup = 3) {
  const q = (query || '').trim();
  if (q.length < 2) {
    return { groups: [], flat: [] };
  }
  const [unified, albums, users] = await Promise.all([
    discover(sourceApp, { type: 'search', value: q, limit: perGroup * 2 }).catch(() => []),
    discover(sourceApp, { type: 'album', value: q, limit: perGroup }).catch(() => []),
    searchUsers(q, perGroup),
  ]);
  const artists = unified.filter((item) => item.kind === 'artist').slice(0, perGroup);
  const tracks = unified.filter((item) => item.kind !== 'artist').slice(0, perGroup);
  const groups = [];
  if (tracks.length > 0) {
    groups.push({ key: 'tracks', label: 'Canciones', items: tracks });
  }
  if (artists.length > 0) {
    groups.push({ key: 'artists', label: 'Artistas', items: artists });
  }
  if (albums.length > 0) {
    groups.push({ key: 'albums', label: 'Álbumes', items: albums.slice(0, perGroup) });
  }
  if (users.length > 0) {
    groups.push({ key: 'users', label: 'Usuarios', items: users });
  }
  return { groups, flat: groups.flatMap((g) => g.items) };
}

/** Perfil público de un usuario (stats de reseñas, sin email). */
export async function getUserProfile(username) {
  const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(username)}/profile`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}
