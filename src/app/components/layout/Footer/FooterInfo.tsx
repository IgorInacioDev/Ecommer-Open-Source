// PaymentIcons removido - funcionalidade de cartão de crédito desabilitada

interface BadgeProps {
  image: string;
  borderColor: string;
  text: string;
  textSize?: string;
}

const Badge = ({ image, borderColor, text, textSize = 'text-[12px]' }: BadgeProps) => (
  <div className={`bg-white border ${borderColor} rounded-md w-[70px] sm:w-[80px] py-2 px-1 flex flex-col items-center text-center`}>
    <img className="mx-2 sm:mx-4 h-4 sm:h-auto" src={`/footer/${image}.svg`} alt={image} />
    <p className={`${textSize} leading-tight`}>{text}</p>
    <img className="h-3 sm:h-auto" src="/footer/reclame.svg" alt="Reclame" />
  </div>
);

const FooterInfo = () => {
  const badges: BadgeProps[] = [
    {
      image: 'ra-1000',
      borderColor: 'border-green-300',
      text: 'RA 1000',
    },
    {
      image: 'verified',
      borderColor: 'border-blue-400',
      text: 'Verificada por',
      textSize: 'text-[11px]'
    }
  ];

  return (
    <footer className="text-center border-b justify-between items-center flex flex-col md:flex-row text-zinc-600 text-[12px] gap-4 md:gap-0 py-4">
      <div className="flex justify-center gap-4 sm:gap-8 order-1 md:order-none">
        {badges.map((badge) => (
          <Badge key={badge.image} {...badge} />
        ))}
      </div>

      <div className="order-3 md:order-none px-4">
        <p className="text-[10px] sm:text-[12px]">Copyright Lure Secret LTDA -</p>
        <p className="text-[10px] sm:text-[12px]">32.233.064/0001-29 - 2022. Todos os direitos reservados.</p>
      </div>
      
      <div className="order-2 md:order-none">
        {/* PaymentIcons removido - funcionalidade de cartão de crédito desabilitada */}
      </div>
    </footer>
  );
};

export default FooterInfo;
