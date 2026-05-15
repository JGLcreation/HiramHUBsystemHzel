import React, { useState, useEffect } from 'react';
import { getMyRentals, returnEquipment, getNotifications } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Rental, Notification } from '../types';
import { Clock, CheckCircle, AlertCircle, Calendar, Package, History, ShieldCheck, XCircle, Bell, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const MyRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      const unsubscribeRentals = getMyRentals(profile.uid, (data) => {
        // Sort by borrowedAt descending
        const sorted = data.sort((a, b) => b.borrowedAt.getTime() - a.borrowedAt.getTime());
        setRentals(sorted);
        setLoading(false);
      });

      const unsubscribeNotifications = getNotifications(profile.uid, (data) => {
        setNotifications(data.slice(0, 3)); // Only show last 3
      });

      return () => {
        unsubscribeRentals();
        unsubscribeNotifications();
      };
    }
  }, [profile]);

  const handleReturn = async (rental: Rental) => {
    const condition = prompt("What is the condition of the equipment on return?", "Good");
    if (condition !== null) {
      try {
        await returnEquipment(rental.id, rental.equipmentId, condition);
        alert("Equipment returned successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to return equipment.");
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  const pendingRentals = rentals.filter(r => r.status === 'pending');
  const activeRentals = rentals.filter(r => r.status === 'active');
  const pastRentals = rentals.filter(r => r.status === 'returned' || r.status === 'rejected');

  // Items just approved but not yet "acknowledged" or returned
  const pendingPickup = activeRentals.filter(r => !r.returnedAt);

  return (
    <div className="space-y-16">
      {pendingPickup.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 opacity-10">
              <CheckCircle className="w-32 h-32" />
            </div>
            
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shrink-0">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-black tracking-tight italic">Authorization Granted!</h2>
              <p className="text-white/90 text-sm font-medium mt-2 max-w-md">
                Protocol success: {pendingPickup.length} item{pendingPickup.length > 1 ? 's' : ''} confirmed. 
                Proceed to the athletic hub for physical acquisition.
              </p>
            </div>
            
            <button 
              onClick={() => {
                const el = document.getElementById('active-deployments');
                el?.scrollIntoView({ behavior: 'smooth' });
                el?.classList.add('ring-4', 'ring-emerald-500', 'ring-offset-4');
                setTimeout(() => el?.classList.remove('ring-4', 'ring-emerald-500', 'ring-offset-4'), 3000);
              }}
              className="px-10 py-5 bg-white text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl active:scale-[0.98] z-10"
            >
              Examine Claims
            </button>
          </div>
        </section>
      )}

      {pendingRentals.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Approval</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Awaiting administrative verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm border-dashed"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded uppercase tracking-wider">Awaiting Auth</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {format(rental.borrowedAt, 'MMM dd')}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-400 italic tracking-tight">{rental.equipmentName}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-blue-500" />
                    {format(rental.borrowedAt, 'HH:mm')} - {format(rental.expectedReturnAt, 'HH:mm')}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Purpose: {rental.purpose}</p>
                </div>

                <div className="mt-6 flex items-center gap-3 text-amber-600">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Syncing...</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="active-deployments" className="transition-all duration-500 rounded-[3rem]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Deployments</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time status monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRentals.length > 0 ? (
            activeRentals.map((rental, idx) => (
              <div
                key={rental.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">Active</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {format(rental.borrowedAt, 'MMM dd')}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{rental.equipmentName}</h3>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Borrowed On</span>
                    <span className="text-slate-900">{format(rental.borrowedAt, 'hh:mm aa')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Due Back</span>
                    <span className="text-blue-600 underline underline-offset-4">{format(rental.expectedReturnAt, 'hh:mm aa')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleReturn(rental)}
                  className="w-full mt-8 bg-slate-900 text-white text-sm font-bold py-3.5 px-4 rounded-2xl hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  Confirm Return
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 px-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active deployments detected</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Archived session data</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Sync</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Logout</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrity</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pastRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900">{rental.equipmentName}</td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-500">{format(rental.borrowedAt, 'MMM dd, yyyy')}</td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-500">
                      {rental.returnedAt ? format(rental.returnedAt, 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-500">{rental.conditionOnReturn || '-'}</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rental.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {rental.status === 'returned' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pastRentals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Archive Empty <br /> <span className="font-normal text-[10px] tracking-normal lowercase">no historical data found in secure repository</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {notifications.length > 0 && (
        <section className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Transmissions</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">System update logs</p>
              </div>
            </div>
            <Link to="/notifications" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 flex items-center gap-2 group">
              View All Logs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-slate-200' : 'bg-blue-500 animate-pulse'}`}></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{n.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-md">{n.message}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 font-mono">{format(n.createdAt, 'HH:mm')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyRentals;
