import Link from "next/link";

import { EditorialCard } from "@/features/cards/editorial-card";
import { OpportunityCard } from "@/features/opportunities/opportunity-card";
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
      title: "合作线索",
      items: results.opportunities,
    },
  ];
  const firstVisibleGroupKey =
    resultGroups.find((group) => group.items.length > 0)?.key ?? null;

  return (
    <main className="museum-page">
      <section className="museum-shell pt-14">
        <PageHero
          eyebrow="高匹配发现"
          title={hasQuery ? results.query : "搜索高匹配语境"}
          description={
            hasQuery
              ? `${results.total} 条结果`
              : "按城市、方向、创作者与合作线索搜索公开发现语境。"
          }
          actions={[
            { href: "/discover", label: "发现" },
            { href: "/studio", label: "工作台", variant: "primary" },
          ]}
          aside={
            <div className="space-y-4">
              <p className="museum-label">高匹配搜索</p>
              <form action="/search" className="grid gap-3">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="上海 / 夜色编辑人像 / 长期合作模特"
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
                      {group.items.map((item, itemIndex) => {
                        const shouldEagerLoad =
                          group.key === firstVisibleGroupKey && itemIndex === 0;

                        return item.kind === "opportunity" ? (
                          <OpportunityCard
                            key={item.id}
                            href={item.href}
                            assetRef={item.assetRef}
                            visualLabel={item.badge}
                            visualDescription={item.visualDescription}
                            imageLoading={shouldEagerLoad ? "eager" : undefined}
                            title={item.title}
                            summary={item.description}
                            ownerName={item.meta}
                            titleTag="h2"
                          />
                        ) : (
                          <EditorialCard
                            key={item.id}
                            href={item.href}
                            assetRef={item.assetRef}
                            visualLabel={item.badge}
                            visualDescription={item.visualDescription}
                            imageLoading={shouldEagerLoad ? "eager" : undefined}
                            title={item.title}
                            summary={item.description}
                            footerText={item.meta}
                            titleTag="h2"
                          />
                        )
                      })}
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
              title="语境搜索词"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {["夜色编辑人像", "杭州 品牌形象", "长期合作模特", "beauty 摄影"].map((suggestion) => (
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
