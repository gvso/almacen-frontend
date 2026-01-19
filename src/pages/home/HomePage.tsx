import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Refrigerator, PartyPopper, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  to: string;
  gradient: string;
  delay: string;
}

function ServiceCard({ icon, title, subtitle, to, gradient, delay }: ServiceCardProps) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}
      style={{ animationDelay: delay }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
      
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="mb-6 flex-1 text-base leading-relaxed text-white/80">{subtitle}</p>
        
        <div className="flex items-center gap-2 text-sm font-medium text-white/90 transition-all duration-300 group-hover:gap-4">
          <span>Explore</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const language = useLanguage();

  const services = [
    {
      icon: <Refrigerator className="h-8 w-8 text-white" />,
      titleKey: "home.fridgeStocking.title",
      subtitleKey: "home.fridgeStocking.subtitle",
      to: `/${language}/fridge-stocking`,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      delay: "0ms",
    },
    {
      icon: <PartyPopper className="h-8 w-8 text-white" />,
      titleKey: "home.celebration.title",
      subtitleKey: "home.celebration.subtitle",
      to: `/${language}/celebration`,
      gradient: "bg-gradient-to-br from-rose-400 to-pink-600",
      delay: "100ms",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      titleKey: "home.housekeeping.title",
      subtitleKey: "home.housekeeping.subtitle",
      to: `/${language}/housekeeping`,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
      delay: "200ms",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Welcome badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              {t("home.badge")}
            </div>
            
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-stone-800 md:text-5xl lg:text-6xl animate-fade-in-up">
              {t("home.title")}
            </h1>
            
            <p className="text-lg leading-relaxed text-stone-600 md:text-xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {t("home.welcome")}
            </p>
            
            <p className="mt-6 text-lg leading-relaxed text-stone-600 md:text-xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              {t("home.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={t(service.titleKey)}
              subtitle={t(service.subtitleKey)}
              to={service.to}
              gradient={service.gradient}
              delay={service.delay}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
