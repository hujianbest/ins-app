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
      description: "与当前关键词命中的公开作品。",
      items: results.works,
    },
    {
      key: "profiles",
      title: "创作者",
      description: "与当前关键词相关的摄影师与模特主页。",
      items: results.profiles,
    },
    {
      key: "opportunities",
      title: "合作内容",
      description: "与当前关键词有关的合作与招募内容。",
      items: results.opportunities,
    },
  ];

  return (
    <main className="pb-24 text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 lg:px-14">
        <PageHero
          eyebrow="Search"
          title={hasQuery ? `搜索 “${results.query}”` : "搜索作品、创作者与合作内容"}
          description={
            hasQuery
              ? `当前共命中 ${results.total} 条结果。你可以继续调整关键词，快速定位公开作品、创作者资料与合作内容。`
              : "通过作品标题、创作者姓名、城市、分类或合作关键词快速定位内容。"
          }
          actions={[
            { href: "/discover", label: "返回发现页" },
            { href: "/studio", label: "进入工作台", variant: "primary" },
          ]}
          aside={
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                Search Inputs
              </p>
              <form action="/search" className="grid gap-3">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="例如：上海、编辑人像、Mika"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
                >
                  搜索
                </button>
              </form>
            </div>
          }
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-14 sm:px-10 lg:px-14">
        {hasQuery ? (
          results.total > 0 ? (
            <div className="grid gap-8">
              {resultGroups.map((group) =>
                group.items.length > 0 ? (
                  <section
                    key={group.key}
                    className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.62)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                  >
                    <SectionHeading
                      eyebrow="Search Results"
                      title={group.title}
                      description={group.description}
                    />
                    <div className="mt-8 grid gap-4 xl:grid-cols-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
                        >
                          <EditorialVisual
                            assetRef={item.assetRef}
                            label={item.badge}
                            aspectClassName="aspect-[16/10]"
                            className="rounded-[1.25rem]"
                          />
                          <h2 className="mt-4 text-xl font-medium text-white transition group-hover:text-cyan-100">
                            {item.title}
                          </h2>
                          <p className="mt-3 text-sm leading-7 text-slate-300">
                            {item.description}
                          </p>
                          <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/45">
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
            <section className="rounded-[2rem] border border-dashed border-white/15 bg-[rgba(14,18,28,0.54)] px-6 py-12">
              <SectionHeading
                eyebrow="No Results"
                title="没有找到匹配内容"
                description="尝试搜索城市、作品分类、创作者姓名或合作关键词，例如“上海”“编辑人像”“Mika”。"
              />
            </section>
          )
        ) : (
          <section className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.62)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <SectionHeading
              eyebrow="Suggested Queries"
              title="从这些常见关键词开始"
              description="搜索页首发阶段支持作品、创作者与合作内容三类公开结果。"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {["上海", "编辑人像", "Mika", "合作"].map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-cyan-200/60 hover:bg-white/5"
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
