
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, AlertCircle, CheckCircle2, Users, FileText, Building2, Home, Settings } from 'lucide-react';
import { Tenant, Payment, MaintenanceRequest, TenantStatus, Property } from '../types';

interface DashboardProps {
  tenants: Tenant[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
  properties: Property[];
  onReviewApplications: () => void;
}

const DashboardView: React.FC<DashboardProps> = ({ tenants, payments, maintenance, properties, onReviewApplications }) => {
  // Derived Metrics
  const totalRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const overdueAmount = tenants.reduce((acc, curr) => acc + curr.balance, 0);
  
  const occupancyRate = Math.round((tenants.filter(t => t.status === TenantStatus.ACTIVE).length / tenants.length) * 100) || 0;
  
  const openTickets = maintenance.filter(m => m.status !== 'Resolved').length;
  const newApplications = tenants.filter(t => t.status === TenantStatus.APPLICANT).length;

  // Chart Data
  const revenueData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3500 },
    { name: 'Mar', amount: 4200 },
    { name: 'Apr', amount: 3800 },
    { name: 'May', amount: totalRevenue }, // Simulating current month
  ];

  const ticketData = [
    { name: 'Open', value: maintenance.filter(m => m.status === 'Open').length },
    { name: 'In Progress', value: maintenance.filter(m => m.status === 'In Progress').length },
    { name: 'Resolved', value: maintenance.filter(m => m.status === 'Resolved').length },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 animate-fade-in">
      {newApplications > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><FileText className="w-5 h-5"/></div>
              <div>
                 <p className="font-bold">New Applications Received</p>
                 <p className="text-sm text-blue-100">You have {newApplications} pending application(s) to review.</p>
              </div>
           </div>
           <button 
             onClick={onReviewApplications}
             className="px-4 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 text-sm"
           >
              Review Now
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Monthly Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
        />
        <StatCard 
          title="Outstanding Rent" 
          value={`$${overdueAmount.toLocaleString()}`} 
          icon={AlertCircle} 
          color="text-rose-600" 
          bg="bg-rose-50"
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          icon={Users} 
          color="text-blue-600" 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Open Tickets" 
          value={openTickets.toString()} 
          icon={CheckCircle2} 
          color="text-orange-600" 
          bg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Maintenance Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs text-slate-600">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span>Open</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>In Progress</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Portfolio Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Property Portfolio
          </h3>
          <a 
            href="#settings" 
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = 'settings';
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Manage Properties
            <Settings className="w-4 h-4" />
          </a>
        </div>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Home className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No properties yet. Add your first property in Settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 6).map(prop => (
              <div key={prop.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {prop.image ? (
                  <div className="h-32 bg-slate-200 overflow-hidden">
                    <img 
                      src={prop.image} 
                      alt={prop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Home class="w-8 h-8 text-slate-400" /></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-slate-200 flex items-center justify-center">
                    <Home className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-slate-800 mb-1">{prop.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{prop.address}, {prop.city}, {prop.state}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-medium">
                      {prop.units} {prop.units === 1 ? 'Unit' : 'Units'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {properties.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Showing 6 of {properties.length} properties. 
              <a 
                href="#settings" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = 'settings';
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
              >
                View all
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Action Required Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Action Required</h3>
        <div className="space-y-3">
          {tenants.filter(t => t.balance > 0).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="font-medium text-slate-800">Overdue Rent: {t.name}</p>
                  <p className="text-sm text-slate-600">{t.propertyUnit} • Due: ${t.balance}</p>
                </div>
              </div>
              <button className="px-3 py-1 text-sm font-medium text-rose-700 bg-white border border-rose-200 rounded hover:bg-rose-50">
                Send Notice
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default DashboardView;
