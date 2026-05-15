import React, { useState, useEffect } from 'react';
import { getEquipment, getAllRentals, getUserProfiles, addEquipment, updateEquipment, updateUserRole, returnEquipment, approveRental, rejectRental } from '../services/firebase';
import { Equipment, Rental, UserProfile, UserRole } from '../types';
import { Package, ClipboardList, Users, Plus, Edit2, Trash2, Search, Filter, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, User, ShieldCheck, XCircle, LayoutDashboard, Database, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'approvals' | 'transactions' | 'users'>('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newEquip, setNewEquip] = useState<Omit<Equipment, 'id' | 'lastUpdated'>>({
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    totalQuantity: 1,
    availableQuantity: 1,
    condition: 'New',
    status: 'active',
  });

  useEffect(() => {
    const unsubEquip = getEquipment(setEquipment);
    const unsubRentals = getAllRentals(setRentals);
    const unsubUsers = getUserProfiles(setUsers);
    return () => {
      unsubEquip();
      unsubRentals();
      unsubUsers();
    };
  }, []);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEquipment(newEquip);
      setIsAdding(false);
      setNewEquip({
        name: '',
        category: '',
        description: '',
        imageUrl: '',
        totalQuantity: 1,
        availableQuantity: 1,
        condition: 'New',
        status: 'active',
      });
      alert("Equipment added!");
    } catch (error) {
      console.error(error);
      alert("Error adding equipment.");
    }
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    if (confirm(`Change user role to ${role}?`)) {
      await updateUserRole(userId, role);
    }
  };

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (rentalId: string) => {
    if (processingId) return;
    setProcessingId(rentalId);
    try {
      await approveRental(rentalId);
    } catch (error: any) {
      alert(error.message || "Error approving request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (rentalId: string) => {
    if (processingId) return;
    if (confirm("Reject this borrow request?")) {
      setProcessingId(rentalId);
      try {
        await rejectRental(rentalId);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const stats = {
    totalItems: equipment.reduce((acc, curr) => acc + curr.totalQuantity, 0),
    activeRentals: rentals.filter(r => r.status === 'APPROVED').length,
    pendingRequests: rentals.filter(r => r.status === 'PENDING AUTHORIZATION').length,
    usersCount: users.length,
  };

  return (
    <div className="space-y-12">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl shadow-slate-200"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0 backdrop-blur-xl">
            <LayoutDashboard className="w-10 h-10 text-blue-400" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">System Active</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter italic mb-4">HiramHub Command Center</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl font-serif">
              Integrated collegiate sports resource management system. Orchestrating athletic assets with precision and administrative excellence. Monitor inventory, authorize borrow sequences, and manage academic athletic profiles in real-time.
            </p>

            <div className="flex items-center justify-center md:justify-start gap-8 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Engine</div>
                  <div className="text-xs font-bold text-white">v2.4.0 Alpha</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Latency</div>
                  <div className="text-xs font-bold text-white">12ms Response</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Atmospheric Data</div>
             <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <Activity className="w-3 h-3" />
                DSSC_NET_UP
             </div>
             <div className="flex items-center gap-2 text-blue-400 font-mono text-xs">
                <Database className="w-3 h-3" />
                PROTO_STABLE
             </div>
          </div>
        </div>
      </motion.section>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resource Dashboard</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Oversight Terminal</p>
        </div>
        
        <div className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
            { id: 'transactions', label: 'History', icon: ClipboardList },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'approvals' && stats.pendingRequests > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Asset Density', value: stats.totalItems, icon: Package, color: 'blue' },
          { label: 'Active IO', value: stats.activeRentals, icon: ClipboardList, color: 'amber' },
          { label: 'Pending Auth', value: stats.pendingRequests, icon: Clock, color: 'red' },
          { label: 'Network UIDs', value: stats.usersCount, icon: Users, color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${stat.color === 'red' && stat.value > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-blue-50 transition-colors">
                    <LayoutDashboard className="w-32 h-32 rotate-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 italic tracking-tight">System Architecture</h3>
                  <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
                    <p>
                      The HiramHub System is engineered to maintain equilibrium between athletic demand and institutional supply. 
                      Utilizing real-time synchronization, every transaction is verified through our administrative protocol.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Operational Protocol</div>
                        <div className="text-xs text-slate-500">Automated verification for athlete asset requests with priority queuing.</div>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Integrity Monitoring</div>
                        <div className="text-xs text-slate-500">Continuous tracking of hardware condition and maintenance cycles.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Network Health</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">Sync Reliability</span>
                        <span className="text-sm font-black italic">99.98%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '99.98%' }} className="h-full bg-emerald-500"></motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="w-5 h-5 text-blue-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Data Latency</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-blue-100 font-bold uppercase tracking-tight">API Response</span>
                        <span className="text-sm font-black italic">14ms</span>
                      </div>
                      <div className="h-1.5 bg-blue-500 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-white"></motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Recent Activity Log</h3>
                  <div className="space-y-6">
                    {rentals.slice(0, 5).map((rental, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={`w-1 h-10 rounded-full mt-1 ${
                          rental.status === 'APPROVED' ? 'bg-amber-500' :
                          rental.status === 'PENDING AUTHORIZATION' ? 'bg-blue-500' :
                          'bg-emerald-500'
                        }`}></div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none mb-1">{rental.equipmentName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{rental.userName} • {format(rental.borrowedAt, 'HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                    {rentals.length === 0 && <p className="text-xs text-slate-400 italic">No recent network activity recorded.</p>}
                  </div>
                </div>

                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20">
                  <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-emerald-100">Quick Actions</h3>
                  <div className="grid gap-3">
                    <button onClick={() => setActiveTab('approvals')} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Review Requests</button>
                    <button onClick={() => setActiveTab('inventory')} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Audit Hardware</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <div
            key="inventory"
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Inventory Monitor</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Physical Asset Verification</p>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Initialize Asset
              </button>
            </div>

            {isAdding && (
              <form
                onSubmit={handleAddEquipment}
                className="bg-slate-900 p-8 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Asset Name</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={newEquip.name}
                    onChange={e => setNewEquip({ ...newEquip, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Class</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={newEquip.category}
                    onChange={e => setNewEquip({ ...newEquip, category: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Integrity</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    value={newEquip.condition}
                    onChange={e => setNewEquip({ ...newEquip, condition: e.target.value })}
                  >
                    <option>New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Instance Count</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={newEquip.totalQuantity}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setNewEquip({ ...newEquip, totalQuantity: val, availableQuantity: val });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Asset Image URL</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-[10px]"
                    placeholder="https://images.unsplash.com/..."
                    value={newEquip.imageUrl}
                    onChange={e => setNewEquip({ ...newEquip, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Node Metadata</label>
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={newEquip.description}
                    onChange={e => setNewEquip({ ...newEquip, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Abort Sync</button>
                  <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all">Submit to Registry</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Identifier</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instances</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {equipment.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wide truncate max-w-xs">{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600">{item.category}</td>
                      <td className="px-8 py-6">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">{item.condition}</span>
                      </td>
                      <td className="px-8 py-6 font-mono text-sm font-bold text-slate-900 bg-slate-50/50">
                        {item.availableQuantity} <span className="text-slate-300 font-normal">/</span> {item.totalQuantity}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => {
                            const newQty = parseInt(prompt("Enter new total quantity", item.totalQuantity.toString()) || item.totalQuantity.toString());
                            const newUrl = prompt("Enter new Image URL (leave empty to keep current)", item.imageUrl || "") || item.imageUrl;
                            const updates: Partial<Equipment> = {};
                            if (!isNaN(newQty)) {
                              updates.totalQuantity = newQty;
                              updates.availableQuantity = newQty; // Simplification: reset availability on qty change
                            }
                            if (newUrl) updates.imageUrl = newUrl;
                            
                            if (Object.keys(updates).length > 0) {
                              updateEquipment(item.id, updates);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-blue-600 transition-all hover:bg-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div key="approvals" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pending Authorizations</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Awaiting Administrative Verification</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requester</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Requested</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rentals.filter(r => r.status === 'PENDING AUTHORIZATION').map(rental => (
                    <tr key={rental.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900">{rental.userName}</p>
                        <p className="text-[10px] text-slate-400 tracking-tight">{rental.userId}</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-blue-600">{rental.equipmentName}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {format(rental.borrowedAt, 'MMM dd, HH:mm')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <ArrowDownRight className="w-3 h-3" />
                            Until {format(rental.expectedReturnAt, 'HH:mm')}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-[150px] italic">"{rental.purpose || 'No purpose stated'}"</p>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleReject(rental.id)}
                          disabled={processingId === rental.id}
                          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all font-sans disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(rental.id)}
                          disabled={processingId === rental.id}
                          className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-100 font-sans disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rentals.filter(r => r.status === 'PENDING AUTHORIZATION').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm font-serif">No pending authorizations in queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div
            key="transactions"
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Path</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Init Timestamp</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">State</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rentals.map(rental => (
                    <tr key={rental.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900">{rental.userName}</p>
                        <p className="text-[10px] text-slate-400 tracking-tight">{rental.userId}</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-blue-600">{rental.equipmentName}</td>
                      <td className="px-8 py-6 text-xs font-medium text-slate-500">{format(rental.borrowedAt, 'MMM dd, HH:mm')}</td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rental.status === 'APPROVED' ? 'bg-amber-100 text-amber-700' : 
                          rental.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' :
                          rental.status === 'PENDING AUTHORIZATION' ? 'bg-blue-100 text-blue-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {rental.status === 'PENDING AUTHORIZATION' ? 'WAITING FOR APPROVAL' : rental.status === 'APPROVED' ? 'APPROVED' : rental.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {rental.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              const cond = prompt("Condition on return?") || "Good";
                              returnEquipment(rental.id, rental.equipmentId, cond);
                            }}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all"
                          >
                            Override Sync
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div
            key="users"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map(user => (
              <div key={user.uid} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate tracking-tight">{user.fullName || user.displayName}</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                    {user.studentId && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.studentId} • {user.department}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Status</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${user.role === 'athlete' ? 'text-orange-600' : 'text-slate-600'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Affiliation</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {user.role === 'athlete' ? 'Varsity' : 'General'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Privilege Level</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <select
                    className="text-[10px] font-bold uppercase tracking-widest p-2 border border-slate-100 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                  >
                    <option value="athlete">Athlete</option>
                    <option value="non-athlete">Non-athlete</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
