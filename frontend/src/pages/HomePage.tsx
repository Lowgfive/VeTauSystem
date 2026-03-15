import { useNavigate } from "react-router-dom";
import { Homepage } from "../components/Homepage";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { logout } from "../store/slices/authSlice";

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Homepage
      isLoggedIn={isAuthenticated}
      userName={user?.name}
      onLogout={handleLogout}
      onNavigateToLogin={() => navigate("/login")}
      onNavigateToMyBookings={() => navigate("/manage")}
      onNavigateToSchedule={() => navigate("/search")}
      onNavigateToSupport={() => navigate("/support")}
      onNavigateToAdmin={user?.role?.toLowerCase() === "admin" ? () => navigate("/admin") : undefined}
      onSearch={(params) =>
        navigate("/search", { state: { searchParams: params } })
      }
    />
  );
}
