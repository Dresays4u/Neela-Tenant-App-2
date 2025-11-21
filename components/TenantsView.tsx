
import React, { useState } from 'react';
import { Tenant, TenantStatus } from '../types';
import { generateLeaseAgreement } from '../services/geminiService';
import { 
  Search, UserPlus, MoreVertical, CheckCircle, AlertCircle, Clock, 
  FileText, X, Briefcase, Shield, MessageSquare, Download, ChevronRight, Loader2,
  Check, Sparkles, Send, PenTool, Printer
} from 'lucide-react';

interface TenantsProps {
  tenants: Tenant[];
  initialTab?: 'residents' | 'applicants';
}

const TenantsView: React.FC<TenantsProps> = ({ tenants, initialTab = 'residents' }) => {
  const [activeTab, setActiveTab] = useState<'residents' | 'applicants'>(initialTab);
  const [selectedApplicant, setSelectedApplicant] = useState<Tenant | null>(null);
  const [applicantModalTab, setApplicantModalTab] = useState<'overview' | 'screening' | 'notes' | 'lease'>('overview');
  
  // Application Review State
  const [simulatingCheck, setSimulatingCheck] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Lease Generation State
  const [leaseTemplate, setLeaseTemplate] = useState('Standard Texas Residential');
  const [generatedLease, setGeneratedLease] = useState('');
  const [isGeneratingLease, setIsGeneratingLease] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<'Draft' | 'Sent' | 'Signed'>('Draft');
  const [isSending, setIsSending] = useState(false);

  // Filter Lists
  const residents = tenants.filter(t => t.status !== TenantStatus.APPLICANT);
  const applicants = tenants.filter(t => t.status === TenantStatus.APPLICANT);

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700';
      case TenantStatus.EVICTION_PENDING: return 'bg-rose-100 text-rose-700';
      case TenantStatus.APPLICANT: return 'bg-blue-100 text-blue-700';
      case TenantStatus.APPROVED: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const openApplicationReview = (applicant: Tenant) => {
    setSelectedApplicant(applicant);
    setInternalNotes(applicant.applicationData?.internalNotes || '');
    setApplicantModalTab('overview');
    setGeneratedLease('');
    setLeaseStatus('Draft');
  };

  const runBackgroundCheck = () => {
    setSimulatingCheck(true);
    setTimeout(() => {
      setSimulatingCheck(false);
      if (selectedApplicant) {
        const updated = { ...selectedApplicant, backgroundCheckStatus: 'Clear' as const, creditScore: 715 };
        setSelectedApplicant(updated);
      }
    }, 2000);
  };

  const handleGenerateLease = async () => {
    if (!selectedApplicant) return;
    setIsGeneratingLease(true);
    try {
      const lease = await generateLeaseAgreement(selectedApplicant, leaseTemplate);
      setGeneratedLease(lease);
      setLeaseStatus('Draft');
    } finally {
      setIsGeneratingLease(false);
    }
  };

  const handleSendDocuSign = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setLeaseStatus('Sent');
      // In a real app, this would trigger an API call to DocuSign
    }, 2000);
  };

  const handleSimulateSignature = () => {
    // Demo utility to fast-forward the signing process
    setLeaseStatus('Signed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {activeTab === 'residents' ? 'Current Residents' : 'Application Management'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab === 'residents' 
              ? 'Manage leases, balances, and tenant profiles.' 
              : 'Review, screen, and approve incoming applications.'}
          </p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
                onClick={() => setActiveTab('residents')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'residents' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
             >
                Residents
             </button>
             <button 
                onClick={() => setActiveTab('applicants')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'applicants' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
             >
                Applications ({applicants.length})
             </button>
           </div>
        </div>
      </div>

      {/* APPLICATION REVIEW MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                   {selectedApplicant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedApplicant.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                     <span>{selectedApplicant.email}</span>
                     <span>•</span>
                     <span>Applying for: {selectedApplicant.propertyUnit}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedApplicant.status)}`}>
                    {selectedApplicant.status}
                 </div>
                 <button onClick={() => setSelectedApplicant(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full">
                    <X className="w-6 h-6" />
                 </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2">
                 {[
                   { id: 'overview', label: 'Application Details', icon: FileText },
                   { id: 'screening', label: 'Screening & ID', icon: Shield },
                   { id: 'notes', label: 'Internal Notes', icon: MessageSquare },
                   { id: 'lease', label: 'Lease Generation', icon: Sparkles },
                 ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setApplicantModalTab(tab.id as any)}
                      className={`
                        flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${applicantModalTab === tab.id 
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                      `}
                    >
                       <tab.icon className="w-4 h-4 mr-3" />
                       {tab.label}
                       {tab.id === 'lease' && leaseStatus === 'Signed' && (
                         <CheckCircle className="w-3 h-3 ml-auto text-emerald-500" />
                       )}
                    </button>
                 ))}

                 {/* Action Buttons */}
                 <div className="mt-auto space-y-2 pt-6 border-t border-slate-200">
                    {leaseStatus === 'Signed' ? (
                       <button className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2">
                         <UserPlus className="w-4 h-4" /> Finalize Move-In
                       </button>
                    ) : (
                      <>
                        <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2">
                           <Check className="w-4 h-4" /> Approve Application
                        </button>
                        <button className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                           Decline
                        </button>
                      </>
                    )}
                 </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8">
                 {applicantModalTab === 'overview' && selectedApplicant.applicationData && (
                    <div className="space-y-6 animate-fade-in">
                       <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                          <div>
                             <p className="text-xs font-bold text-indigo-600 uppercase">Monthly Income</p>
                             <p className="text-2xl font-bold text-indigo-900">${selectedApplicant.applicationData.employment.monthlyIncome.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-indigo-600 uppercase">Rent-to-Income</p>
                             <p className="text-2xl font-bold text-indigo-900">
                                {Math.round((selectedApplicant.rentAmount / selectedApplicant.applicationData.employment.monthlyIncome) * 100)}%
                             </p>
                          </div>
                       </div>

                       <div>
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Employment</h4>
                          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                             <p className="text-slate-800 font-medium">{selectedApplicant.applicationData.employment.jobTitle}</p>
                             <p className="text-slate-600">{selectedApplicant.applicationData.employment.employer}</p>
                             <p className="text-sm text-slate-500">Employed for: {selectedApplicant.applicationData.employment.duration}</p>
                          </div>
                       </div>

                       <div>
                          <h4 className="font-bold text-slate-800 mb-3">Documents</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {selectedApplicant.applicationData.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 bg-slate-100 rounded text-slate-500">
                                         <FileText className="w-4 h-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                                         <p className="text-xs text-slate-500">{doc.type}</p>
                                      </div>
                                   </div>
                                   <Download className="w-4 h-4 text-slate-400" />
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {applicantModalTab === 'screening' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-800 text-lg">Background & Credit Check</h3>
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-500">Powered by TransUnion</span>
                          </div>
                       </div>
                       
                       {selectedApplicant.backgroundCheckStatus === 'Pending' && !simulatingCheck ? (
                          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                             <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                             <h4 className="text-lg font-bold text-slate-700 mb-2">No Screening Report Generated</h4>
                             <p className="text-slate-500 mb-6">Run a SmartMove credit and criminal background check.</p>
                             <button onClick={runBackgroundCheck} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                Trigger Background Check ($45)
                             </button>
                          </div>
                       ) : simulatingCheck ? (
                          <div className="flex flex-col items-center justify-center h-64 space-y-4">
                             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                             <p className="text-slate-600 font-medium">Connecting to TransUnion SmartMove...</p>
                          </div>
                       ) : (
                          <div className="space-y-6">
                             <div className="grid grid-cols-3 gap-4">
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                   <p className="text-sm text-slate-500 font-medium mb-1">Credit Score</p>
                                   <p className="text-4xl font-extrabold text-emerald-600">{selectedApplicant.creditScore}</p>
                                   <p className="text-xs text-emerald-600 font-bold mt-1">Good</p>
                                </div>
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                   <p className="text-sm text-slate-500 font-medium mb-1">Criminal Record</p>
                                   <div className="flex items-center justify-center mt-2">
                                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                                   </div>
                                   <p className="text-xs text-slate-500 mt-2">No Records Found</p>
                                </div>
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                   <p className="text-sm text-slate-500 font-medium mb-1">Eviction History</p>
                                   <div className="flex items-center justify-center mt-2">
                                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                                   </div>
                                   <p className="text-xs text-slate-500 mt-2">No Prior Evictions</p>
                                </div>
                             </div>
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h5 className="font-bold text-blue-800 text-sm mb-2">SmartMove Recommendation</h5>
                                <p className="text-sm text-blue-700">
                                   Based on the credit score of {selectedApplicant.creditScore} and clean history, this applicant meets the property requirements.
                                </p>
                             </div>
                          </div>
                       )}
                    </div>
                 )}

                 {applicantModalTab === 'notes' && (
                    <div className="h-full flex flex-col animate-fade-in">
                       <h3 className="font-bold text-slate-800 mb-4">Internal Notes</h3>
                       <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4 flex items-start gap-3">
                          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">These notes are only visible to property managers and staff. Applicants cannot see this.</p>
                       </div>
                       <textarea
                          className="flex-1 p-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                          placeholder="Add notes about interactions, showing feedback, or exceptions..."
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                       ></textarea>
                       <div className="mt-4 flex justify-end">
                          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save Notes</button>
                       </div>
                    </div>
                 )}

                 {applicantModalTab === 'lease' && (
                    <div className="animate-fade-in h-full flex flex-col">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-slate-800">Lease Generation & Signing</h3>
                          <div className="flex items-center gap-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold border
                                ${leaseStatus === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                  leaseStatus === 'Sent' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                  'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                {leaseStatus.toUpperCase()}
                             </span>
                          </div>
                       </div>

                       {/* Control Bar */}
                       {!generatedLease ? (
                          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Lease Template</label>
                                   <select 
                                     className="w-full p-2 border border-slate-300 rounded-lg"
                                     value={leaseTemplate}
                                     onChange={(e) => setLeaseTemplate(e.target.value)}
                                   >
                                      <option>Standard Texas Residential</option>
                                      <option>Month-to-Month Agreement</option>
                                      <option>Student Housing (Guarantor Req)</option>
                                   </select>
                                </div>
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Lease Term</label>
                                   <div className="flex items-center text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                      {selectedApplicant.leaseStart} to {selectedApplicant.leaseEnd}
                                   </div>
                                </div>
                             </div>
                             <button 
                                onClick={handleGenerateLease}
                                disabled={isGeneratingLease}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                             >
                                {isGeneratingLease ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                                {isGeneratingLease ? 'Drafting with Gemini AI...' : 'Auto-Fill Lease Template'}
                             </button>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 mb-4">
                             {leaseStatus === 'Draft' && (
                               <button 
                                  onClick={() => setGeneratedLease('')} 
                                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                               >
                                  Back to Config
                               </button>
                             )}
                             <div className="flex-1"></div>
                             {leaseStatus === 'Draft' && (
                               <button 
                                  onClick={handleSendDocuSign}
                                  disabled={isSending}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
                               >
                                  {isSending ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>}
                                  {isSending ? 'Sending...' : 'Send via DocuSign'}
                               </button>
                             )}
                             {leaseStatus === 'Sent' && (
                                <button 
                                  onClick={handleSimulateSignature}
                                  className="px-4 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-sm font-bold hover:bg-amber-200 flex items-center gap-2"
                                >
                                   <Clock className="w-4 h-4" /> Simulate Tenant Signature
                                </button>
                             )}
                             {leaseStatus === 'Signed' && (
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200">
                                   <Download className="w-4 h-4" /> Download Executed PDF
                                </button>
                             )}
                          </div>
                       )}

                       {/* Lease Status Messages */}
                       {leaseStatus === 'Sent' && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                <div>
                                   <p className="text-sm font-bold text-blue-800">Waiting for Signature</p>
                                   <p className="text-xs text-blue-600">Envelope sent to {selectedApplicant.email}</p>
                                </div>
                             </div>
                             <button className="text-xs text-blue-600 underline hover:text-blue-800">Resend Link</button>
                          </div>
                       )}
                       {leaseStatus === 'Signed' && (
                          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                             <CheckCircle className="w-5 h-5 text-emerald-600" />
                             <div>
                                <p className="text-sm font-bold text-emerald-800">Lease Signed & Executed!</p>
                                <p className="text-xs text-emerald-600">Document stored in Tenant Profile.</p>
                             </div>
                          </div>
                       )}

                       {/* Editor / Preview */}
                       {generatedLease && (
                          <div className="flex-1 relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
                             <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Document Editor</span>
                                <div className="flex gap-2">
                                   <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Printer className="w-4 h-4"/></button>
                                   <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><PenTool className="w-4 h-4"/></button>
                                </div>
                             </div>
                             <textarea 
                                value={generatedLease}
                                onChange={(e) => setGeneratedLease(e.target.value)}
                                readOnly={leaseStatus !== 'Draft'}
                                className="flex-1 p-8 font-serif text-sm text-slate-800 leading-relaxed resize-none focus:outline-none w-full"
                             />
                          </div>
                       )}
                       
                       {!generatedLease && (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                             <FileText className="w-16 h-16 text-slate-200 mb-4" />
                             <p className="text-slate-400">Select a template and click Generate to draft the lease.</p>
                          </div>
                       )}
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TABLE CONTENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={activeTab === 'residents' ? "Search residents..." : "Search applicants..."}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 placeholder-slate-500"
            />
          </div>
          {activeTab === 'residents' && (
             <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ml-auto">
               <UserPlus className="w-4 h-4 mr-2" /> Add Resident
             </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">{activeTab === 'residents' ? 'Tenant' : 'Applicant'}</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Unit</th>
                {activeTab === 'residents' ? (
                   <>
                     <th className="px-6 py-4">Balance</th>
                     <th className="px-6 py-4">Lease End</th>
                   </>
                ) : (
                   <>
                     <th className="px-6 py-4">Submitted</th>
                     <th className="px-6 py-4">Credit</th>
                     <th className="px-6 py-4">Income</th>
                   </>
                )}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'residents' ? residents : applicants).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{t.name}</span>
                      <span className="text-xs text-slate-500">{t.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{t.propertyUnit}</td>
                  
                  {activeTab === 'residents' ? (
                    <>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${t.balance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          ${t.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{t.leaseEnd}</td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-slate-500">{t.applicationData?.submissionDate || 'N/A'}</td>
                      <td className="px-6 py-4">
                         {t.backgroundCheckStatus === 'Clear' ? (
                            <span className="flex items-center text-emerald-600 text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> {t.creditScore}</span>
                         ) : (
                            <span className="flex items-center text-slate-400 text-xs"><Clock className="w-3 h-3 mr-1"/> Pending</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                         ${t.applicationData?.employment.monthlyIncome.toLocaleString()}/mo
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => openApplicationReview(t)}
                           className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold transition-all"
                         >
                            Review
                         </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {(activeTab === 'residents' ? residents : applicants).length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                       No {activeTab} found.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantsView;
