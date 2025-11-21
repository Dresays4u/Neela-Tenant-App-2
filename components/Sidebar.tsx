
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench, 
  Gavel, 
  LogOut,
  Globe,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants & Leases', icon: Users },
    { id: 'payments', label: 'Rent & Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'legal', label: 'Legal & Compliance', icon: Gavel },
    { id: 'documents', label: 'Document Center', icon: FileText },
    { id: 'settings', label: 'Setup & Config', icon: Settings },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto flex flex-col
      `}
    >
      <div className="flex items-center justify-center h-24 border-b border-slate-800 flex-shrink-0 px-4">
        <div className="flex items-center gap-4">
          {/* Logo Mark */}
          <span className="text-3xl font-serif font-bold text-white tracking-widest">NCI</span>
          
          {/* Vertical Divider */}
          <div className="h-8 w-px bg-slate-700"></div>
          
          {/* Logo Text */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-white tracking-wide uppercase leading-none mb-1">Neela Capital</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase leading-none">Investment</span>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Public Views
          </h3>
          <button
            onClick={() => setActiveTab('public-portal')}
            className={`
              flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'public-portal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <Globe className="w-5 h-5 mr-3" />
            Applicant Portal
          </button>
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4 flex-shrink-0">
        <button 
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
