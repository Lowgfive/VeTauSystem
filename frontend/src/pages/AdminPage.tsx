import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TrainManagement } from '../components/admin/TrainManagement';
import { StationManagement } from '../components/admin/StationManagement';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ScheduleManagement } from '../components/admin/ScheduleManagement';
import { BookingManagement } from '../components/admin/BookingManagement';
import { TicketManagement } from '../components/admin/TicketManagement';
import { LineManagement } from '../components/admin/LineManagement';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'trains' | 'lines' | 'schedules' | 'reports'>('trains');

    const handleLogout = () => {
        // Implement logout logic
        console.log("Logout triggered");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'trains':
                return <TrainManagement />;
            case 'lines':
                return <LineManagement />;
            case 'schedules':
                return <ScheduleManagement />;
            case 'tickets':
                return <TicketManagement />;
            case 'reports':
                return (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-[#0A2A43] mb-2">Chức năng đang phát triển</h2>
                            <p className="text-muted-foreground">Tính năng báo cáo thống kê sẽ được ra mắt trong thời gian sớm nhất.</p>
                        </div>
                    </div>
                );
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <AdminLayout
            activeTab={activeTab as any}
            onTabChange={setActiveTab as any}
            onLogout={handleLogout}
        >
            {renderContent()}
        </AdminLayout>
    );
}
