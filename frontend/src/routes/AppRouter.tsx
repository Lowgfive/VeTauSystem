import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const HomePage = lazy(() => import("../pages/HomePage"));
const SearchResultPage = lazy(() => import("../pages/SearchResultPage"));
const SeatSelectionPage = lazy(() => import("../pages/SeatSelectionPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const PaymentResultPage = lazy(() => import("../pages/PaymentResultPage"));
const ManageBookingPage = lazy(() => import("../pages/ManageBookingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const SupportPage = lazy(() => import("../pages/SupportPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));

// ─── Loading Fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Đang tải trang...</p>
        </div>
    </div>
);

// ─── Route Guards ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAppSelector((s) => s.auth);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== "admin") return <Navigate to="/" replace />;
    return <>{children}</>;
};

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAppSelector((s) => s.auth);
    if (isAuthenticated) {
        return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
    }
    return <>{children}</>;
};

// ─── App Router ──────────────────────────────────────────────────────────────
export const AppRouter = () => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/booking/:scheduleId" element={<SeatSelectionPage />} />
            <Route path="/manage" element={<ManageBookingPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* Guest only (redirect to home if already logged in) */}
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
            <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

            {/* Protected - must be logged in */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </Suspense>
);
