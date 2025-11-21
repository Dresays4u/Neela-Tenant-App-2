
import React, { useState } from 'react';
import { Listing, ApplicationForm, MaintenanceStatus, Invoice, PortalNotification } from '../types';
import { analyzeMaintenanceRequest } from '../services/geminiService';
import { 
  MapPin, BedDouble, Bath, Maximize, Check, ArrowLeft, 
  FileText, Save, Send, User, FileSignature, Download, 
  CreditCard, Clock, AlertCircle, Building2, PenTool,
  Bell, Smartphone, Banknote, Image as ImageIcon, Loader2, X,
  MessageSquare, History, FileCheck, Mail, Lock, LogIn, ChevronRight
} from 'lucide-react';

type PortalView = 'listings' | 'application' | 'dashboard' | 'lease_signing';
type UserStatus = 'guest' | 'applicant_pending' | 'applicant_approved' | 'resident';
type ResidentTab = 'overview' | 'payments' | 'maintenance' | 'documents';
type LoginType = 'admin' | 'tenant' | null;

interface PublicPortalProps {
  onAdminLogin?: () => void;
}

const PublicPortal: React.FC<PublicPortalProps> = ({ onAdminLogin }) => {
  const [view, setView] = useState<PortalView>('listings');
  const [userStatus, setUserStatus] = useState<UserStatus>('guest');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<ResidentTab>('overview');
  
  // Login State
  const [loginType, setLoginType] = useState<LoginType>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Application Form State
  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: 'Alex', lastName: 'Renter', email: 'alex@example.com', phone: '', dob: '',
    currentAddress: '', employer: '', jobTitle: '', income: '', ssnLast4: '',
    references: [{ name: '', relation: '', phone: '' }],
    consentBackgroundCheck: false
  });

  // Resident State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceUrgency, setMaintenanceUrgency] = useState<'Low'|'Medium'|'High'|'Emergency'>('Medium');
  const [isAnalyzingMaintenance, setIsAnalyzingMaintenance] = useState(false);
  const [manualPaymentMode, setManualPaymentMode] = useState(false);
  
  // Mock Data for Resident View
  const residentBalance = 1850;
  const daysUntilDue: number = 3; // Configurable for demo: 3 = upcoming, 0 = due today, -1 = late

  const notifications: PortalNotification[] = [
    { id: 'n1', type: 'Rent', title: 'Rent Due Soon', message: `Your rent of $${residentBalance} is due in ${daysUntilDue} days.`, date: '2 hours ago', read: false },
    { id: 'n2', type: 'Maintenance', title: 'Ticket Updated', message: 'Ticket #M1 (Leaking Faucet) status changed to In Progress.', date: 'Yesterday', read: true },
    { id: 'n3', type: 'System', title: 'Lease Document Available', message: 'Your countersigned lease is now available in documents.', date: '3 days ago', read: true },
  ];

  const invoices: Invoice[] = [
    { id: 'inv-101', tenantId: 'resident-1', date: '2024-11-01', dueDate: '2024-11-01', amount: 1850, period: 'November 2024', status: 'Pending' },
    { id: 'inv-100', tenantId: 'resident-1', date: '2024-10-01', dueDate: '2024-10-01', amount: 1850, period: 'October 2024', status: 'Paid' },
    { id: 'inv-099', tenantId: 'resident-1', date: '2024-09-01', dueDate: '2024-09-01', amount: 1850, period: 'September 2024', status: 'Paid' },
  ];

  const myTickets = [
    { 
      id: 'tk-1', category: 'Plumbing', description: 'Leaking faucet in bathroom.', status: MaintenanceStatus.IN_PROGRESS, 
      date: '2024-10-28', updates: [{ date: '2024-10-29', message: 'Vendor scheduled for tomorrow.', author: 'Property Manager' }] 
    },
    { 
      id: 'tk-2', category: 'HVAC', description: 'Filter change needed.', status: MaintenanceStatus.RESOLVED, 
      date: '2024-08-15', updates: [{ date: '2024-08-16', message: 'Completed by maintenance team.', author: 'System' }] 
    },
  ];

  const handleApply = (listing: Listing) => {
    setSelectedListing(listing);
    setView('application');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      if (loginType === 'admin') {
        onAdminLogin?.();
      } else if (loginType === 'tenant') {
        setUserStatus('resident');
        setView('dashboard');
      }
      setIsLoggingIn(false);
      setLoginType(null);
    }, 800);
  };

  const handleSignLease = () => {
    setTimeout(() => {
      setUserStatus('resident');
      setView('dashboard');
    }, 1500);
  };

  const handleMaintenanceSubmit = async () => {
    if(!maintenanceDesc) return;
    setShowMaintenanceForm(false);
    setMaintenanceDesc('');
    alert("Ticket submitted successfully! You will receive email updates.");
  };

  const handleAnalyzeIssue = async () => {
     if(!maintenanceDesc) return;
     setIsAnalyzingMaintenance(true);
     try {
       const result = await analyzeMaintenanceRequest(maintenanceDesc);
       if (result.priority) {
          setMaintenanceUrgency(result.priority as any);
       }
     } catch (e) {
       console.error(e);
     } finally {
       setIsAnalyzingMaintenance(false);
     }
  };

  const downloadReceipt = (id: string) => {
    alert(`Downloading receipt for payment ${id}...`);
  };

  // --- SUB-COMPONENTS ---

  const LoginModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden scale-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {loginType === 'admin' ? 'Admin Portal Login' : 'Tenant Portal Login'}
          </h3>
          <button onClick={() => setLoginType(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
             <input 
               type="email" 
               className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-slate-900"
               placeholder={loginType === 'admin' ? "admin@neelacapital.com" : "tenant@example.com"} 
               defaultValue={loginType === 'admin' ? "admin@neelacapital.com" : "alex@example.com"}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
             <input 
               type="password" 
               className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-slate-900"
               placeholder="••••••••" 
               defaultValue="password"
             />
           </div>
           <button 
             type="submit"
             disabled={isLoggingIn}
             className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center"
           >
             {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
           </button>
           
           {loginType === 'admin' && (
              <p className="text-xs text-center text-slate-500 mt-4 bg-slate-50 p-2 rounded">
                <Lock className="w-3 h-3 inline mr-1"/> Secure Area. Authorized Personnel Only.
              </p>
           )}
           {loginType === 'tenant' && (
              <p className="text-xs text-center text-slate-500 mt-4">
                Don't have an account? <button type="button" onClick={() => {setLoginType(null); setView('listings')}} className="text-indigo-600 hover:underline">Apply for a property</button>
              </p>
           )}
        </form>
      </div>
    </div>
  );

  const LandingHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => { setView('listings'); setUserStatus('guest'); }}
        >
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-serif shadow-md">N</div>
           <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 leading-none">Neela Capital</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Resident Portal</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
          {userStatus === 'guest' && (
             <>
               <button 
                 onClick={() => setLoginType('tenant')} 
                 className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
               >
                  <LogIn className="w-4 h-4 mr-2" /> Tenant Sign In
               </button>
               <button 
                 onClick={() => setLoginType('admin')}
                 className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
               >
                  <Lock className="w-4 h-4" /> Admin Login
               </button>
             </>
          )}
          {userStatus !== 'guest' && (
             <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">Hello, {formData.firstName}</span>
                <button 
                   onClick={() => { setUserStatus('guest'); setView('listings'); }}
                   className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                   Sign Out
                </button>
             </div>
          )}
        </div>
      </div>
    </header>
  );

  const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-56 group">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
          ${listing.price}/mo
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{listing.title}</h3>
        <div className="flex items-start text-slate-600 mb-4 text-sm">
          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          {listing.address}
        </div>
        
        <div className="flex items-center justify-between mb-6 text-sm text-slate-600">
          <div className="flex items-center"><BedDouble className="w-4 h-4 mr-1"/> {listing.beds} Beds</div>
          <div className="flex items-center"><Bath className="w-4 h-4 mr-1"/> {listing.baths} Baths</div>
          <div className="flex items-center"><Maximize className="w-4 h-4 mr-1"/> {listing.sqft} sqft</div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button 
            onClick={() => handleApply(listing)}
            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );

  const StatusTracker: React.FC<{ status: UserStatus }> = ({ status }) => {
    const steps = [
      { id: 'applicant_pending', label: 'Application Submitted', icon: FileText },
      { id: 'reviewing', label: 'Under Review', icon: User },
      { id: 'applicant_approved', label: 'Approved', icon: Check },
      { id: 'resident', label: 'Lease Signed', icon: FileSignature },
    ];

    const getStepState = (stepId: string) => {
      if (status === 'resident') return 'completed';
      if (status === 'applicant_approved') return stepId === 'resident' ? 'pending' : 'completed';
      if (status === 'applicant_pending') return stepId === 'applicant_pending' || stepId === 'reviewing' ? 'current' : 'pending';
      return 'pending';
    };

    return (
      <div className="w-full py-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
          {steps.map((step) => {
            const state = getStepState(step.id);
            const isCompleted = state === 'completed';
            const isCurrent = state === 'current';
            
            return (
              <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    isCurrent ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    'bg-white border-slate-300 text-slate-300'}
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium mt-2 ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {manualPaymentMode ? 'Report Manual Payment' : 'Make a Payment'}
          </h3>
          <button onClick={() => { setShowPaymentModal(false); setManualPaymentMode(false); }} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
           <div className="text-center">
             <p className="text-sm text-slate-600">Total Amount Due</p>
             <p className="text-4xl font-bold text-slate-800 mt-1">${residentBalance}.00</p>
             {daysUntilDue < 0 && <span className="inline-block mt-2 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">Includes Late Fees</span>}
           </div>

           {!manualPaymentMode ? (
             <>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Instant Pay</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Zelle', 'Venmo', 'CashApp', 'Apple Pay'].map(method => (
                    <button key={method} className="flex items-center justify-center py-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors font-medium text-sm text-slate-700">
                      <Smartphone className="w-4 h-4 mr-2 text-slate-400" /> {method}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Bank & Card</p>
                <div className="space-y-2">
                    <button className="w-full flex items-center px-4 py-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors group">
                      <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mr-3" />
                      <div className="text-left">
                        <span className="block text-sm font-medium text-slate-700 group-hover:text-indigo-700">Credit / Debit Card</span>
                        <span className="block text-xs text-slate-500">2.9% processing fee</span>
                      </div>
                    </button>
                    <button className="w-full flex items-center px-4 py-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors group">
                      <Building2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mr-3" />
                      <div className="text-left">
                        <span className="block text-sm font-medium text-slate-700 group-hover:text-indigo-700">Bank Transfer (ACH)</span>
                        <span className="block text-xs text-slate-500">Free • 1-3 business days</span>
                      </div>
                    </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setManualPaymentMode(true)}
                    className="text-slate-600 text-sm font-medium hover:text-slate-800 flex items-center justify-center w-full transition-colors"
                  >
                    I paid by Cash or Check
                  </button>
              </div>
             </>
           ) : (
             <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200">
                  Manual payments must be verified by the property manager before your balance is updated.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white">
                    <option>Personal Check</option>
                    <option>Cashier's Check</option>
                    <option>Cash (Handed to Office)</option>
                    <option>Money Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check Number / Reference</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" placeholder="e.g. #1054" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date Handed Over</label>
                  <input type="date" className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" />
                </div>
                <button 
                  onClick={() => { alert("Payment reported!"); setShowPaymentModal(false); setManualPaymentMode(false); }}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 mt-4"
                >
                  Submit Report
                </button>
                <button 
                  onClick={() => setManualPaymentMode(false)}
                  className="w-full py-2 text-slate-600 text-sm hover:text-slate-800"
                >
                  Back to Digital Payment
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  // --- VIEWS ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LandingHeader />
      {loginType && <LoginModal />}
      
      <div className="flex-1 flex flex-col">
        {/* 1. LEASE SIGNING VIEW */}
        {view === 'lease_signing' && (
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 flex-1 flex flex-col animate-fade-in">
             <div className="flex items-center justify-between mb-6">
              <button onClick={() => setView('dashboard')} className="flex items-center text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </button>
              <div className="flex items-center gap-2">
                 <span className="text-sm text-slate-600">Powered by</span>
                 <span className="font-bold text-slate-700 italic">DocuSign</span>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row">
               <div className="flex-1 bg-slate-100 p-8 overflow-y-auto border-r border-slate-200 max-h-[800px]">
                  <div className="bg-white shadow-sm min-h-[800px] p-12 max-w-3xl mx-auto text-slate-800">
                    <h1 className="text-2xl font-bold serif mb-2 text-center">RESIDENTIAL LEASE AGREEMENT</h1>
                    <p className="text-center text-slate-500 mb-8">Texas Property Code</p>
                    <div className="space-y-6 font-serif text-sm leading-relaxed text-slate-800">
                       <p>This agreement is made between PropGuard Management and {formData.firstName} {formData.lastName}.</p>
                       <p>Rent: ${selectedListing?.price || 1850}.00 per month.</p>
                       <div className="my-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
                         <p className="font-bold mb-1">Sign Here:</p>
                         <div className="h-12 border-b border-yellow-400"></div>
                       </div>
                    </div>
                  </div>
               </div>
               <div className="w-full md:w-80 bg-white p-6 flex flex-col border-t md:border-t-0">
                  <h3 className="font-bold text-slate-800 mb-4">Action Required</h3>
                  <p className="text-sm text-slate-600 mb-6">Please review and sign to finalize.</p>
                  <button 
                      onClick={handleSignLease}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all mt-auto"
                    >
                      Finish & Submit
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* 2. LISTINGS VIEW (GUEST) */}
        {view === 'listings' && (
          <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <div className="bg-indigo-900 text-white py-16 px-6 md:px-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center"></div>
              <div className="relative z-10 max-w-7xl mx-auto">
                <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Find your next home in Texas</h1>
                    <p className="text-indigo-200 text-lg mb-8">Browse our curated selection of premium rentals with transparent pricing and instant applications.</p>
                    
                    <div className="flex flex-wrap gap-4">
                       <button onClick={() => setLoginType('tenant')} className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                         Resident Login
                       </button>
                       <button onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 bg-indigo-800/50 hover:bg-indigo-800 text-white font-bold rounded-lg backdrop-blur-sm border border-indigo-500/30 transition-colors">
                         Browse Listings
                       </button>
                    </div>
                </div>
              </div>
            </div>

            <div id="listings" className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                        id: 'l1', title: 'Luxury Downtown Loft', address: '101 Sunset Blvd, Unit 304, Austin, TX',
                        price: 1850, beds: 2, baths: 2, sqft: 1100,
                        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                        description: 'Modern loft...', amenities: []
                    },
                    {
                        id: 'l2', title: 'Cozy Suburban Family Home', address: '452 Oak Lane, Round Rock, TX',
                        price: 2200, beds: 3, baths: 2.5, sqft: 1800,
                        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                        description: 'Spacious family home...', amenities: []
                    },
                    {
                        id: 'l3', title: 'Riverside Condo', address: '888 River Rd, Unit 12, Austin, TX',
                        price: 1600, beds: 1, baths: 1, sqft: 850,
                        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                        description: 'Quiet condo...', amenities: []
                    }
                  ].map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
            </div>
          </div>
        )}

        {/* 3. APPLICATION VIEW */}
        {view === 'application' && (
          <div className="max-w-2xl mx-auto w-full px-4 md:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                   <button onClick={() => setView('listings')} className="text-slate-400 hover:text-slate-600"><ArrowLeft/></button>
                   <h2 className="text-xl font-bold text-slate-800">Application for {selectedListing?.title}</h2>
                </div>
                <div className="p-8">
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.firstName} readOnly />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.lastName} readOnly />
                         </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                          <input type="email" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.email} readOnly />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="font-medium text-slate-800 mb-2">Application Fee</h4>
                         <div className="flex justify-between text-sm mb-4">
                            <span className="text-slate-600">Processing & Background Check</span>
                            <span className="font-bold text-slate-800">$45.00</span>
                         </div>
                         <button 
                            onClick={() => { setUserStatus('applicant_pending'); setView('dashboard'); }}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                         >
                            Pay & Submit Application
                         </button>
                      </div>
                   </div>
                </div>
            </div>
          </div>
        )}

        {/* 4. RESIDENT / APPLICANT DASHBOARD */}
        {(view === 'dashboard') && (
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 animate-fade-in pb-20">
            {showPaymentModal && <PaymentModal />}
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {userStatus === 'resident' ? `Welcome Home, ${formData.firstName}` : 'Application Status'}
                </h1>
                <p className="text-slate-500">
                  {userStatus === 'resident' 
                    ? 'Manage your home, payments, and requests.' 
                    : 'Track your application progress below.'}
                </p>
              </div>
              {userStatus === 'resident' && (
                  <div className="relative">
                      <Bell className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50"></span>
                  </div>
              )}
            </div>

            {/* APPLICANT VIEW */}
            {userStatus !== 'resident' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6">Timeline</h3>
                  <StatusTracker status={userStatus} />
                </div>
                {userStatus === 'applicant_approved' && (
                   <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <Check className="w-12 h-12 text-emerald-600 mb-4" />
                      <h3 className="text-2xl font-bold text-emerald-900 mb-2">Approved!</h3>
                      <p className="text-emerald-800 mb-6 max-w-lg">
                        Your application has been approved. Please sign the lease to finalize your move-in.
                      </p>
                      <button onClick={() => setView('lease_signing')} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                        Review & Sign Lease
                      </button>
                   </div>
                )}
                 {userStatus === 'applicant_pending' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                     <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-blue-900 mb-2">Application Under Review</h3>
                     <p className="text-blue-700">We are processing your background check. This usually takes 24-48 hours.</p>
                  </div>
                )}
              </div>
            )}

            {/* RESIDENT PORTAL */}
            {userStatus === 'resident' && (
              <div className="space-y-6">
                {/* Resident Navigation Tabs */}
                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
                  {[
                    { id: 'overview', label: 'Overview', icon: Building2 },
                    { id: 'payments', label: 'Payments', icon: CreditCard },
                    { id: 'maintenance', label: 'Maintenance', icon: PenTool },
                    { id: 'documents', label: 'Documents', icon: FileText },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ResidentTab)}
                      className={`
                        flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                        ${activeTab === tab.id 
                          ? 'border-indigo-600 text-indigo-600' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                      `}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT */}

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Rent Status Alert */}
                    {daysUntilDue <= 3 && (
                        <div className={`
                          p-4 rounded-lg border-l-4 flex justify-between items-center
                          ${daysUntilDue < 0 ? 'bg-rose-50 border-rose-500 text-rose-900' : 
                            daysUntilDue === 0 ? 'bg-orange-50 border-orange-500 text-orange-900' : 
                            'bg-amber-50 border-amber-500 text-amber-900'}
                        `}>
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <div>
                              <p className="font-bold">
                                {daysUntilDue < 0 ? 'Rent is Overdue' : daysUntilDue === 0 ? 'Rent is Due Today' : 'Rent Due Soon'}
                              </p>
                              <p className="text-sm opacity-90">
                                 {daysUntilDue < 0 
                                   ? `Your payment was due ${Math.abs(daysUntilDue)} days ago. Late fees have been applied.` 
                                   : `Upcoming charge of $${residentBalance} due on Nov 1st.`}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => { setActiveTab('payments'); setShowPaymentModal(true); }} className="px-4 py-2 bg-white/50 hover:bg-white/80 rounded-lg text-sm font-bold border border-transparent hover:border-black/10 transition-colors">
                            Pay Now
                          </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Balance Card */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-500">Current Balance</h3>
                            <Banknote className="text-emerald-500 w-5 h-5" />
                         </div>
                         <p className="text-3xl font-bold text-slate-800 mb-1">${residentBalance}.00</p>
                         <p className="text-xs text-slate-500 mb-4">Includes rent & utilities</p>
                         <button onClick={() => setShowPaymentModal(true)} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            Make Payment
                         </button>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center gap-3">
                          <h3 className="font-semibold text-slate-500 mb-2">Quick Actions</h3>
                         <button onClick={() => setActiveTab('maintenance')} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200 flex items-center justify-center">
                            <PenTool className="w-4 h-4 mr-2 text-orange-500" /> Request Repair
                         </button>
                         <button onClick={() => setActiveTab('documents')} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 mr-2 text-blue-500" /> Message Manager
                         </button>
                      </div>

                       {/* Recent Activity Feed */}
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="font-semibold text-slate-500 mb-4">Notifications</h3>
                         <div className="space-y-4">
                            {notifications.map(n => (
                               <div key={n.id} className="flex gap-3 items-start">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 ${n.read ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                                  <div>
                                     <p className="text-sm font-medium text-slate-800">{n.title}</p>
                                     <p className="text-xs text-slate-500 leading-snug">{n.message}</p>
                                     <span className="text-[10px] text-slate-400">{n.date}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PAYMENTS TAB */}
                {activeTab === 'payments' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Invoice List */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                              <h3 className="font-bold text-slate-700 flex items-center"><History className="w-4 h-4 mr-2"/> Payment History</h3>
                           </div>
                           <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                 <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Period</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Receipt</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                       <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                                       <td className="px-6 py-4 text-slate-800 font-medium">{inv.period}</td>
                                       <td className="px-6 py-4 text-slate-800 font-bold">${inv.amount}</td>
                                       <td className="px-6 py-4">
                                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {inv.status}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          {inv.status === 'Paid' && (
                                            <button onClick={() => downloadReceipt(inv.id)} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition-colors" title="Download Receipt">
                                               <Download className="w-4 h-4" />
                                            </button>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg">
                               <p className="text-indigo-200 text-sm font-medium mb-1">Total Balance</p>
                               <p className="text-4xl font-bold mb-6">${residentBalance}.00</p>
                               <div className="space-y-3">
                                  <div className="flex justify-between text-sm border-b border-indigo-500/30 pb-2">
                                     <span>Rent (Nov)</span>
                                     <span>$1,800.00</span>
                                  </div>
                                  <div className="flex justify-between text-sm border-b border-indigo-500/30 pb-2">
                                     <span>Utility: Water</span>
                                     <span>$50.00</span>
                                  </div>
                               </div>
                               <button onClick={() => setShowPaymentModal(true)} className="w-full mt-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                                  Pay Now
                               </button>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                               <p className="font-semibold text-slate-800 mb-2">Auto-Pay</p>
                               <p className="mb-3">Set up automatic payments to avoid late fees.</p>
                               <button className="text-indigo-600 font-medium hover:underline">Configure Auto-Pay &rarr;</button>
                            </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* 3. MAINTENANCE TAB */}
                {activeTab === 'maintenance' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                       <h2 className="text-xl font-bold text-slate-800">Maintenance Requests</h2>
                       <button onClick={() => setShowMaintenanceForm(!showMaintenanceForm)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                          {showMaintenanceForm ? <X className="w-4 h-4 mr-2"/> : <PenTool className="w-4 h-4 mr-2" />}
                          {showMaintenanceForm ? 'Cancel' : 'New Request'}
                       </button>
                     </div>

                     {showMaintenanceForm && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 border-l-4 border-l-indigo-500">
                           <h3 className="font-bold text-slate-800 mb-4">Submit New Ticket</h3>
                           <div className="space-y-4 max-w-2xl">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Describe the issue</label>
                                 <textarea 
                                    value={maintenanceDesc}
                                    onChange={(e) => setMaintenanceDesc(e.target.value)}
                                    rows={3} 
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                    placeholder="e.g., Leaking faucet in master bath..."
                                 />
                                 <button 
                                    onClick={handleAnalyzeIssue}
                                    disabled={isAnalyzingMaintenance || !maintenanceDesc}
                                    className="mt-2 text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-800"
                                 >
                                    {isAnalyzingMaintenance ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : "✨ Auto-detect urgency with AI"}
                                 </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900">
                                       <option>Plumbing</option>
                                       <option>Electrical</option>
                                       <option>HVAC</option>
                                       <option>Appliance</option>
                                       <option>General</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                                    <select 
                                      value={maintenanceUrgency}
                                      onChange={(e) => setMaintenanceUrgency(e.target.value as any)}
                                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    >
                                       <option value="Low">Low (Cosmetic)</option>
                                       <option value="Medium">Normal (Standard repair)</option>
                                       <option value="High">High (Affects daily life)</option>
                                       <option value="Emergency">Emergency (Safety/Water)</option>
                                    </select>
                                 </div>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Photos</label>
                                 <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <ImageIcon className="w-6 h-6 mb-2" />
                                    <span className="text-sm">Click to upload images</span>
                                    <input type="file" className="hidden" multiple accept="image/*" />
                                 </div>
                              </div>

                              <div className="pt-4">
                                 <button onClick={handleMaintenanceSubmit} className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800">
                                    Submit Ticket
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="space-y-4">
                        {myTickets.map((ticket) => (
                           <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="font-bold text-slate-800">{ticket.category}</span>
                                       <span className="text-slate-400 text-sm">• {ticket.date}</span>
                                    </div>
                                    <p className="text-slate-600">{ticket.description}</p>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold mb-2 
                                       ${ticket.status === MaintenanceStatus.OPEN ? 'bg-rose-100 text-rose-700' : 
                                         ticket.status === MaintenanceStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' : 
                                         'bg-emerald-100 text-emerald-700'}`}>
                                       {ticket.status}
                                    </span>
                                 </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="relative pt-4 pb-2">
                                 <div className="flex mb-2 items-center justify-between text-xs font-medium text-slate-500">
                                    <span className={ticket.status !== 'Open' ? 'text-indigo-600' : ''}>Received</span>
                                    <span className={ticket.status === 'In Progress' ? 'text-indigo-600' : ''}>In Progress</span>
                                    <span className={ticket.status === 'Resolved' ? 'text-indigo-600' : ''}>Resolved</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                       className="h-full bg-indigo-500 transition-all duration-500" 
                                       style={{ width: ticket.status === 'Open' ? '10%' : ticket.status === 'In Progress' ? '50%' : '100%' }}
                                    ></div>
                                 </div>
                              </div>

                              {/* Updates */}
                              {ticket.updates && ticket.updates.length > 0 && (
                                 <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                                    <p className="font-semibold text-slate-700 text-xs uppercase mb-2">Latest Update</p>
                                    {ticket.updates.map((u, idx) => (
                                       <div key={idx} className="flex gap-2 text-slate-600">
                                          <span className="text-slate-400">{u.date}:</span>
                                          <span>{u.message}</span>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* 4. DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                      <div className="lg:col-span-2 space-y-6">
                         <h3 className="font-bold text-slate-700">Official Documents & Notices</h3>
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                            {[
                               { name: 'Signed Lease Agreement (2024-2025)', date: 'Nov 1, 2024', type: 'Lease' },
                               { name: 'Move-in Inspection Report', date: 'Nov 1, 2024', type: 'Report' },
                               { name: 'Welcome Packet & Community Rules', date: 'Oct 28, 2024', type: 'Guide' },
                            ].map((doc, i) => (
                               <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center gap-3">
                                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                                        <FileText className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <p className="font-medium text-slate-800">{doc.name}</p>
                                        <p className="text-xs text-slate-500">{doc.date} • {doc.type}</p>
                                     </div>
                                  </div>
                                  <button className="text-slate-400 hover:text-indigo-600"><Download className="w-5 h-5"/></button>
                               </div>
                            ))}
                         </div>

                         <h3 className="font-bold text-slate-700 pt-4">Notice Archive</h3>
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500 text-sm">
                            <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>You have no active compliance notices or lease violations.</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Mail className="w-4 h-4 mr-2"/> Contact Manager</h3>
                            <div className="space-y-3">
                               <textarea 
                                  className="w-full p-3 border border-slate-300 rounded-lg text-sm h-32 resize-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" 
                                  placeholder="Type your message here..."
                               ></textarea>
                               <button className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 text-sm">
                                  Send Message
                               </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                               <p className="mb-1 font-semibold">Office Hours:</p>
                               <p>Mon-Fri: 9am - 6pm</p>
                               <p>Sat: 10am - 4pm</p>
                               <p className="mt-2 text-indigo-600">(512) 555-0199</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPortal;
