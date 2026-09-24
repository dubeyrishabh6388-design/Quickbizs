import { env } from "../config/env";
import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  User, 
  Send,
  Calendar,
  Layers,
  ArrowRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useBusiness } from "../context/BusinessContext";

export const Tasks: React.FC = () => {
  const { currentRole } = useBusiness();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Creation modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("System Tasks");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newRemarks, setNewRemarks] = useState("");

  // Details modal state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const fetchTasks = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const res = await fetch(`${env.apiUrl}/api/v1/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Failed to load tasks list:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time socket updates
  useEffect(() => {
    fetchTasks();

    const token = localStorage.getItem("qb_token");
    if (!token) return;

    let socket: any = null;
    try {
      const userStr = localStorage.getItem("qb_user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        socket = io(`${env.apiUrl}`, {
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          socket.emit("register", {
            businessId: user.businessId,
            userId: user.id || "dev-staff",
            role: currentRole,
          });
        });

        socket.on("notification:new", () => {
          fetchTasks();
        });
      }
    } catch (err) {
      console.error("Failed to wire socket listener in Tasks panel:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [currentRole]);

  // Statistics counters
  const pendingCount = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
  const criticalCount = tasks.filter(t => t.priority === "Critical" && t.status !== "Completed" && t.status !== "Approved").length;
  const todayCount = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const completedCount = tasks.filter(t => t.status === "Completed" || t.status === "Approved").length;
  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === "Completed" || t.status === "Approved") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          taskType: newType,
          priority: newPriority,
          dueDate: newDueDate || null,
          remarks: newRemarks || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsCreateOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewDueDate("");
        setNewRemarks("");
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleApprove = async (taskId: string, remarksText?: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const res = await fetch(`${env.apiUrl}/api/v1/tasks/${taskId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remarks: remarksText || "Approved" }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to approve task:", err);
    }
  };

  const handleReject = async (taskId: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const res = await fetch(`${env.apiUrl}/api/v1/tasks/${taskId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remarks: rejectionRemarks || "Rejected" }),
      });
      const json = await res.json();
      if (json.success) {
        setIsRejectOpen(false);
        setRejectionRemarks("");
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to reject task:", err);
    }
  };

  const handleAddComment = async (taskId: string) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const res = await fetch(`${env.apiUrl}/api/v1/tasks/${taskId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      const json = await res.json();
      if (json.success) {
        setCommentText("");
        // Reload details
        const detailsRes = await fetch(`${env.apiUrl}/api/v1/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) {
          const updatedTask = detailsJson.data.find((t: any) => t.id === taskId);
          setSelectedTask(updatedTask);
          setTasks(detailsJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Filter lists
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchesType = typeFilter === "All" || t.taskType === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "High":
        return "bg-brand-orange/10 text-brand-orange border border-brand-orange/20";
      case "Medium":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />;
      case "Rejected":
      case "Cancelled":
        return <XCircle className="h-4.5 w-4.5 text-rose-400" />;
      case "In Progress":
        return <Clock className="h-4.5 w-4.5 text-brand-orange animate-pulse" />;
      default:
        return <Clock className="h-4.5 w-4.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Task & Approvals Center
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tasks.length} Requests
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Reconcile expense requests, purchase orders, leave tickets, and inventory approval status
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Request
        </button>
      </div>

      {/* Stats Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</span>
          <span className="text-xl sm:text-2xl font-black text-brand-orange mt-1 tabular-nums">{pendingCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical</span>
          <span className="text-xl sm:text-2xl font-black text-rose-500 mt-1 tabular-nums">{criticalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Today</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{todayCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overdue</span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">{overdueCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{completedCount}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search approvals and tasks..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {/* Filters options */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Expense Approval">Expense Approval</option>
              <option value="Purchase Approval">Purchase Approval</option>
              <option value="Stock Adjustment">Stock Adjustment</option>
              <option value="Leave Request">Leave Request</option>
              <option value="System Tasks">System Tasks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid List */}
      <div className="space-y-3">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Auditing Task Ledger...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <CheckCircle2 className="h-10 w-10 text-slate-400" />
            <p className="text-xs font-bold">No pending tasks or approvals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex flex-col justify-between gap-4 group cursor-pointer relative ${
                  task.priority === "Critical" && task.status !== "Completed" && task.status !== "Approved"
                    ? "border-l-4 border-l-rose-500" 
                    : ""
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {getStatusIcon(task.status)}
                      <span className="capitalize">{task.status}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-brand-orange transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>{task.taskType}</span>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal Overlay */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl text-slate-900 dark:text-slate-200"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white">Create New Workflow Request</h3>
              <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Request Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Leave Request, Purchase Authorization"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-orange font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Description</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details about this approval request..."
                    className="w-full h-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-orange font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Request Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      <option value="Leave Request">Leave Request</option>
                      <option value="System Tasks">System Tasks</option>
                      <option value="Inventory Verification">Inventory Verification</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Urgency / Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-orange cursor-pointer font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Inspection Details Overlay Drawer */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg h-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 relative z-10 shadow-2xl flex flex-col text-slate-900 dark:text-slate-200 font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyle(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{selectedTask.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs font-semibold">
                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Description Details</span>
                  <p className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-slate-400 leading-relaxed font-medium">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Workflow Tracker (Multi-Stage Levels visual chain) */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Multi-Stage Approval State</span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center justify-around gap-2">
                    {selectedTask.approvals && selectedTask.approvals.length > 0 ? (
                      selectedTask.approvals.map((level: any, idx: number) => (
                        <React.Fragment key={level.id}>
                          {idx > 0 && <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold border ${
                              level.status === "Approved" 
                                ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                                : level.status === "Rejected"
                                  ? "bg-rose-950/40 border-rose-500 text-rose-450"
                                  : "bg-slate-850 border-slate-700 text-slate-400"
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{level.approverRole}</span>
                          </div>
                        </React.Fragment>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No approvals chain configured</span>
                    )}
                  </div>
                </div>

                {/* Approval History Logs */}
                {selectedTask.approvalHistory && selectedTask.approvalHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Audit Trail Log</span>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5">
                      {selectedTask.approvalHistory.map((hist: any) => (
                        <div key={hist.id} className="flex justify-between items-start gap-4 text-[11px] border-b border-slate-850/60 pb-2 last:border-b-0 last:pb-0 font-medium">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Level {hist.level} : {hist.approverEmail}</span>
                            <span className="text-slate-300 mt-1 block">{hist.remarks || "No comments"}</span>
                          </div>
                          <span className={`font-bold uppercase tracking-wider text-[9px] ${
                            hist.action === "Approved" ? "text-emerald-400" : "text-rose-400"
                          }`}>{hist.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedTask.status === "Pending" || selectedTask.status === "In Progress" ? (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Approval Actions</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsRejectOpen(true)}
                        className="flex-1 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 hover:border-rose-800 text-rose-400 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedTask.id)}
                        className="flex-1 py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/60 hover:border-emerald-800 text-emerald-400 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Approve / Advance
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Comments Section */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Discussion Thread</span>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {selectedTask.comments && selectedTask.comments.length > 0 ? (
                      selectedTask.comments.map((comm: any) => (
                        <div key={comm.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex gap-2 font-medium">
                          <User className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">{comm.userId}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{comm.comment}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[11px] block text-center">No discussion logs. Add a message below.</span>
                    )}
                  </div>

                  {/* Add Comment input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add comment to thread..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-brand-orange text-slate-200"
                    />
                    <button
                      onClick={() => handleAddComment(selectedTask.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-orange hover:text-orange-400 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Prompt Modal */}
      <AnimatePresence>
        {isRejectOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl text-slate-200"
            >
              <h3 className="text-sm font-bold text-white">Rejection Remarks</h3>
              <textarea
                required
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="State the reason for rejection..."
                className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-orange text-slate-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRejectOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedTask.id)}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
