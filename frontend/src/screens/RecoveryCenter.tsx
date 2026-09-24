import { env } from "../config/env";
import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  HandCoins, 
  TrendingUp, 
  Clock, 
  User, 
  Phone, 
  Send, 
  Link2, 
  CheckCircle, 
  Loader2, 
  Users, 
  Percent, 
  Plus
} from "lucide-react";

interface Reminder {
  id: string;
  reminderType: "Call" | "WhatsApp" | "PaymentLink" | "FollowUp" | "AddNote";
  status: string;
  sentAt: string;
  notes?: string;
}

interface CustomerInfo {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
}

interface RecoveryTask {
  id: string;
  amount: number;
  status: "Pending" | "InProgress" | "Recovered" | "Cancelled";
  priority: "Critical" | "High" | "Medium" | "Low";
  notes: string | null;
  createdAt: string;
  customer: CustomerInfo;
  reminders: Reminder[];
}

interface DashboardData {
  stats: {
    totalPendingAmount: number;
    uniqueCustomersCount: number;
    oldestAmount: number;
    oldestDaysAgo: number;
    highestCustomerName: string;
    highestAmount: number;
    recoveryPercentage: number;
  };
  analytics: {
    successRate: number;
    avgRecoveryTimeDays: number;
    monthlyCollection: number;
  };
  tasks: RecoveryTask[];
}

interface RecoveryCenterProps {
  setActiveScreen: (screen: any) => void;
}

export const RecoveryCenter: React.FC<RecoveryCenterProps> = ({ setActiveScreen }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${env.apiUrl}/api/v1/recovery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setData(json.data);
        // Default select first active task if none selected
        const activeTasks = (json.data.tasks as RecoveryTask[]).filter(
          (t) => t.status === "Pending" || t.status === "InProgress"
        );
        if (activeTasks.length > 0 && !selectedTaskId) {
          setSelectedTaskId(activeTasks[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load recovery dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAction = async (
    type: "Call" | "WhatsApp" | "PaymentLink" | "FollowUp" | "AddNote",
    customNotes?: string
  ) => {
    if (!selectedTaskId) return;
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const notesPayload = customNotes || actionNotes;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/recovery/tasks/${selectedTaskId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actionType: type,
          notes: notesPayload || `Performed ${type} follow-up.`,
        }),
      });
      const json = await response.json();
      if (json.success) {
        showToast(`${type} action logged successfully!`);
        setActionNotes("");
        fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to log recovery action:", err);
    }
  };

  const handleResolve = async () => {
    if (!selectedTaskId) return;
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    if (!window.confirm("Confirm full dues clearance payment? This will update the customer's ledger.")) {
      return;
    }

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/recovery/tasks/${selectedTaskId}/resolve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success) {
        showToast("Dues cleared and customer balance updated!");
        setSelectedTaskId(null);
        fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to resolve task:", err);
    }
  };

  const selectedTask = data?.tasks.find((t) => t.id === selectedTaskId);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400";
      case "High": return "bg-brand-orange/10 border border-brand-orange/20 text-brand-orange dark:bg-brand-orange/15 dark:border-brand-orange/30 dark:text-brand-orange";
      default: return "bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-55 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                QuickBizs Recovery Center
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Active Dues Recovery
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Automated payment reminders, overdue customer escalation, and credit collection tracking
            </p>
          </div>
        </div>

        <button 
          onClick={() => setActiveScreen("dashboard")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {isLoading && !data ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-orange animate-spin" />
          <span className="text-xs font-bold text-slate-400">Loading Recovery Dashboard...</span>
        </div>
      ) : !data ? (
        <div className="p-12 text-center text-xs text-slate-400">Failed to compile metrics.</div>
      ) : (
        <div className="space-y-6">
          
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Total Pending */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Total Outstanding</span>
              <span className="text-xl sm:text-2xl font-black text-rose-500 tabular-nums">₹{data.stats.totalPendingAmount.toLocaleString()}</span>
            </div>

            {/* Customers count */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Pending Customers</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 tabular-nums">
                <Users className="h-4.5 w-4.5 text-brand-orange" />
                {data.stats.uniqueCustomersCount} accounts
              </span>
            </div>

            {/* Oldest Pending */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Oldest Balance</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">₹{data.stats.oldestAmount.toLocaleString()}</span>
              {data.stats.oldestDaysAgo > 0 && (
                <span className="text-[10px] text-rose-500 font-bold block mt-1">Pending &gt; {data.stats.oldestDaysAgo} days</span>
              )}
            </div>

            {/* Highest Dues Customer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Top Debtor</span>
              <span className="text-sm font-black text-slate-900 dark:text-white truncate block">{data.stats.highestCustomerName}</span>
              <span className="text-[10px] text-slate-400 font-bold">Dues: ₹{data.stats.highestAmount.toLocaleString()}</span>
            </div>

            {/* Recovery Rate */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Recovery Rate</span>
              <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1">
                <Percent className="h-4.5 w-4.5 text-emerald-500" />
                {Math.round(data.stats.recoveryPercentage)}%
              </span>
            </div>
          </div>

          {/* Main Action Split Board */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: Active Tasks List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Outstanding Accounts</span>
                
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
                  {data.tasks.filter((t) => t.status === "Pending" || t.status === "InProgress").length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400 font-medium italic">
                      No active recovery actions pending. Dues ledger is clear!
                    </div>
                  ) : (
                    data.tasks
                      .filter((t) => t.status === "Pending" || t.status === "InProgress")
                      .map((task) => {
                        const isSelected = task.id === selectedTaskId;
                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`p-3 border rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isSelected 
                                ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-700 dark:border-slate-600" 
                                : "bg-slate-50 hover:bg-slate-100 border-slate-100 dark:bg-slate-900/30 dark:border-slate-700"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                              </span>
                              <h5 className="font-extrabold text-xs mt-1.5 truncate">
                                {task.customer.name}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                Mob: {task.customer.mobile}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black">₹{task.amount.toLocaleString()}</span>
                              <span className={`text-[9px] font-bold block mt-0.5 ${
                                task.status === "InProgress" ? "text-brand-orange" : "text-slate-400"
                              }`}>
                                {task.status === "InProgress" ? "Follow Up" : "New Task"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Detail Follow-Up Dashboard */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm min-h-[500px] flex flex-col justify-between">
              {!selectedTask ? (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400 italic text-xs text-center">
                  <User className="h-10 w-10 mb-2 text-slate-400" />
                  Select an active recovery account from the list to view profile and perform actions.
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Customer details card */}
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">
                        {selectedTask.customer.name}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-slate-400 dark:text-slate-400 font-bold">
                        <span>Mob: {selectedTask.customer.mobile}</span>
                        {selectedTask.customer.email && <span>Email: {selectedTask.customer.email}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400 block leading-tight">
                        ₹{selectedTask.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Amount</span>
                    </div>
                  </div>

                  {/* Actions Deck Grid */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Log Follow-Up Action</span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Call */}
                      <button
                        onClick={() => {
                          window.alert(`Simulating call connection to ${selectedTask.customer.mobile}...`);
                          handleAction("Call", "Called customer. Left message regarding outstanding payment.");
                        }}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Phone className="h-4.5 w-4.5 text-blue-500" />
                        Log Call
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => {
                          const messageText = `Hi ${selectedTask.customer.name}, this is a gentle reminder from Fresh Choice regarding outstanding dues of Rs. ${selectedTask.amount}. Please clear them soon.`;
                          window.open(`https://api.whatsapp.com/send?phone=${selectedTask.customer.mobile}&text=${encodeURIComponent(messageText)}`, "_blank");
                          handleAction("WhatsApp", "Sent reminder message on WhatsApp.");
                        }}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Send className="h-4.5 w-4.5 text-emerald-500" />
                        WhatsApp
                      </button>

                      {/* Payment Link */}
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/pay/${selectedTask.id}`;
                          navigator.clipboard.writeText(link);
                          showToast("Payment link copied to clipboard!");
                          handleAction("PaymentLink", `Created payment link: ${link}`);
                        }}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Link2 className="h-4.5 w-4.5 text-brand-orange" />
                        Copy Link
                      </button>

                      {/* Settle Clear Dues */}
                      <button
                        onClick={handleResolve}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        Settle Dues
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Note block */}
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add custom follow-up notes here..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-brand-orange font-medium resize-none h-16 text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={() => handleAction("AddNote")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Note Record
                    </button>
                  </div>

                  {/* Reminder logs chronological history list */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Follow-Up History Log</span>
                    
                    <div className="max-h-40 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                      {selectedTask.reminders.length === 0 ? (
                        <div className="text-center py-4 text-[10px] text-slate-400 italic">No historical actions logged for this task yet.</div>
                      ) : (
                        selectedTask.reminders.map((rem) => {
                          const formattedDate = new Date(rem.sentAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          });

                          return (
                            <div key={rem.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-700 rounded-xl flex items-start gap-3">
                              <span className="text-[9px] font-black text-slate-400 shrink-0 mt-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                                {rem.reminderType}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-normal">
                                  {rem.notes}
                                </p>
                                <span className="text-[8px] text-slate-400 font-bold block mt-1">
                                  Logged: {formattedDate}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row Analytics Dashboard */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl shadow-sm space-y-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Recovery Performance Analytics</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* success rate */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Success Rate</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{Math.round(data.analytics.successRate)}% tasks resolved</span>
                </div>
              </div>

              {/* avg recovery days */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Avg Recovery Time</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {data.analytics.avgRecoveryTimeDays.toFixed(1)} days to settle
                  </span>
                </div>
              </div>

              {/* monthly recovery collections */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                  <HandCoins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Monthly Collection</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{data.analytics.monthlyCollection.toLocaleString()} collected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
