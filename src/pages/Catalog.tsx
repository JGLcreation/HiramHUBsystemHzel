import React, { useState, useEffect } from 'react';
import { getEquipment, borrowEquipment, seedEquipment, getMyRentals } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Equipment } from '../types';
import { Search, Filter, Box, CheckCircle2, AlertTriangle, ArrowRight, Database, Calendar, Clock, User, Info, X, Package, ShieldCheck } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingUserRentals, setPendingUserRentals] = useState<Rental[]>([]);

  useEffect(() => {
    if (profile) {
      const unsubscribe = getMyRentals(profile.uid, setPendingUserRentals);
      return () => unsubscribe();
    }
  }, [profile]);

  // Form State
  const [borrowDate, setBorrowDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [borrowTime, setBorrowTime] = useState(format(new Date(), 'HH:mm'));
  const [returnTime, setReturnTime] = useState(format(addHours(new Date(), 2), 'HH:mm'));
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessWarning, setShowSuccessWarning] = useState(false);
  const [submittedItemName, setSubmittedItemName] = useState('');

  useEffect(() => {
    const unsubscribe = getEquipment((data) => {
      setEquipment(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedEquipment();
      alert("Inventory successfully seeded with 20 items!");
    } catch (error) {
      console.error(error);
      alert("Failed to seed inventory.");
    } finally {
      setSeeding(false);
    }
  };

  const categories = ['All', ...new Set(equipment.map(e => e.category))];

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openBorrowModal = (item: Equipment) => {
    if (!profile) {
      alert("Please log in to borrow equipment.");
      return;
    }
    setSelectedItem(item);
    setIsBorrowModalOpen(true);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showSuccessWarning) {
      timeout = setTimeout(() => {
        closeBorrowModal();
      }, 4000); // Wait 4 seconds for user to read before auto-navigating
    }
    return () => clearTimeout(timeout);
  }, [showSuccessWarning]);

  const closeBorrowModal = () => {
    setIsBorrowModalOpen(false);
    setSelectedItem(null);
    setPurpose('');
    setShowSuccessWarning(false);
    if (showSuccessWarning) {
      navigate('/pending');
    }
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedItem) return;

    setIsSubmitting(true);
    try {
      // Artificial delay for better UX "processing" feel
      await new Promise(resolve => setTimeout(resolve, 1800));

      const borrowTimestamp = new Date(`${borrowDate}T${borrowTime}`);
      const returnTimestamp = new Date(`${borrowDate}T${returnTime}`);

      if (returnTimestamp <= borrowTimestamp) {
        alert("Return time must be after borrow time.");
        setIsSubmitting(false);
        return;
      }

      await borrowEquipment(
        profile.uid,
        profile.displayName,
        selectedItem.id,
        selectedItem.name,
        borrowTimestamp,
        returnTimestamp,
        purpose || 'General Use'
      );

      setSubmittedItemName(selectedItem.name);
      setShowSuccessWarning(true);
      // alert(`Your request for ${selectedItem.name} has been submitted for approval.`);
      // closeBorrowModal();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Equipment Catalog</h1>
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Real-time Inventory Access</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter assets..."
              className="pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              {/* Image Header */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Box className="w-12 h-12 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                    item.availableQuantity > 0 
                      ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50/80 text-rose-600 border-rose-100'
                  }`}>
                    {item.availableQuantity} / {item.totalQuantity} Units
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[9px] font-black text-blue-600 uppercase tracking-widest border border-blue-50">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{item.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Status: <span className="text-slate-900">{item.condition}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[32px]">{item.description}</p>
                </div>

                <button
                  onClick={() => openBorrowModal(item)}
                  disabled={item.availableQuantity <= 0 || pendingUserRentals.some(r => r.equipmentId === item.id && (r.status === 'PENDING AUTHORIZATION' || r.status === 'APPROVED'))}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 px-4 rounded-xl hover:bg-blue-600 shadow-lg shadow-slate-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  {pendingUserRentals.some(r => r.equipmentId === item.id && (r.status === 'PENDING AUTHORIZATION' || r.status === 'APPROVED')) 
                    ? 'Request Pending' 
                    : 'Initiate Borrow Sequence'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No equipment found</h3>
            <p className="text-gray-500 mb-8">Try adjusting your search or filters.</p>
            
            {isAdmin && equipment.length === 0 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest shadow-xl"
              >
                <Database className="w-4 h-4" />
                {seeding ? "Initialising Protocol..." : "Seed Core Inventory"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      {isBorrowModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-5/12 bg-slate-50 p-8 flex flex-col justify-between border-r border-slate-100">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic">{selectedItem.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{selectedItem.category}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Available: {selectedItem.availableQuantity} units
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Status: {selectedItem.condition}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 mt-8">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Institutional Notice</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">All equipment must be returned on the agreed timestamp. Late returns affect institutional credit.</p>
              </div>
            </div>

            <div className="md:w-7/12 p-8 lg:p-10 relative">
              <button 
                onClick={closeBorrowModal}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {showSuccessWarning ? (
                <motion.div 
                  initial="initial"
                  animate="animate"
                  variants={{
                    animate: { transition: { staggerChildren: 0.1 } }
                  }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-8 py-4"
                >
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, scale: 0.5 },
                      animate: { opacity: 1, scale: 1 }
                    }}
                    className="relative"
                  >
                    <div className="w-24 h-24 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center relative z-10 border border-amber-500/20">
                      <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
                    </div>
                    <div className="absolute -inset-6 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
                  </motion.div>

                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 }
                    }}
                    className="space-y-3"
                  >
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Authorization Requested</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">Pending Network Validation</p>
                  </motion.div>

                  <motion.div 
                    variants={{
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 }
                    }}
                    className="w-full bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 space-y-6 relative overflow-hidden shadow-2xl shadow-slate-200"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <ShieldCheck className="w-24 h-24 text-white" />
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Primary Asset</div>
                        <h3 className="text-2xl font-black text-white italic tracking-tight">{submittedItemName}</h3>
                      </div>
                      
                      {selectedItem && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                          <div className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-2">Item Specifications</div>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed line-clamp-3 italic">
                            "{selectedItem.description}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 px-2">
                       <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                          <span>Transmission Status</span>
                          <span className="text-amber-500 uppercase">Waiting for Approval</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-amber-500"
                          />
                       </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold leading-relaxed px-4 pt-2 border-t border-white/5 italic">
                      "Authentication complete. Your borrow sequence is registered. Please wait for the athletic administrator to confirm your request."
                    </div>
                  </motion.div>

                  <motion.button 
                    variants={{
                      initial: { opacity: 0 },
                      animate: { opacity: 1 }
                    }}
                    onClick={closeBorrowModal}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Return to Terminal
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Borrow Request</h2>

                  <form onSubmit={handleBorrowSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Preferred Date
                      </label>
                      <input 
                        type="date"
                        required
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-sm font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Time Start
                        </label>
                        <input 
                          type="time"
                          required
                          value={borrowTime}
                          onChange={(e) => setBorrowTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Expected End
                        </label>
                        <input 
                          type="time"
                          required
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Purpose of Use
                      </label>
                      <textarea 
                        placeholder="e.g. Intramural Practice, Tournament Training"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-sm font-medium resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] mt-4 ${
                        isSubmitting 
                          ? 'bg-amber-500 text-white shadow-amber-500/20' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                          In Transit...
                        </div>
                      ) : 'Authorize Transaction'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
