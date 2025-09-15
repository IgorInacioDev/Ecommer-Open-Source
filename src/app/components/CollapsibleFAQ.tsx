'use client';

import {useState} from 'react';
import { InfoProps } from '../types/types';

interface CollapsibleFAQProps{
  info:InfoProps[];
  id?:string;
}

const CollapsibleFAQ:React.FC<CollapsibleFAQProps>=({ info,id })=>{
  const[openIndex,setOpenIndex]=useState<number | null>(null);
  
  const toggleCollapse=(index:number)=>{
    setOpenIndex(openIndex === index ? null : index);
  };

  return(
    <div className="flex flex-col items-center justify-center w-full">
      {info.map((item, index)=>(
        <div key={index} className="font-barlow w-full max-w-2xl mx-auto">
          <button 
            type="button" 
            className={`w-full flex items-center p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:none focus:ring-blue-500 focus:ring-inset transition-colors duration-200 ${openIndex === index ?'bg-gray-50':''}`} 
            aria-controls={`${id}-${index}`} 
            aria-expanded={openIndex === index} 
            onClick={() => toggleCollapse(index)}
          >
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 rounded-full border border-zinc-200 p-2" role="presentation">
                <svg 
                  aria-hidden="true" 
                  focusable="false" 
                  role="presentation" 
                  className={`w-3 h-3 transition-transform duration-300 ease-in-out ${openIndex === index ?'rotate-180':'rotate-0'}`} 
                  viewBox="0 0 28 16"
                >
                  <path d="M1.57 1.59l12.76 12.77L27.1 1.59" strokeWidth="2" stroke="#333333" fill="none" fillRule="evenodd"/>
                </svg>
              </span>
              <span className="text-sm text-zinc-800">{item.title}</span>
            </div>
          </button>
          <div 
            id={`${id}-${index}`} 
            className={`overflow-hidden transition-all duration-300 px-4 ease-in-out ${openIndex === index ?'max-h-96 opacity-100':'max-h-0 opacity-0'}`}
          >
            <div className="prose prose-sm text-sm max-w-none text-gray-700">{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default CollapsibleFAQ;