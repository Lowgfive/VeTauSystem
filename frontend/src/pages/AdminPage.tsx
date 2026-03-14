import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TrainManagement } from '../components/admin/TrainManagement';
import { StationManagement } from '../components/admin/StationManagement';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ScheduleManagement } from '../components/admin/ScheduleManagement';
import { BookingManagement } from '../components/admin/BookingManagement';

type AdminTab = 'dashboard' | 'stations' | 'routes' | 'trains' | 'seats' | 'schedules' | 'bookings' | 'payments' | 'refunds' | 'users';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const handleLogout = () => {
        // Implement logout logic
        console.log("Logout triggered");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'stations':
                return <StationManagement />;
            case 'trains':
                return <TrainManagement />;
            case 'schedules':
                return <ScheduleManagement />;
            case 'bookings':
                return <BookingManagement />;
            case 'routes':
            case 'seats':
            case 'payments':
            case 'refunds':
            case 'users':
                return (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-[#0A2A43] mb-2">Chức năng đang phát triển</h2>
                            <p className="text-muted-foreground">Tính năng quản lý phần này sẽ được ra mắt trong thời gian sớm nhất.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
        >
            {renderContent()}
        </AdminLayout>
    );
}
