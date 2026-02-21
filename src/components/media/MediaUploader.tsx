"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { generateReactHelpers } from "@uploadthing/react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { OurFileRouter } from "@/lib/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ExistingMedia {
  id: string;
  url: string;
}

interface MediaUploaderProps {
  existingMedia?: ExistingMedia[];
}

export function MediaUploader({ existingMedia = [] }: MediaUploaderProps) {
  const t = useTranslations("entries.form");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // IDs of existing media the user has chosen to keep (starts as all of them)
  const [keptExistingIds, setKeptExistingIds] = useState<string[]>(
    existingMedia.map((m) => m.id)
  );

  // URLs of newly uploaded images
  const [newUploads, setNewUploads] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("storyImageUploader", {
    onClientUploadComplete: (res) => {
      const urls = res?.map((r) => r.url) ?? [];
      setNewUploads((prev) => [...prev, ...urls]);
    },
    onUploadError: (error) => {
      setUploadError(error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    await startUpload(files);
    // Reset so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveExisting = (id: string) => {
    setKeptExistingIds((prev) => prev.filter((i) => i !== id));
  };

  const handleRemoveNew = (url: string) => {
    setNewUploads((prev) => prev.filter((u) => u !== url));
  };

  const keptExistingMedia = existingMedia.filter((m) =>
    keptExistingIds.includes(m.id)
  );
  const removedIds = existingMedia
    .map((m) => m.id)
    .filter((id) => !keptExistingIds.includes(id));

  const totalCount = keptExistingMedia.length + newUploads.length;

  return (
    <div className="space-y-4">
      {/* Hidden inputs for the server action */}
      {newUploads.map((url) => (
        <input key={url} type="hidden" name="newMediaUrls" value={url} />
      ))}
      {removedIds.map((id) => (
        <input key={id} type="hidden" name="removedMediaIds" value={id} />
      ))}

      {/* Photo preview grid */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {keptExistingMedia.map((media) => (
            <div key={media.id} className="relative group aspect-square">
              <img
                src={media.url}
                alt={t("photoAlt")}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveExisting(media.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label={t("removePhoto")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {newUploads.map((url) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={t("photoAlt")}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveNew(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label={t("removePhoto")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("uploadingPhotos")}
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4" />
            {t("addPhotos")}
          </>
        )}
      </button>

      {/* Hidden file input — multiple allowed */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload error */}
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
