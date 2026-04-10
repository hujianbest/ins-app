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
      <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-medium text-white sm:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
        {description}
      </p>
    </div>
  );
}
