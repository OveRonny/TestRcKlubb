import { useEffect, useState } from 'react';

interface Placement {
  url: string;
  altText: string;
}

interface ManagedImageProps {
  placement: string;
  fallbackSrc: string;
  fallbackAlt: string;
  className?: string;
}

export default function ManagedImage({ placement, fallbackSrc, fallbackAlt, className }: ManagedImageProps) {
  const [image, setImage] = useState<Placement>();

  useEffect(() => {
    fetch(`/api/media/placements/${encodeURIComponent(placement)}`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(setImage)
      .catch(() => setImage(undefined));
  }, [placement]);

  return <img className={className} src={image?.url ?? fallbackSrc} alt={image?.altText || fallbackAlt} />;
}
