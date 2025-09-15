'use client';

import {useState} from 'react';
import { InfoProps } from '../types/types';

interface CollapsibleSectionProps{
  info:InfoProps[];
  defaultOpen?:boolean;
  id?:string;
}

const CollapsibleSection:React.FC<CollapsibleSectionProps>=({ info, defaultOpen=false,id })=>{
  const[openItems,setOpenItems]=useState<{[key:number]:boolean}>(
    info.reduce((acc, _, index) => ({ ...acc, [index]: defaultOpen }), {})
  );
  const toggleCollapse=(index:number)=>{
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };
  return(
    <div>
      {info.map((item, index)=>(
        <div key={index} className="border-b font-barlow border-zinc-200">
          <button type="button" className={`w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:none focus:ring-inset border border-zinc-200 transition-colors duration-200 ${openItems[index]?'bg-gray-50':''}`} aria-controls={`${id}-${index}`} aria-expanded={openItems[index]} onClick={() => toggleCollapse(index)}>
            <span className="font-bold text-gray-900">{item.title}</span>
            <span className="ml-2 flex-shrink-0" role="presentation">
              <svg aria-hidden="true" focusable="false" role="presentation" className={`w-7 h-4 transition-transform duration-300 ease-in-out ${openItems[index]?'rotate-180':'rotate-0'}`} viewBox="0 0 28 16">
                <path d="M1.57 1.59l12.76 12.77L27.1 1.59" strokeWidth="2" stroke="#000" fill="none" fillRule="evenodd"/>
              </svg>
            </span>
          </button>
          <div id={`${id}-${index}`} className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems[index]?'max-h-96 opacity-100':'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-gray-50 border-l border-r border-b border-zinc-200">
              <div className="prose prose-sm max-w-none text-gray-700">{item.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default CollapsibleSection;