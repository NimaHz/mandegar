"use client";

import { useState } from "react";

import type { AdminMedia } from "@/types/admin";

import { uploadMedia } from "../../lib/upload";
import { notifyError } from "../../lib/use-admin-mutation";

export function useMediaUpload() {
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (file: File): Promise<AdminMedia | null> => {
    setProgress(0);
    const result = await uploadMedia(file, { onProgress: setProgress });
    setProgress(null);
    if (!result.ok) {
      notifyError(result.error);
      return null;
    }
    return result.media;
  };

  return { upload, progress, uploading: progress !== null };
}
