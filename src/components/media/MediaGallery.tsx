import Image from "next/image";

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
          className="relative block aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <Image
            src={item.url}
            alt={item.caption ?? "Story photo"}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </a>
      ))}
    </div>
  );
}
