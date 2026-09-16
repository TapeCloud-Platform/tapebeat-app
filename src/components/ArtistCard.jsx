import { useNavigate } from 'react-router-dom';
import { Card, Avatar } from '@heroui/react';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  function open() {
    navigate(`/artist/${encodeURIComponent(artist.title)}`);
  }

  return (
    <Card
      variant="transparent"
      className="artist-card"
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && open()}
    >
      <Avatar size="lg" className="artist-avatar">
        {artist.imageUrl && <Avatar.Image src={artist.imageUrl} alt={artist.title} />}
        <Avatar.Fallback>{artist.title?.[0] || '♪'}</Avatar.Fallback>
      </Avatar>
      <h3>{artist.title}</h3>
      <small>{artist.description}</small>
    </Card>
  );
}
