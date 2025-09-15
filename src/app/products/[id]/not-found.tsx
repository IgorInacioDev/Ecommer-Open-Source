import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado</h1>
      <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
      <Link href="/" className="text-red-600 hover:underline">
        Voltar para a home
      </Link>
    </div>
  );
};

export default NotFound;