import { InfoProps } from "@/app/types/types";
import CollapsibleFAQ from "../CollapsibleFAQ";

export default function FAQ({title, info}: {title: string, info: InfoProps[]}) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-10 mx-auto">
      <h1 className="font-syne font-semibold text-3xl tracking-wide text-[#333333]">{title}</h1>
      <CollapsibleFAQ info={info} id="Product-content-tab76525525941290"/>
    </div>
  )
}