import { useLocation, useNavigate } from "react-router-dom";
import { PaymentPage } from "../components/PaymentPage";

const PAYMENT_RETURN_NOTICE_KEY = "payment_return_notice";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  const handleBack = () => {
    sessionStorage.setItem(PAYMENT_RETURN_NOTICE_KEY, "1");
    navigate(-1);
  };

  return (
    <PaymentPage
      bookingData={bookingData}
      onBack={handleBack}
    />
  );
}
