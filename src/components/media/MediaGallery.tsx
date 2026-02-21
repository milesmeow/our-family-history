interface MediaItem {
  id: string;
  url: string;
  caption?: string | null;
}

interface MediaGalleryProps {
  media: MediaItem[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {media.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <img
            src={item.url}
            alt={item.caption ?? "Story photo"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </a>
      ))}
    </div>
  );
}
