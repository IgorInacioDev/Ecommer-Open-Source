interface ButtonProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ title, onClick, className }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full uppercase bg-[#212122] text-[#F5F5F5] py-3 px-6 rounded-xs font-extrabold tracking-widest text-xs font-barlow ${className}`}
    >
      {title}
    </button>
  )
}