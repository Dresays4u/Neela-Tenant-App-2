import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TenantsView from './components/TenantsView';
import MaintenanceView from './components/MaintenanceView';
import LegalComplianceView from './components/LegalComplianceView';
import PublicPortal from './components/PublicPortal';
import SettingsView from './components/SettingsView';
import PaymentsView from './components/PaymentsView';
import { Menu } from 'lucide-react';
import { MOCK_INVOICES } from './constants'; // Keep invoices mock for now as we didn't backend it yet
import { api } from './services/api';
import { Tenant, Payment, MaintenanceRequest } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('public-portal');
  const [tenantsInitialTab, setTenantsInitialTab] = useState<'residents' | 'applicants'>('residents');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for data
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsData, paymentsData, maintenanceData] = await Promise.all([
          api.getTenants(),
          api.getPayments(),
          api.getMaintenanceRequests()
        ]);
        setTenants(tenantsData);
        setPayments(paymentsData);
        setMaintenance(maintenanceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReviewApplications = () => {
    setTenantsInitialTab('applicants');
    setActiveTab('tenants');
  };

  const handleSidebarNavigation = (tab: string) => {
    setActiveTab(tab);
    // Reset default tab for tenants view when navigating via sidebar
    if (tab === 'tenants') {
      setTenantsInitialTab('residents');
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setActiveTab('public-portal');
    setIsMobileMenuOpen(false);
  };

  const renderAdminContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            tenants={tenants}
            payments={payments}
            maintenance={maintenance}
            onReviewApplications={handleReviewApplications}
          />
        );
      case 'tenants':
        return <TenantsView tenants={tenants} initialTab={tenantsInitialTab} />;
      case 'maintenance':
        return <MaintenanceView requests={maintenance} tenants={tenants} />;
      case 'legal':
        return <LegalComplianceView tenants={tenants} />;
      case 'settings':
        return <SettingsView />;
      case 'payments':
        return <PaymentsView tenants={tenants} payments={payments} invoices={MOCK_INVOICES} />;
      case 'documents':
        return (
          <div className="flex items-center justify-center h-96 text-slate-500">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Document Center</h3>
              <p>Lease Templates & DocuSign Integration (Placeholder)</p>
            </div>
          </div>
        );
      default:
        return (
          <DashboardView
            tenants={tenants}
            payments={payments}
            maintenance={maintenance}
            onReviewApplications={handleReviewApplications}
          />
        );
    }
  };

  const isPublic = activeTab === 'public-portal';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && !isPublic && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {!isPublic && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSidebarNavigation}
          isMobileMenuOpen={isMobileMenuOpen}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar (Mobile Only) - Only show in Admin Mode */}
        {!isPublic && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <span className="font-bold text-slate-800">PropGuard</span>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isPublic ? (
            <PublicPortal onAdminLogin={() => setActiveTab('dashboard')} />
          ) : (
            <div className="p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {renderAdminContent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
