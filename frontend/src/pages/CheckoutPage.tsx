import { useLocation, useNavigate } from "react-router-dom";
import { PaymentPage } from "../components/PaymentPage";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PaymentPage
      bookingData={bookingData}
      onBack={handleBack}
    />
  );
}
