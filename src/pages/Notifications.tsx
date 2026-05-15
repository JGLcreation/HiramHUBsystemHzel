import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Bell, CheckCircle, XCircle, Clock, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = getNotifications(profile.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejection': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'return': return <Check className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Notifications</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Latest Protocol Updates</p>
        </div>
        <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`group bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-slate-100 flex gap-6 items-start ${
                notification.isRead ? 'border-slate-100 opacity-60' : 'border-blue-100 shadow-md shadow-blue-50/50 ring-1 ring-blue-50'
              }`}
            >
              <div className={`p-4 rounded-2xl shrink-0 ${
                notification.isRead ? 'bg-slate-50' : 'bg-blue-50'
              }`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">{notification.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {format(notification.createdAt, 'MMM dd, HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{notification.message}</p>
                
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="mt-4 px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-serif italic text-lg tracking-tight">No incoming transmissions recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
