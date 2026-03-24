import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TrainManagement } from '../components/admin/TrainManagement';

import { TicketManagement } from '../components/admin/TicketManagement';

import { ScheduleManagement } from '../components/admin/ScheduleManagement';



import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { logout } from '../store/slices/authSlice';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'trains' | 'schedules' | 'reports'>('trains');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'trains':
                return <TrainManagement />;
            case 'schedules':
                return <ScheduleManagement />;
            case 'tickets':
                return <TicketManagement />;
            case 'dashboard':
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
