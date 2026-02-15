"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { generateReactHelpers } from "@uploadthing/react";
import { Camera, Loader2, User, X } from "lucide-react";
import type { OurFileRouter } from "@/lib/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface AvatarUploaderProps {
  initialUrl?: string | null;
  inputName?: string;
}

export function AvatarUploader({
  initialUrl,
  inputName = "avatarUrl",
}: AvatarUploaderProps) {
  const t = useTranslations("people.form");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialUrl ?? null
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    initialUrl ?? null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        setPreviewUrl(res[0].url);
        setUploadedUrl(res[0].url);
      }
    },
    onUploadError: (error) => {
      // Revert preview to the last successfully uploaded URL
      setPreviewUrl(uploadedUrl);
      setUploadError(error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    await startUpload([file]);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Hidden input carries the URL into FormData */}
      <input type="hidden" name={inputName} value={uploadedUrl ?? ""} />

      {/* Avatar preview circle */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-blue-600" />
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4" />
          {isUploading ? t("uploading") : t("uploadPhoto")}
        </button>

        {previewUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            {t("removePhoto")}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
