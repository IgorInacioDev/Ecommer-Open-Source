'use client';

import Button from "@/app/components/common/Button";
import Prize from "./Prize";
import DetailsProduct from "./DetailsProduct";
import CollapsibleSection from "@/app/components/CollapsibleSection";
import PaymentMethods from "./PaymentMethods";
import { useCart } from "@/app/contexts/CartContext";
import { ProductType } from "@/app/types/Product";
import { InfoProps } from "@/app/types/types";
import { useState, useCallback, useEffect, useRef } from "react";

interface SelectedVariation {
  variationName: string;
  selectedColor: {
    title: string;
    hex: string;
  };
}

interface ProductInfoProps {
  product: ProductType;
}

const prize = {
    title: "seus favoritos com BRINDE",
    name: "brinde",
}

const info : InfoProps[] = [
  {
    title: "OS PRODUTOS SÃO ORIGINAIS?",
    description: (
        <p>Sim! Todos os nossos produtos são 100% originais, vindos diretamente dos fabricantes ou distribuidores oficiais. Trabalhamos apenas com marcas reconhecidas e garantimos a autenticidade de todos os itens comercializados em nossa loja.</p>
    )
  },
  {
    title: "GARANTIA",
    description: (
        <div>
          <p>Oferecemos garantia de 30 dias para todos os nossos produtos, cobrindo defeitos de fabricação. Se você tiver qualquer problema com seu produto dentro deste período, entre em contato com nosso atendimento ao cliente que faremos a troca ou devolução do seu dinheiro.</p>
          <p>Para acionar a garantia, é necessário:</p>
          <ul>
            <li>Manter a nota fiscal de compra</li>
            <li>Produto em perfeito estado e na embalagem original</li>
            <li>Entrar em contato com nosso SAC em até 30 dias após a compra</li>
          </ul>
        </div>
    )
  },
]

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { addToCart, openCart } = useCart();
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariation[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVariationsChange = useCallback((variations: SelectedVariation[]) => {
    setSelectedVariations(variations);
  }, []);

  const handleAddToCart = () => {
    addToCart(product, 1, selectedVariations.length > 0 ? selectedVariations : undefined);
    openCart();
  };

  const scrollToVideo = (index: number) => {
    const videoElement = videoRefs.current[index];
    if (videoElement) {
      videoElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleVideoClick = (index: number) => {
    const videoElement = videoRefs.current[index];
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
    }
  };

  const goToNextVideo = async () => {
    try {
      // Pause current video
      if (videoRefs.current[currentVideoIndex]) {
        videoRefs.current[currentVideoIndex].pause();
      }
      
      const nextIndex = (currentVideoIndex + 1) % product.video_reviews.length;
      setCurrentVideoIndex(nextIndex);
      
      // Scroll to the new video
      setTimeout(() => scrollToVideo(nextIndex), 100);
    } catch (error) {
      console.log('Error going to next video:', error);
    }
  };

  const goToPreviousVideo = async () => {
    try {
      // Pause current video
      if (videoRefs.current[currentVideoIndex]) {
        videoRefs.current[currentVideoIndex].pause();
      }
      
      const prevIndex = currentVideoIndex === 0 ? product.video_reviews.length - 1 : currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      
      // Scroll to the new video
      setTimeout(() => scrollToVideo(prevIndex), 100);
    } catch (error) {
      console.log('Error going to previous video:', error);
    }
  };

  useEffect(() => {
    if (!product.video_reviews || product.video_reviews.length === 0) return;

    const playNextVideo = async () => {
      // Pause current video safely
      const currentVideo = videoRefs.current[currentVideoIndex];
      if (currentVideo) {
        try {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        } catch (error) {
          console.log('Error pausing video:', error);
        }
      }

      // Move to next video
      const nextIndex = (currentVideoIndex + 1) % product.video_reviews.length;
      setCurrentVideoIndex(nextIndex);

      // Play next video with promise handling
      setTimeout(async () => {
        const nextVideo = videoRefs.current[nextIndex];
        if (nextVideo) {
          try {
            await nextVideo.play();
          } catch (error) {
            console.log('Error playing video:', error);
          }
        }
        // Scroll to the new video
        scrollToVideo(nextIndex);
      }, 100);
    };

    // Start first video with promise handling
    const startVideo = async () => {
      const firstVideo = videoRefs.current[currentVideoIndex];
      if (firstVideo) {
        try {
          await firstVideo.play();
        } catch (error) {
          console.log('Error starting video:', error);
        }
      }
      // Scroll to current video on start
      setTimeout(() => scrollToVideo(currentVideoIndex), 200);
    };

    startVideo();

    // Set timeout for 5 seconds
    timeoutRef.current = setTimeout(playNextVideo, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentVideoIndex, product.video_reviews]);
 
  return (
    <div className="max-w-[550px]">
      <DetailsProduct product={product} onVariationsChange={handleVariationsChange} />

      <div className="space-y-4 pt-6">
        <Button title="Adicionar à Minha Sacola" onClick={handleAddToCart} />
        <Prize prize={prize} />
      </div>

      {product.video_reviews && product.video_reviews.length > 0 && (
        <div className="py-3 mt-3 font-syne text-zinc-600">
          <h3 className="text-lg font-bold text-zinc-800 mb-3">Veja mais de pertinho</h3>
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousVideo}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-zinc-400 p-2 rounded-full hover:bg-opacity-70 transition-all"
              disabled={product.video_reviews.length <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNextVideo}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-zinc-400 p-2 rounded-full hover:bg-opacity-70 transition-all"
              disabled={product.video_reviews.length <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex gap-3 overflow-x-hidden pb-2 px-8" style={{scrollBehavior: 'smooth'}}>
              {product.video_reviews.map((video_review, index) => (
                <div key={video_review.id} className="flex-shrink-0">
                  <video 
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={`https://white-nocodb.5zd9ii.easypanel.host/${video_review.signedPath || video_review.path}`}
                    muted
                    className="w-26 h-42 object-cover rounded-sm cursor-pointer"
                    preload="metadata"
                    onClick={() => handleVideoClick(index)}
                    onEnded={async () => {
                      // When video ends naturally, move to next
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }
                      const nextIndex = (index + 1) % product.video_reviews.length;
                      setCurrentVideoIndex(nextIndex);
                    }}
                  >
                    <source src={`https://white-nocodb.5zd9ii.easypanel.host/${video_review.signedPath || video_review.path}`} type={video_review.mimetype} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div 
        className="py-4 font-barlow text-[#333333]"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
      <div className=" py-4 font-barlow text-[#333333]">
        ✨ Produto 100% Original Victoria’s Secret ✨<br/>
        Com selo de autenticidade, importado diretamente dos EUA. Garantia de qualidade, sofisticação e aquele toque inconfundível que só a Victoria’s Secret tem. Perfeito para quem busca fragrâncias marcantes, hidratantes irresistíveis e produtos que unem beleza e exclusividade.
        <br/>
        💖 Importado e original<br/>
        💖 Lacrado e com selo de autenticidade<br/>
        💖 Ideal para presentear ou se presentea<br/>
      </div>

      <CollapsibleSection defaultOpen={false} info={info} id="Product-content-tab7655525941290"/>
      <PaymentMethods />
    </div>
  );
};

export default ProductInfo;
