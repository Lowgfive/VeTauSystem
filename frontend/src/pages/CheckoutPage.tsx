import { useLocation, useNavigate } from "react-router-dom";
import { PaymentPage } from "../components/PaymentPage";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // bookingData was constructed in PassengerInfoPage
  const bookingData = location.state?.bookingData;

  const handleBack = () => {
    navigate(-1);
  };

  const handlePaymentSuccess = () => {
    navigate('/payment-result');
  };

  return (
    <PaymentPage 
      bookingData={bookingData} 
      onBack={handleBack}
      onPaymentSuccess={handlePaymentSuccess}
    />
  );
}
