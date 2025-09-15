import { FooterItem } from "../../common/Footer";

const FooterSection = ({ title, items }: { title: string; items: FooterItem[] }) => (
  <div className="text-[#F5F5F5] uppercase pb-4 mb-8 md:mb-16 text-center sm:text-left">
    <h1 className="text-xs mb-4 tracking-[0.3em] font-bold">{title}</h1>
    <div className="text-xs space-y-2">
      {items.map((item, idx) => {
        const text = typeof item === "string" ? item : item.text;
        const bold = typeof item === "string" ? false : item.bold;
        return <p key={idx} className={`${bold ? "font-bold" : ""}`}>{text}</p>;
      })}
    </div>
  </div>
);

export default FooterSection