import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TrainManagement } from '../components/admin/TrainManagement';

import { TicketManagement } from '../components/admin/TicketManagement';

import { ScheduleManagement } from '../components/admin/ScheduleManagement';


import { StationManagement } from '../components/admin/StationManagement';

import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminWalletManagement } from '../components/admin/AdminWalletManagement';
import { useAppDispatch } from '../hooks/useRedux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'trains' | 'schedules' | 'stations' | 'reports' | 'wallet'>('dashboard');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'trains':
                return <TrainManagement />;
            case 'stations':
                return <StationManagement />;
            case 'schedules':
                return <ScheduleManagement />;
            case 'tickets':
                return <TicketManagement />;
            case 'dashboard':
                return <AdminDashboard />;
            case 'wallet':
                return <AdminWalletManagement />;
            case 'reports':
                return (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chức năng đang phát triển</h2>
                            <p className="text-muted-foreground">Tính năng này sẽ sớm được cập nhật trong tương lai.</p>
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
