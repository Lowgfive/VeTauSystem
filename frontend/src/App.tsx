import { Toaster } from "./components/ui/sonner";
import { AppRouter } from "./routes/AppRouter";
import { useCartTimer } from "./hooks/useCartTimer";

export default function App() {
  // Start global countdown timer for seat hold
  useCartTimer();

  return (
    <>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </>
  );
}