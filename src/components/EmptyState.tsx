import type { ReactNode } from "react";

export default function EmptyState({
  icon = "📸",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="text-5xl">{icon}</div>
      <div className="text-lg font-bold text-ink">{title}</div>
      {description && <div className="max-w-xs text-sm text-subtext whitespace-pre-line">{description}</div>}
      {action}
    </div>
  );
}
