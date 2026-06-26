type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
      <p className="font-headline text-headline-md text-on-surface">{title}</p>
      {description ? <p className="mt-2 text-body-md text-on-surface-variant">{description}</p> : null}
    </div>
  );
}
