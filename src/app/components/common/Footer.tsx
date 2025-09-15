import { FacebookIcon, Instagram } from "lucide-react";
import FooterSection from "../layout/Footer/FooterSection";
import Newsletter from "../layout/Footer/Newsletter";
import SocialButton from "../layout/Footer/SocialButton";
import FooterInfo from "../layout/Footer/FooterInfo";

// Types and Interfaces
export type FooterItem = string | { text: string; bold?: boolean };

interface IFooterSection {
  title: string;
  items: FooterItem[];
}

// Constants
const FOOTER_SECTIONS: IFooterSection[] = [
  {
    title: "A Lure Secret",
    items: ["Sobre a Lure Secret", "Onde encontrar", "Blog da Lure Secret", "Trabalhe na Lure Secret"],
  },
  {
    title: "Ajuda",
    items: ["Perguntas frequentes", "Canais oficiais", "Regulamentos", "Trocas e Devoluções", "Termos de uso", "Política de Privacidade"],
  },
  {
    title: "Chama a gente",
    items: [
      { text: "contato@luresecret.com.br", bold: true },
      { text: "WhatsApp: +55 11 93761-1577", bold: true },
      { text: "Segunda à sexta – 8h às 20h​" },
      { text: "Sábado e domingo – 8h às 16h​" },
      { text: "Exceto feriados​" },
    ],
  },
];


const Footer: React.FC = () => {

  const renderSocialButtons = () => (
    <div className="text-[#F5F5F5] pb-4 mb-8 md:mb-8">
      <h1 className="text-sm mb-4 font-bold">ESTAMOS AQUI</h1>
      <div className="flex gap-4 text-2xl justify-center md:justify-start">
        <SocialButton 
            icon={<Instagram />} 
            url="https://instagram.com/lure.secret" 
            hoverColor="text-pink-300" 
          />
          <SocialButton 
            icon={<FacebookIcon />} 
            url="https://facebook.com/lure.secret" 
            hoverColor="text-blue-300" 
          />
      </div>
    </div>
  );

  return (
    <section className="bg-[#212122] font-barlow">
      <Newsletter/>
      <div className="mx-auto px-4 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-9/12">
        <div className="flex flex-col md:flex-row md:justify-between py-6 md:py-8 gap-6 md:gap-0">
          <div className="flex flex-col sm:flex-row sm:justify-between md:contents gap-6 sm:gap-8">
            {FOOTER_SECTIONS.map(section => (
              <FooterSection key={section.title} {...section} />
            ))}
          </div>
          <div className="flex justify-center md:block">
            {renderSocialButtons()}
          </div>
        </div>
        <FooterInfo />
      </div>
    </section>
  );
};

export default Footer;