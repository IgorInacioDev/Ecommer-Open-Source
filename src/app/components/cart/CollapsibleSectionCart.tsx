'use client';

import { InfoProps } from '@/app/types/types';
import {useState} from 'react';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';

interface CollapsibleSectionCartProps{
  info:InfoProps[];
  defaultOpen?:boolean;
  id?:string;
}

const CollapsibleSectionCart:React.FC<CollapsibleSectionCartProps>=({ info, defaultOpen=false,id })=>{
  const[openItems,setOpenItems]=useState<{[key:number]:boolean}>(
    info.reduce((acc, _, index) => ({ ...acc, [index]: defaultOpen }), {})
  );
  const toggleCollapse=(index:number)=>{
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };
  return(
    <div className='border-y border-zinc-200 mt-6'>
      {info.map((item, index)=>(
        <div key={index} className=" font-barlow">
          <button type="button" className={`w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:none focus:ring-inset transition-colors duration-200 ${openItems[index]?'bg-gray-50':''}`} aria-controls={`${id}-${index}`} aria-expanded={openItems[index]} onClick={() => toggleCollapse(index)}>
            <span className="font-bold text-sm tracking-widest text-[#212122]">{item.title}</span>
            {openItems[index] ? (
              <IoMdRemove className="w-3 h-3" />
            ) : (
              <IoMdAdd className="w-3 h-3" />
            )}
          </button>
          <div id={`${id}-${index}`} className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems[index]?'max-h-96 opacity-100':'max-h-0 opacity-0'}`}>
            <div className="px-4 py-2 bg-gray-50 ">
              <div className="prose prose-sm max-w-none text-gray-700">{item.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default CollapsibleSectionCart;