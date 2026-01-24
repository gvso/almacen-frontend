import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdmin } from "@/hooks/useAdmin";
import Navbar from "@/components/Navbar";
import { TipCard } from "@/features/tips";
import { fetchTips } from "@/services/tips";

export default function TipsPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin({ skipVerification: true });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tips", language],
    queryFn: () => fetchTips(language),
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
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{t("tips.badge")}</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              {t("tips.title")}
            </h1>
            <p className="text-lg leading-relaxed text-white/90 md:text-xl">
              {t("tips.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="container mx-auto px-4 md:py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            {t("tips.loadError")}
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("tips.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-16">
            {tips.map((tip, index) => (
              <TipCard
                key={tip.id}
                tip={tip}
                colorIndex={index}
                isAdmin={isAdmin}
                onEdit={() => navigate(`/${language}/admin/tips/${tip.id}`, {
                  state: { fromMarketplace: window.location.pathname },
                })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
