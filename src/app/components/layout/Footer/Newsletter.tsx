"use client"

import { ArrowRight } from "lucide-react";
import { useState } from "react";

const SUBSCRIPTION_TIMEOUT = 3000;

const Newsletter = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const handleNewsletterSubmit = (): void => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), SUBSCRIPTION_TIMEOUT);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewsletterSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNewsletterSubmit();
  };

  return (
    <section className="bg-[#2a2a2b] py-8 px-4 md:px-12 text-center">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-syne font-bold text-[#F5F5F5] mb-4">
          Cola em nossa newsletter!
        </h2>
        
        <p className="font-barlow text-sm text-zinc-200 mb-6">
          Receba novidades, promoções e muita info boa em primeira mão.
        </p>

        {isSubscribed ? (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 font-medium flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span>
              Obrigado! Você foi inscrito na nossa newsletter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full py-3 pl-4 pr-14 rounded-xs border border-gray-200 bg-white text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#212122] focus:border-transparent transition-all"
                required
                aria-label="Digite seu email para se inscrever na newsletter"
              />
              
              <button
                type="submit"
                className="absolute right-0 p-4 bg-[#212122] text-[#F5F5F5] rounded-xs hover:bg-[#e5633f] focus:outline-none focus:ring-2 focus:ring-[#212122] focus:ring-offset-2 transition-colors"
                aria-label="Enviar inscrição"
                disabled={!email.trim()}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;