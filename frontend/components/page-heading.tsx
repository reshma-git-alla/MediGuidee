export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-lg leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}
