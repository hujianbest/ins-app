import Link from "next/link";

import { EditorialVisual } from "@/features/shell/editorial-visual";
import { PageHero } from "@/features/shell/page-hero";
import { SectionHeading } from "@/features/shell/section-heading";
import { searchCatalog } from "@/features/search/search";

function readQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
) {
  const value = searchParams?.q;

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = readQuery(resolvedSearchParams);
  const results = await searchCatalog(query);
  const hasQuery = Boolean(results.query);

  const resultGroups = [
    {
      key: "works",
      title: "作品",
      items: results.works,
    },
    {
      key: "profiles",
      title: "创作者",
      items: results.profiles,
    },
    {
      key: "opportunities",
      title: "合作内容",
      items: results.opportunities,
    },
  ];

  return (
    <main className="museum-page">
      <section className="museum-shell pt-14">
        <PageHero
          eyebrow="搜索"
          title={hasQuery ? results.query : "搜索"}
          description={
            hasQuery
              ? `${results.total} 条结果`
              : undefined
          }
          actions={[
            { href: "/discover", label: "发现" },
            { href: "/studio", label: "工作台", variant: "primary" },
          ]}
          aside={
            <div className="space-y-4">
              <p className="museum-label">搜索</p>
              <form action="/search" className="grid gap-3">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="上海 / Mika"
                  className="museum-field"
                />
                <button
                  type="submit"
                  className="museum-button-primary"
                >
                  搜索
                </button>
              </form>
            </div>
          }
        />
      </section>

      <section className="museum-shell pt-14">
        {hasQuery ? (
          results.total > 0 ? (
            <div className="grid gap-8">
              {resultGroups.map((group) =>
                group.items.length > 0 ? (
                  <section
                    key={group.key}
                    className="museum-panel p-6 md:p-8"
                  >
                    <SectionHeading
                      eyebrow="结果"
                      title={group.title}
                    />
                    <div className="mt-8 grid gap-5 xl:grid-cols-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="museum-card group block p-5"
                        >
                          <EditorialVisual
                            assetRef={item.assetRef}
                            label={item.badge}
                            variant="landscape"
                          />
                          <h2 className="font-display mt-5 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                            {item.title}
                          </h2>
                          <p className="museum-clamp-2 mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                            {item.description}
                          </p>
                          <p className="museum-label mt-5">
                            {item.meta}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null,
              )}
            </div>
          ) : (
            <section className="museum-empty px-6 py-12">
              <SectionHeading
                eyebrow="无结果"
                title="无结果"
                description="试试“上海”或“Mika”"
              />
            </section>
          )
        ) : (
          <section className="museum-panel p-6 md:p-8">
            <SectionHeading
              eyebrow="推荐"
              title="常用词"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {["上海", "编辑人像", "Mika", "合作"].map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="museum-tag"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
