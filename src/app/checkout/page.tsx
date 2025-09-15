import Header from "./components/Header";
import CheckoutForm from "./components/CheckoutForm";
import Footer from "../components/common/Footer";

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="max-w-6xl mx-auto px-4 py-8 mb-18">
        <CheckoutForm />
      </div>
      <Footer/>
    </div>
  )
}

export default CheckoutPage;