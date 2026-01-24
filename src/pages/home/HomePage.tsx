import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Refrigerator, PartyPopper, Sparkles, ArrowRight, MapPin, UtensilsCrossed, Car } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  to: string;
  cardClass: string;
  delay: string;
  variant: "primary" | "secondary" | "tertiary" | "quaternary";
}

function ServiceCard({ icon, title, subtitle, to, cardClass, delay, variant }: ServiceCardProps) {
  const textColorMap = {
    primary: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    tertiary: "text-tertiary-foreground",
    quaternary: "text-quaternary-foreground",
  };

  const subtextColorMap = {
    primary: "text-primary-foreground/80",
    secondary: "text-secondary-foreground/70",
    tertiary: "text-tertiary-foreground/80",
    quaternary: "text-quaternary-foreground/80",
  };

  const textColorClass = textColorMap[variant];
  const subtextColorClass = subtextColorMap[variant];

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${cardClass}`}
      style={{ animationDelay: delay }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-black/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-black/5" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-black/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>

        <h3 className={`mb-3 text-xl font-bold ${textColorClass}`}>{title}</h3>
        <p className={`mb-6 flex-1 text-md font-medium leading-relaxed ${subtextColorClass}`}>{subtitle}</p>

        <div className={`flex items-center gap-2 text-sm font-medium ${subtextColorClass} transition-all duration-300 group-hover:gap-4`}>
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

  const services: Array<{
    icon: React.ReactNode;
    titleKey: string;
    subtitleKey: string;
    to: string;
    cardClass: string;
    delay: string;
    variant: "primary" | "secondary" | "tertiary" | "quaternary";
  }> = [
      {
        icon: <Refrigerator className="h-8 w-8 text-primary-foreground" />,
        titleKey: "home.fridgeStocking.title",
        subtitleKey: "home.fridgeStocking.subtitle",
        to: `/${language}/fridge-stocking`,
        cardClass: "bg-primary",
        delay: "0ms",
        variant: "primary",
      },
      {
        icon: <PartyPopper className="h-8 w-8 text-secondary-foreground" />,
        titleKey: "home.celebration.title",
        subtitleKey: "home.celebration.subtitle",
        to: `/${language}/celebration`,
        cardClass: "bg-secondary",
        delay: "100ms",
        variant: "secondary",
      },
      {
        icon: <Sparkles className="h-8 w-8 text-tertiary-foreground" />,
        titleKey: "home.housekeeping.title",
        subtitleKey: "home.housekeeping.subtitle",
        to: `/${language}/housekeeping`,
        cardClass: "bg-tertiary",
        delay: "200ms",
        variant: "tertiary",
      },
    ];

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-amber-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-top-left bg-no-repeat"
          style={{
            backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/3/37/Bah%C3%ADa_De_Asunci%C3%B3n_%2843639068%29.jpeg")`,
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Photo credit */}
        <a
          href="https://commons.wikimedia.org/wiki/File:Bah%C3%ADa_De_Asunci%C3%B3n_(43639068).jpeg"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-4 text-[8px] md:text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          Photo: Anibal Ovelar
        </a>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl animate-fade-in-up drop-shadow-lg">
              {t("home.title")}
            </h1>

            <p className="text-lg leading-relaxed text-white/90 md:text-xl animate-fade-in-up drop-shadow" style={{ animationDelay: "100ms" }}>
              {t("home.welcome")}
            </p>

            <p className="mt-6 text-lg leading-relaxed text-white/90 md:text-xl animate-fade-in-up drop-shadow" style={{ animationDelay: "200ms" }}>
              {t("home.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto mt-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-3">{t("home.servicesSection")}</h2>
          <p className="text-stone-600 text-lg">{t("home.servicesSectionDescription")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={t(service.titleKey)}
              subtitle={t(service.subtitleKey)}
              to={service.to}
              cardClass={service.cardClass}
              delay={service.delay}
              variant={service.variant}
            />
          ))}
        </div>
      </section>

      {/* Guide Section */}
      <section className="container mx-auto mt-16 px-4 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-3">{t("home.guideSection")}</h2>
          <p className="text-stone-600 text-lg">{t("home.guideSectionDescription")}</p>
        </div>
        <div className="grid gap-6 grid-cols-1 max-w-sm mx-auto md:max-w-none md:grid-cols-3">
          <ServiceCard
            icon={<MapPin className="h-8 w-8 text-quaternary-foreground" />}
            title={t("home.localGuide.title")}
            subtitle={t("home.localGuide.subtitle")}
            to={`/${language}/tips`}
            cardClass="bg-quaternary"
            delay="0ms"
            variant="quaternary"
          />
          <ServiceCard
            icon={<UtensilsCrossed className="h-8 w-8 text-primary-foreground" />}
            title={t("home.restaurants.title")}
            subtitle={t("home.restaurants.subtitle")}
            to={`/${language}/businesses?tag=Restaurantes`}
            cardClass="bg-primary"
            delay="100ms"
            variant="primary"
          />
          <ServiceCard
            icon={<Car className="h-8 w-8 text-secondary-foreground" />}
            title={t("home.carRental.title")}
            subtitle={t("home.carRental.subtitle")}
            to={`/${language}/businesses?tag=Alquiler de Autos`}
            cardClass="bg-secondary"
            delay="200ms"
            variant="secondary"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
