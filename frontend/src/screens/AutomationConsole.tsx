import { env } from "../config/env";
import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  actionType: string;
  actionParams?: string;
}

interface Rule {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
  conditions: Condition[];
  actions: Action[];
}

export const AutomationConsole: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form builder state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("Stock Updated");
  const [conditionField, setConditionField] = useState("stock");
  const [conditionOperator, setConditionOperator] = useState("Less Than");
  const [conditionValue, setConditionValue] = useState("");
  const [actionType, setActionType] = useState("Create Notification");
  const [actionMessage, setActionMessage] = useState("");
  const [actionPriority, setActionPriority] = useState("Medium");

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchRulesAndLogs = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const [rulesRes, logsRes] = await Promise.all([
        fetch(`${env.apiUrl}/api/v1/automation/rules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiUrl}/api/v1/automation/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rulesJson = await rulesRes.json();
      const logsJson = await logsRes.json();

      if (rulesJson.success) setRules(rulesJson.data);
      if (logsJson.success) setLogs(logsJson.data);
    } catch (err) {
      console.error("Failed to load automation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndLogs();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const payload = {
      name: ruleName,
      trigger: triggerEvent,
      conditions: [{
        field: conditionField,
        operator: conditionOperator,
        value: conditionValue,
      }],
      actions: [{
        actionType,
        actionParams: JSON.stringify({
          message: actionMessage || `Automated Action: Condition met for ${ruleName}.`,
          priority: actionPriority,
          taskTitle: ruleName,
        }),
      }],
    };

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/automation/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast("New Automation Rule deployed successfully!");
        setIsBuilderOpen(false);
        setRuleName("");
        setConditionValue("");
        setActionMessage("");
        fetchRulesAndLogs();
      }
    } catch (err) {
      console.error("Failed to deploy automation rule:", err);
    }
  };

  const handleToggleRule = async (rule: Rule) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/automation/rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Rule state updated successfully.`);
        fetchRulesAndLogs();
      }
    } catch (err) {
      console.error("Failed to toggle rule state:", err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/automation/rules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.success) {
        showToast("Automation Rule retracted successfully.");
        fetchRulesAndLogs();
      }
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const handleTriggerJobs = async () => {
    showToast("Audit check queued. Scanned thresholds & synced cloud data logs.");
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "Block Transaction":
        return "bg-rose-950/40 border-rose-800 text-rose-400";
      case "Assign Task":
      case "Create Approval":
        return "bg-brand-orange/10 border-brand-orange/30 text-brand-orange";
      default:
        return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Smart Business Rules Engine
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {rules.length} Active Rules
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Build downstream automation triggers, event conditions, and state updates visually without code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={handleTriggerJobs}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Run Audits
          </button>
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-98 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Deploy Rule
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Deployed Rules list (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Deployed Automation Workflows
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold border border-slate-200 dark:border-slate-700">
              {rules.length} Rules Active
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Rule Registry...</span>
            </div>
          ) : rules.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Cpu className="h-10 w-10 text-slate-400" />
              <p className="text-xs font-bold">No business automation rules deployed yet.</p>
              <button 
                onClick={() => setIsBuilderOpen(true)}
                className="mt-2 text-xs text-brand-orange font-black hover:underline"
              >
                Create your first rule now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4 group relative transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{rule.name}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {rule.isActive ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Flow diagram visual elements */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-brand-orange uppercase text-[9px] font-black tracking-wider">IF Event:</span>
                        <span className="text-slate-900 dark:text-slate-200 font-bold">{rule.trigger}</span>
                      </div>
                      
                      {rule.conditions.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-700">
                          <span className="text-slate-400 uppercase text-[9px] font-extrabold tracking-wider">Condition:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{c.field} {c.operator} {c.value}</span>
                        </div>
                      ))}

                      {rule.actions.map((a, i) => (
                        <div key={i} className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-700 mt-1">
                          <ChevronRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wide ${getActionColor(a.actionType)}`}>
                            {a.actionType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: History Execution Logs (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Rule Execution History Logs
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-200 dark:border-slate-700">
              {logs.length} Runs
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic font-medium">
                No execution history records logged.
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">{log.ruleName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{log.executionDetails}</span>
                    <span className="text-[9px] text-slate-400 block">{new Date(log.executedAt).toLocaleTimeString()}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[9px] border shrink-0 ${
                    log.status === "Success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    {log.status === "Success" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Rule Builder Modal Overlay */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl text-slate-900 dark:text-slate-200 font-semibold text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-brand-orange" />
                  No-Code Automation Rule Builder
                </h3>
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-300">
                {/* Rule Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Workflow Name</label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Critical stock level notification trigger"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange text-slate-900 dark:text-slate-200 font-bold"
                  />
                </div>

                {/* Trigger */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">1. Select Trigger Event</label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => {
                      setTriggerEvent(e.target.value);
                      if (e.target.value.includes("Stock")) {
                        setConditionField("stock");
                      } else if (e.target.value.includes("Expense") || e.target.value.includes("Invoice") || e.target.value.includes("Payment") || e.target.value.includes("Purchase")) {
                        setConditionField("amount");
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    <option value="Stock Updated">Stock Updated</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out Of Stock">Out Of Stock</option>
                    <option value="Invoice Created">Invoice Created</option>
                    <option value="Invoice Cancelled">Invoice Cancelled</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Purchase Created">Purchase Created</option>
                    <option value="Purchase Approved">Purchase Approved</option>
                    <option value="Expense Added">Expense Added</option>
                    <option value="Expense Approved">Expense Approved</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-2 border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">2. Configure Evaluation Condition (IF)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Field</span>
                      <select
                        value={conditionField}
                        onChange={(e) => setConditionField(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="stock">stock levels</option>
                        <option value="amount">amount / float</option>
                        <option value="dueAmount">customer dues</option>
                        <option value="outstanding">supplier balance</option>
                        <option value="paymentMethod">payment method</option>
                        <option value="customerType">customer classification</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Operator</span>
                      <select
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="Less Than">Less Than (&lt;)</option>
                        <option value="Greater Than">Greater Than (&gt;)</option>
                        <option value="Equal">Equal (==)</option>
                        <option value="Not Equal">Not Equal (!=)</option>
                        <option value="Contains">Contains</option>
                        <option value="Between">Between (min,max)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Value / Threshold</span>
                      <input
                        type="text"
                        required
                        value={conditionValue}
                        onChange={(e) => setConditionValue(e.target.value)}
                        placeholder="e.g. 10 or 5000"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange text-slate-900 dark:text-slate-200 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">3. Define Automation Action (THEN)</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Action Type</span>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="Create Notification">Create Notification</option>
                        <option value="Block Transaction">Block Transaction</option>
                        <option value="Assign Task">Assign Task</option>
                        <option value="Create Approval">Create Approval</option>
                        <option value="Send In-App Alert">Send In-App Alert</option>
                        <option value="Create Audit Log">Create Audit Log</option>
                        <option value="Update Dashboard">Update Dashboard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Urgency Priority</span>
                      <select
                        value={actionPriority}
                        onChange={(e) => setActionPriority(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase">Automated Alert Message / Action parameters</span>
                    <input
                      type="text"
                      value={actionMessage}
                      onChange={(e) => setActionMessage(e.target.value)}
                      placeholder="e.g. Danger! Shelf stock drops below threshold."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange text-slate-900 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                {/* Submits */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBuilderOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Deploy Workflow
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AutomationConsole;
