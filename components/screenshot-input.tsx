type ScreenshotInputProps = {
  previewUrl: string | null;
  fileError: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
};

export function ScreenshotInput({ previewUrl, fileError, onSelect, onRemove }: ScreenshotInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="screenshot" className="text-sm font-medium">
        Capture PNG ou JPEG
      </label>
      <input
        id="screenshot"
        name="screenshot"
        type="file"
        accept="image/png,image/jpeg"
        className="block w-full min-h-11 text-sm file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onSelect(file);
          }
        }}
      />
      {fileError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {fileError}
        </p>
      ) : null}
      {previewUrl ? (
        <div className="flex flex-col gap-3">
          {/* Blob previews stay local. next/image does not load unconfigured blob URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Aperçu de la capture sélectionnée"
            className="max-h-80 w-full rounded-md border border-zinc-300 object-contain dark:border-zinc-700"
          />
          <button
            type="button"
            onClick={onRemove}
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm dark:border-zinc-700"
          >
            Retirer l&apos;image
          </button>
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Aucune capture sélectionnée.</p>
      )}
    </div>
  );
}
