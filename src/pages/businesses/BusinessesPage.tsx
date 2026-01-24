import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { AdminEditButton } from "@/components/AdminEditButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdmin } from "@/hooks/useAdmin";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { ErrorAlert } from "@/components/Alert";
import { fetchTips } from "@/services/tips";
import { getTags } from "@/services/tags";
import type { Tip } from "@/types/Tip";

export default function BusinessesPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAdmin({ skipVerification: true });

  // Get tag label from URL params
  const tagLabelFromUrl = searchParams.get("tag");

  // Fetch tags for business tips
  const { data: tagsData } = useQuery({
    queryKey: ["tags", language, "business"],
    queryFn: () => getTags({ language, tipType: "business" }),
  });

  // Derive selectedTagId from URL and tags data
  const tags = tagsData?.data;
  const selectedTagId = useMemo(() => {
    if (!tagLabelFromUrl || !tags) return null;
    return tags.find(
      (tag) => tag.key.toLowerCase() === tagLabelFromUrl.toLowerCase()
    )?.id ?? null;
  }, [tagLabelFromUrl, tags]);

  // Update URL when tag selection changes
  const handleTagSelect = (tagId: number | null) => {
    if (tagId === null) {
      searchParams.delete("tag");
      setSearchParams(searchParams);
    } else {
      const selectedTag = tagsData?.data?.find((t) => t.id === tagId);
      if (selectedTag) {
        // Use the key (base label) in URL so it works regardless of language
        setSearchParams({ tag: selectedTag.key });
      }
    }
  };

  // Fetch business tips
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tips", language, "business", selectedTagId],
    queryFn: () =>
      fetchTips({
        language,
        tipType: "business",
        tagIds: selectedTagId ? [selectedTagId] : undefined,
      }),
  });

  const tips = data?.data ?? [];

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-amber-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">{t("businesses.badge")}</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              {t("businesses.title")}
            </h1>
            <p className="text-lg leading-relaxed text-white/90 md:text-xl">
              {t("businesses.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Tag Filter */}
        {tagsData?.data && tagsData.data.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => handleTagSelect(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTagId === null
                ? "bg-secondary text-secondary-foreground"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
            >
              {t("common.all", "All")}
            </button>
            {tagsData.data.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTagId === tag.id
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {/* Error State */}
        {isError && <ErrorAlert message={t("businesses.loadError")} />}

        {/* Empty State */}
        {!isLoading && !isError && tips.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t("businesses.empty")}
          </div>
        )}

        {/* Business Cards Grid */}
        {!isLoading && !isError && tips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip) => (
              <BusinessCard
                key={tip.id}
                tip={tip}
                isAdmin={isAdmin}
                onEdit={() =>
                  navigate(`/${language}/admin/tips/${tip.id}`, {
                    state: { fromMarketplace: window.location.pathname },
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface BusinessCardProps {
  tip: Tip;
  isAdmin?: boolean;
  onEdit?: () => void;
}

function BusinessCard({ tip, isAdmin, onEdit }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {tip.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={tip.imageUrl}
            alt={tip.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start gap-2">
          {isAdmin && onEdit && <AdminEditButton onClick={onEdit} />}
          <h3 className="font-semibold text-lg text-stone-800">{tip.title}</h3>
        </div>
        {tip.tags && tip.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tip.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
        <div
          className="mt-3 text-sm text-stone-600 prose prose-sm max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{ __html: tip.description }}
        />
      </div>
    </div>
  );
}
