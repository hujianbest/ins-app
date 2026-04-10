type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="museum-label">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)] sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
        {description}
      </p>
    </div>
  );
}
