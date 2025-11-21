import React, { useState } from 'react';
import { MaintenanceRequest, MaintenanceStatus, Tenant } from '../types';
import { analyzeMaintenanceRequest } from '../services/geminiService';
import { 
  Wrench, MessageSquare, Loader2, Filter, Download, Search, 
  User, Calendar, CheckCircle, X, Paperclip, Send, AlertTriangle,
  Clock, ArrowRight, FileText
} from 'lucide-react';

interface MaintenanceProps {
  requests: MaintenanceRequest[];
  tenants: Tenant[];
}

const MaintenanceView: React.FC<MaintenanceProps> = ({ requests: initialRequests, tenants }) => {
  // State
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [newRequestDesc, setNewRequestDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal State
  const [commentText, setCommentText] = useState('');
  const [assigneeName, setAssigneeName] = useState('');

  const tenantsMap = tenants.reduce((acc, t) => ({ ...acc, [t.id]: t }), {} as Record<string, Tenant>);

  // Filtering Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenantsMap[req.tenantId]?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Actions
  const handleAnalyze = async () => {
    if (!newRequestDesc) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMaintenanceRequest(newRequestDesc);
      const newTicket: MaintenanceRequest = {
        id: `m-${Date.now()}`,
        tenantId: tenants[0].id, // Defaulting to first tenant for quick add demo
        category: 'General',
        description: newRequestDesc,
        status: MaintenanceStatus.OPEN,
        priority: result.priority as any || 'Medium',
        createdAt: new Date().toISOString().split('T')[0],
        updates: [{
          date: new Date().toISOString().split('T')[0],
          message: `AI Analysis: Recommended ${result.vendorType} - ${result.summary}`,
          author: 'System'
        }]
      };
      setRequests([newTicket, ...requests]);
      setNewRequestDesc('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateTicketStatus = (id: string, newStatus: MaintenanceStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedTicket) setSelectedTicket({ ...selectedTicket, status: newStatus });
  };

  const assignTicket = (id: string) => {
    if (!assigneeName) return;
    setRequests(requests.map(r => r.id === id ? { ...r, assignedTo: assigneeName } : r));
    if (selectedTicket) setSelectedTicket({ ...selectedTicket, assignedTo: assigneeName });
    addUpdate(id, `Ticket assigned to ${assigneeName}`);
    setAssigneeName('');
  };

  const addUpdate = (id: string, message: string) => {
    const newUpdate = {
      date: new Date().toISOString().split('T')[0],
      message,
      author: 'Manager'
    };
    setRequests(requests.map(r => {
      if (r.id === id) {
        return { ...r, updates: [...(r.updates || []), newUpdate] };
      }
      return r;
    }));
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, updates: [...(selectedTicket.updates || []), newUpdate] });
    }
  };

  const handleAttachFile = () => {
    // Simulate file attachment
    if (selectedTicket) {
      const attachment = { name: 'Invoice_Repair.pdf', url: '#' };
      const updated = { 
        ...selectedTicket, 
        completionAttachments: [...(selectedTicket.completionAttachments || []), attachment] 
      };
      setRequests(requests.map(r => r.id === selectedTicket.id ? updated : r));
      setSelectedTicket(updated);
      addUpdate(selectedTicket.id, "Attached completion document: Invoice_Repair.pdf");
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Tenant,Category,Status,Priority,Date\n"
      + filteredRequests.map(r => `${r.id},${tenantsMap[r.tenantId]?.name},${r.category},${r.status},${r.priority},${r.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "maintenance_tickets.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Color Helpers
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Emergency': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Open': return 'text-rose-600 bg-rose-50';
      case 'In Progress': return 'text-amber-600 bg-amber-50';
      case 'Resolved': return 'text-emerald-600 bg-emerald-50';
      case 'Closed': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Maintenance Hub</h2>
          <p className="text-slate-500">Track repairs, assign vendors, and manage tenant requests.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets, tenants, or categories..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            className="p-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select 
            className="p-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Ticket List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Active Tickets ({filteredRequests.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRequests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedTicket(req)}
                className={`
                  p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md
                  ${selectedTicket?.id === req.id 
                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                    : 'bg-white border-slate-200 hover:border-indigo-300'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">#{req.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{req.category}</span>
                   </div>
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                      {req.status}
                   </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{req.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                   <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{tenantsMap[req.tenantId]?.name}</span>
                      <span className="text-slate-300">|</span>
                      <span>{tenantsMap[req.tenantId]?.propertyUnit}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{req.createdAt}</span>
                   </div>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
               <div className="p-8 text-center text-slate-400">No tickets found matching your filters.</div>
            )}
          </div>
        </div>

        {/* Ticket Details Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {selectedTicket ? (
             <>
               <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     Ticket Details <span className="text-slate-500 font-normal text-sm">#{selectedTicket.id}</span>
                   </h3>
                 </div>
                 <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status Control */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <span className="text-sm font-medium text-slate-700">Current Status</span>
                     <select 
                       value={selectedTicket.status}
                       onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as MaintenanceStatus)}
                       className={`text-sm font-bold border-none rounded focus:ring-0 cursor-pointer bg-transparent ${getStatusColor(selectedTicket.status)}`}
                     >
                        <option value={MaintenanceStatus.OPEN}>Open</option>
                        <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
                        <option value={MaintenanceStatus.RESOLVED}>Resolved</option>
                        <option value={MaintenanceStatus.CLOSED}>Closed</option>
                     </select>
                  </div>

                  {/* Description */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Issue Description</h4>
                     <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                        {selectedTicket.description}
                     </p>
                  </div>

                  {/* Assignment */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Assignment</h4>
                     {selectedTicket.assignedTo ? (
                        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                                 {selectedTicket.assignedTo.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-indigo-900">{selectedTicket.assignedTo}</p>
                                 <p className="text-xs text-indigo-600">Assigned Vendor</p>
                              </div>
                           </div>
                           <button onClick={() => updateTicketStatus(selectedTicket.id, MaintenanceStatus.OPEN)} className="text-xs text-indigo-500 hover:text-indigo-700">Reassign</button>
                        </div>
                     ) : (
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             placeholder="Enter vendor name..." 
                             className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-500"
                             value={assigneeName}
                             onChange={(e) => setAssigneeName(e.target.value)}
                           />
                           <button 
                             onClick={() => assignTicket(selectedTicket.id)}
                             disabled={!assigneeName}
                             className="px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50"
                           >
                              Assign
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Activity Feed */}
                  <div className="border-t border-slate-100 pt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Updates & Comments</h4>
                     <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-2">
                        {selectedTicket.updates?.map((u, i) => (
                           <div key={i} className="flex gap-3 text-sm">
                              <div className="flex-shrink-0 mt-0.5">
                                 {u.author === 'System' ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                 ) : (
                                    <MessageSquare className="w-4 h-4 text-slate-400" />
                                 )}
                              </div>
                              <div>
                                 <p className="text-slate-800"><span className="font-bold text-slate-700">{u.author}:</span> {u.message}</p>
                                 <p className="text-xs text-slate-500">{u.date}</p>
                              </div>
                           </div>
                        ))}
                        {(!selectedTicket.updates || selectedTicket.updates.length === 0) && (
                           <p className="text-sm text-slate-400 italic">No updates yet.</p>
                        )}
                     </div>
                     
                     <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Add an internal note or update..."
                          className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-500"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && commentText) {
                              addUpdate(selectedTicket.id, commentText);
                              setCommentText('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                             if (commentText) {
                                addUpdate(selectedTicket.id, commentText);
                                setCommentText('');
                             }
                          }}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </div>

                  {/* Completion Actions */}
                  {selectedTicket.status === MaintenanceStatus.RESOLVED && (
                     <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-emerald-800 mb-2">Resolution Proof</h4>
                        <div className="space-y-2">
                           {selectedTicket.completionAttachments?.map((file, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-emerald-700 bg-white/50 p-2 rounded">
                                 <FileText className="w-4 h-4" />
                                 <span className="flex-1 truncate">{file.name}</span>
                                 <CheckCircle className="w-4 h-4" />
                              </div>
                           ))}
                           <button 
                              onClick={handleAttachFile}
                              className="w-full py-2 border border-dashed border-emerald-300 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center justify-center gap-2"
                           >
                              <Paperclip className="w-4 h-4" /> Attach Photo / PDF
                           </button>
                           <button 
                              onClick={() => { alert(`Email sent to ${tenantsMap[selectedTicket.tenantId]?.email}`); }}
                              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                           >
                              Send Completion Email
                           </button>
                        </div>
                     </div>
                  )}
               </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Wrench className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Select a ticket to view details</p>
                <p className="text-sm mt-2">Manage assignments, update status, and communicate with tenants.</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Quick Add (Preserved for Manager usage) */}
      <div className="bg-slate-50 border-t border-slate-200 pt-4 px-4 pb-2 -mx-4 -mb-4 md:hidden">
         <p className="text-xs font-bold text-slate-500 uppercase mb-2">Quick Add Ticket</p>
         <div className="flex gap-2">
            <input 
               type="text"
               placeholder="Describe issue..."
               className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
               value={newRequestDesc}
               onChange={(e) => setNewRequestDesc(e.target.value)}
            />
            <button onClick={handleAnalyze} className="p-2 bg-indigo-600 text-white rounded-lg">
               {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4"/>}
            </button>
         </div>
      </div>
    </div>
  );
};

export default MaintenanceView;