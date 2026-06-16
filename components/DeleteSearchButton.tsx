"use client";

import { useTransition } from "react";

interface DeleteSearchButtonProps {
  id: string;
  onDelete?: (id: string) => void;
}

export default function DeleteSearchButton({
  id,
  onDelete,
}: DeleteSearchButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        // TODO: wire to a Server Action once DB is connected:
        //   import { deleteSearchAction } from "@/app/actions/searchHistory";
        //   await deleteSearchAction(id);
        onDelete?.(id);
      } catch {
        // silent — parent decides how to surface errors
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete search"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
    >
      {isPending ? (
        <svg
          className="w-3.5 h-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
      Delete
    </button>
  );
}
