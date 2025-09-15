import { useState } from "react";

type ContactProps = {
  email: string,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function Contact({ email, handleInputChange }: ContactProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [emailSubscription, setEmailSubscription] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Contato</h2>
      <button
        onClick={() => setShowLogin(!showLogin)}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Fazer login
      </button>
    </div>

    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-mail <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder=""
        />
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="emailSubscription"
          checked={emailSubscription}
          onChange={(e) => setEmailSubscription(e.target.checked)}
          className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="emailSubscription" className="text-sm text-gray-600">
          Aceito receber comunicações por e-mail e WhatsApp sobre meu pedido e novidades da marca.
        </label>
      </div>
    </div>
  </div>
  );
}