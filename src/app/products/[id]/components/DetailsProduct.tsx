import { ProductType } from "@/app/types/Product";
import Image from "next/image";
import { useState, useEffect } from "react";

// Tipos para melhor type safety
interface ColorState {
  [variationName: string]: {
    selectedColorIndex: number;
    selectedColor: {
      title: string;
      hex: string;
    };
  };
}

interface SelectedVariation {
  variationName: string;
  selectedColor: {
    title: string;
    hex: string;
  };
}

interface DetailsProductProps {
  product: ProductType;
  onVariationsChange?: (selectedVariations: SelectedVariation[]) => void;
}

export default function DetailsProduct({ product, onVariationsChange }: DetailsProductProps) {
  // Estado para gerenciar as cores selecionadas de cada variação
  const [selectedColors, setSelectedColors] = useState<ColorState>(() => {
    // Inicializar com a primeira cor de cada variação
    const initialState: ColorState = {};
    product.variations?.forEach((variation) => {
      if (variation.colors.length > 0) {
        initialState[variation.name] = {
          selectedColorIndex: 0,
          selectedColor: variation.colors[0]
        };
      }
    });
    return initialState;
  });

  // Função para lidar com a seleção de cor
  const handleColorSelect = (variationName: string, colorIndex: number, color: { title: string; hex: string }) => {
    setSelectedColors(prev => ({
      ...prev,
      [variationName]: {
        selectedColorIndex: colorIndex,
        selectedColor: color
      }
    }));
  };

  // Notificar o componente pai quando as variações selecionadas mudarem
  useEffect(() => {
    if (onVariationsChange && Object.keys(selectedColors).length > 0) {
      const selectedVariations: SelectedVariation[] = Object.entries(selectedColors).map(([variationName, colorData]) => ({
        variationName,
        selectedColor: colorData.selectedColor
      }));
      onVariationsChange(selectedVariations);
    }
  }, [selectedColors, onVariationsChange]);

  return (
    <div>
      <h1 className="text-[27px] font-semibold font-syne text-[#333333] mb-2">{product.name}</h1>
      
      {/* Avaliações */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className="w-4 h-4 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-barlow text-gray-600">{product.reviewsCount || 0} avaliações</span>
      </div>
        
      {/* Preços */}
      {product.sale_price ? (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-barlow text-gray-500 line-through">
            R$ {(product.original_price / 100).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span className="text-xl font-barlow font-bold text-red-600">
            R$ {(product.sale_price / 100).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} 
            <span className="text-sm ml-2 text-[#8B8A8A]">6x de R$ {((product.sale_price / 100) / 6).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
            </span>
            <span className="text-xs ml-2 bg-[#E7002A] text-[#F5F5F5] py-1 px-2">
              EDIÇÃO LIMITADA
            </span>
          </span>
        </div>
      ) : (
        <span className="text-xl font-barlow font-bold text-[#333333]">
          R$ {(product.original_price / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
          })} 
          <span className="text-sm ml-2 text-[#8B8A8A]">6x de R$ {((product.original_price / 100) / 6).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
          </span>
          <span className="text-xs ml-2 bg-[#E7002A] text-[#F5F5F5] py-1 px-2">
            EDIÇÃO LIMITADA
          </span>
        </span>
      )}

      {/* Seção de Variações com Seletor de Cores */}
      {product.variations && (
        <div className="py-3 mt-3 border-t border-zinc-200 font-syne text-zinc-600">
          {product.variations.map((variation) => (
            <div key={variation.name} className="flex gap-6 mb-4">
              <div className="w-[100px] h-[100px] aspect-square relative">
                <Image
                  src={variation.imageUrl}
                  alt={variation.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium text-zinc-800">{variation.name}</h3>
                <p className="text-sm text-zinc-500">Selecione uma opção</p>
                
                {/* Container das cores selecionáveis */}
                <div className="flex items-center gap-3">
                  {variation.colors.map((color, colorIndex) => {
                    const isSelected = selectedColors[variation.name]?.selectedColorIndex === colorIndex;
                    
                    return (
                      <button
                        key={`${variation.name}-${color.title}`}
                        onClick={() => handleColorSelect(variation.name, colorIndex, color)}
                        className={`
                          w-10 h-10 rounded-xs border-2 transition-all duration-200 cursor-pointer
                          hover:scale-105 focus:outline-none focus:ring-offset-2
                          ${isSelected 
                            ? 'border-gray-400 hover:border-gray-600' 
                            : 'border-gray-200 hover:border-gray-400'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                        title={color.title}
                        aria-label={`Selecionar cor ${color.title}`}
                        type="button"
                      />
                    );
                  })}
                </div>

                {/* Exibir cor selecionada */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-zinc-800">Cor:</span>
                  <span className="text-base text-zinc-600">
                    {selectedColors[variation.name]?.selectedColor.title || 'Nenhuma selecionada'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}