import { ReactNode } from 'react';
import { LayoutDashboard, Ticket, Train, BarChart3, LogOut, Menu, X, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

type AdminTab = 'dashboard' | 'stations' | 'routes' | 'trains' | 'seats' | 'schedules' | 'bookings' | 'payments' | 'refunds' | 'users';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

export function AdminLayout({ children, activeTab, onTabChange, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stations' as const, label: 'Ga Tàu', icon: MapPin },
    { id: 'routes' as const, label: 'Cấu hình Tuyến', icon: MapPin },
    { id: 'trains' as const, label: 'Cấu hình Tàu', icon: Train },
    { id: 'seats' as const, label: 'Sơ đồ Toa/Ghế', icon: Train },
    { id: 'schedules' as const, label: 'Lịch trình', icon: Train },
    { id: 'bookings' as const, label: 'Quản lý Vé', icon: Ticket },
    { id: 'payments' as const, label: 'Giao dịch', icon: BarChart3 },
    { id: 'refunds' as const, label: 'Yêu cầu Hủy/Đổi', icon: Ticket },
    { id: 'users' as const, label: 'Người dùng', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen bg-[#0A2A43] text-white w-64 z-50
        transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">VNR Admin</h1>
            <p className="text-xs text-white/60 mt-1">Vietnam Railways</p>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all font-medium
                  ${isActive
                    ? 'bg-white text-[#0A2A43] shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">AD</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@vnrailway.vn</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
