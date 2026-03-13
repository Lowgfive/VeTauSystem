import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TrainManagement } from '../components/admin/TrainManagement';
import { LineManagement } from '../components/admin/LineManagement';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'trains' | 'lines' | 'reports'>('trains');

    const handleLogout = () => {
        // Implement logout logic
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'trains':
                return <TrainManagement />;
            case 'lines':
                return <LineManagement />;
            case 'dashboard':
            case 'tickets':
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
