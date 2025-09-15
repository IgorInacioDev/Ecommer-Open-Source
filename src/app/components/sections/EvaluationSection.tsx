'use client'

import { useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const avaliacoes = [
    {
      id: 1,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "Comprei o Iluminador Sheglam e estou apaixonada! A textura é cremosa, o brilho é perfeito e dura o dia todo. Deixa a pele com um glow natural incrível. Vale muito a pena!",
      usuario: "Mariana Silva",
      produto: "Iluminador Sheglam"
    },
    {
      id: 2,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "O Gloss Kiko Milano é simplesmente perfeito! Não resseca os lábios, tem uma cor linda e o brilho é duradouro. Já comprei em várias cores e sempre recebo elogios!",
      usuario: "Ana Carolina",
      produto: "Gloss Kiko Milano"
    },
    {
      id: 3,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "Estou viciada no Body Splash Coconut Passion da Victoria's Secret! O cheiro é divino, dura bastante tempo na pele e o shimmer deixa um brilho sutil e elegante. Recomendo demais!",
      usuario: "Juliana Santos",
      produto: "Body Splash Shimmer Coconut Passion Victoria's Secret"
    },
    {
      id: 4,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "O Body Splash Aqua Kiss é refrescante e tem um perfume delicioso! Perfeito para o verão, deixa a pele perfumada e com um brilho sutil. Já virou meu favorito!",
      usuario: "Fernanda Costa",
      produto: "Body Splash Shimmer Aqua Kiss Victoria's Secret"
    },
    {
      id: 5,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "Comprei o Body Splash Bare Vanilla Shimmer e me apaixonei! O cheiro de baunilha é incrível, muito suave e feminino. O shimmer dá um toque especial. Produto de qualidade excepcional!",
      usuario: "Camila Rodrigues",
      produto: "Body Splash Bare Vanilla Shimmer Victoria's Secret"
    },
    {
      id: 6,
      estrelas: "⭐⭐⭐⭐⭐",
      texto: "O Body Splash Pure Seduction é simplesmente maravilhoso! Perfume marcante, duradouro e o shimmer deixa a pele com um brilho lindo. Sempre recebo elogios quando uso!",
      usuario: "Beatriz Oliveira",
      produto: "Body Splash Shimmer Pure Seduction Victoria's Secret"
    }
];

const EvaluationSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % avaliacoes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + avaliacoes.length) % avaliacoes.length);
  };

  // Função para calcular a porcentagem de transformação baseada no tamanho da tela
  const getTransformPercentage = () => {
    // Mobile: 100% (1 item), Tablet: 50% (2 items), Desktop: 33.333% (3 items)
    return {
      mobile: 100,
      tablet: 50,
      desktop: 33.333
    };
  };

  return (
    <div className="w-full bg-[#eba598] font-syne ">
      <div className='mx-auto p-6 sm:p-8 md:p-12 max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-9/12 flex flex-col'>
<h2 className="text-2xl sm:text-3xl font-bold">O que falam da Lure Secret</h2>
      <span className="text-sm sm:text-base">de 6 avaliações</span>

      <div className="relative mt-8">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(calc(-${currentIndex * 100}% + 0%))`,
            }}
          >
            {/* Renderizar todas as avaliações em sequência */}
            {[...avaliacoes, ...avaliacoes, ...avaliacoes].map((avaliacao, globalIndex) => {
              const adjustedIndex = globalIndex % avaliacoes.length;
              const isCenter = adjustedIndex === currentIndex;
              
              return (
                <div key={`${avaliacao.id}-${globalIndex}`} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3">
                  <div className={`w-full max-w-[370px] mx-auto border-[1px] border-blue-100 p-3 sm:p-4 transition-all duration-300 rounded-lg bg-white shadow-sm ${
                    isCenter ? 'scale-100 opacity-100' : 'md:scale-95 md:opacity-80 scale-100 opacity-100'
                  }`}>
                    <span className="text-lg">{avaliacao.estrelas}</span>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700">{avaliacao.texto}</p>

                    <div className="mt-4">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">{avaliacao.usuario}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{avaliacao.produto}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Controles de navegação */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Avaliação anterior"
          >
           <IoIosArrowBack className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400 hover:text-zinc-600" />
          </button>
          
          {/* Indicadores de página */}
          <div className="flex space-x-2">
            {avaliacoes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para avaliação ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Próxima avaliação"
          >
            <IoIosArrowForward className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default EvaluationSection