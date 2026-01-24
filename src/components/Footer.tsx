import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";


export default function Footer() {
  const { t } = useTranslation();
  const language = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-800 text-stone-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Meet Asunción</h3>
            <p className="text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/${language}/fridge-stocking`} className="hover:text-white transition-colors">
                  {t("nav.fridgeStocking")}
                </Link>
              </li>
              <li>
                <Link to={`/${language}/celebration`} className="hover:text-white transition-colors">
                  {t("nav.celebration")}
                </Link>
              </li>
              <li>
                <Link to={`/${language}/housekeeping`} className="hover:text-white transition-colors">
                  {t("nav.housekeeping")}
                </Link>
              </li>
              <li>
                <Link to={`/${language}/tips`} className="hover:text-white transition-colors">
                  {t("nav.localGuide")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4" />
                <a
                  href="https://wa.me/595972174685"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +595 972 174 685
                </a>
              </li>
              <li className="flex items-center gap-2">
                <img src="/assets/img/airbnb-icon.svg" alt="Airbnb" className="h-4 w-4 brightness-0 invert" />
                <a
                  href="https://www.airbnb.com/rooms/1187650465175287549"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Airbnb
                </a>
              </li>
              <li className="text-stone-400 mt-2">
                Asunción, Paraguay
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} Meet Asunción. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
