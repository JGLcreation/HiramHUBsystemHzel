import React, { useState, useEffect } from 'react';
import { getMyRentals } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Rental } from '../types';
import { Clock, Package, Calendar, ShieldAlert, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const PendingItems = () => {
  const [pendingRentals, setPendingRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      const unsubscribe = getMyRentals(profile.uid, (data) => {
        // Show pending, rejected, and recently approved items
        const filtered = data.filter(r => 
          r.status === 'PENDING AUTHORIZATION' || 
          r.status === 'REJECTED' || 
          r.status === 'APPROVED'
        );
        setPendingRentals(filtered.sort((a, b) => b.borrowedAt.getTime() - a.borrowedAt.getTime()));
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [profile]);

  if (loading) return null;

  const getStatusDisplay = (status: Rental['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 self-center md:self-start shadow-sm shadow-emerald-100">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
               <CheckCircle className="w-3.5 h-3.5 animate-bounce" />
               APPROVED
            </span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="px-4 py-2 bg-rose-50 rounded-full border border-rose-100 self-center md:self-start">
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
               <ShieldAlert className="w-3 h-3" />
               REJECTED
            </span>
          </div>
        );
      default:
        return (
          <div className="px-4 py-2 bg-amber-50 rounded-full border border-amber-100 self-center md:self-start">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
               WAITING FOR APPROVAL
            </span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Pending Authorization</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mt-2">Active Network Queues</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100">
          <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6">
        {pendingRentals.length > 0 ? (
          pendingRentals.map((rental) => (
          <div key={rental.id} className={`bg-white p-8 rounded-[2.5rem] border shadow-xl shadow-slate-100/50 flex flex-col md:flex-row gap-8 items-center ${
                rental.status === 'REJECTED' ? 'border-rose-100' : 
                rental.status === 'APPROVED' ? 'border-emerald-100' : 
                'border-slate-100'
              }`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${
                rental.status === 'REJECTED' ? 'bg-rose-50 border-rose-100' : 
                rental.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100' : 
                'bg-slate-50 border-slate-100'
              }`}>
                <Package className={`w-8 h-8 ${
                  rental.status === 'REJECTED' ? 'text-rose-400' : 
                  rental.status === 'APPROVED' ? 'text-emerald-400' : 
                  'text-slate-400'
                }`} />
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{rental.equipmentName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Asset ID: {rental.equipmentId.slice(0,8)}</p>
                  </div>
                  {getStatusDisplay(rental.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Date Requested
                    </div>
                    <div className="text-sm font-bold text-slate-700">{format(rental.borrowedAt, 'MMM dd, yyyy')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Time Slot
                    </div>
                    <div className="text-sm font-bold text-slate-700">{format(rental.borrowedAt, 'HH:mm')} - {format(rental.expectedReturnAt, 'HH:mm')}</div>
                  </div>
                </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                  <p className="text-xs text-slate-500 italic font-medium leading-relaxed">
                    {rental.status === 'PENDING AUTHORIZATION' && '"Your request is currently waiting for approval from the system administrator. Please monitor your nodes for authorization."'}
                    {rental.status === 'APPROVED' && '"Approved. The asset has been authorized for collection. Please proceed to the equipment terminal."'}
                    {rental.status === 'REJECTED' && '"Request declined by administration. Please review system notifications for specific rejection details."'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 italic tracking-tight">No Active Queues</h3>
            <p className="text-sm text-slate-400 font-medium mt-2">All your borrow sequences have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingItems;
