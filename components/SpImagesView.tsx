"use client";

import { useEffect, useState } from "react";
import type { SpImageRecord } from "@/app/api/sp-images/route";

export function SpImagesView({
  spCode,
  clauseId,
}: {
  spCode: string;
  clauseId: string;
}) {
  const [images, setImages] = useState<SpImageRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [spCode, clauseId]);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sp-images?spCode=${encodeURIComponent(spCode)}&clauseId=${encodeURIComponent(clauseId)}`
      );
      const json = (await res.json()) as any;
      setImages(json.ok ? json.images : []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400">
        Загрузка изображений...
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="text-sm font-semibold mb-3">Рисунки и схемы</div>
      <div className="grid gap-4">
        {images.map((img) => (
          <figure
            key={img.id}
            className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <img
              src={img.image_url}
              alt={img.alt_text || img.caption || ""}
              loading="lazy"
              className="w-full rounded-lg border border-zinc-100 dark:border-zinc-800"
            />
            {img.caption ? (
              <figcaption className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
