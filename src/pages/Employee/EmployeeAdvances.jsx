import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FaPlus, FaSearch, FaEye, FaArrowLeft, FaMoneyBillWave, 
  FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaTimes, 
  FaFileInvoiceDollar, FaUser, FaChevronLeft, FaChevronRight,
  FaHandHoldingUsd, FaSave, FaBan, FaCheck 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import SkeletonLoader from "../../components/SkeletonLoader"; 
import TableControls from "../../components/TableControls"; 
import useEmployeeAdvance from "../../Hook/useEmployeeAdvance";
import useEmployeeAdvanceRepayment from "../../Hook/useEmployeeAdvanceRepayment";
import { useEmployee } from "../../Hook/useEmployee"; 

const EmployeeAdvances = () => {
  // --- Hooks ---
  const { 
    getPaginatedAdvances, 
    createAdvance, 
    updateAdvance, // <--- 1. IMPORTED THIS FROM YOUR HOOK
    loading: loadingAdvances 
  } = useEmployeeAdvance();

  const { 
    getPaginatedRepayments, 
    updateRepayment, 
    loading: loadingRepayments 
  } = useEmployeeAdvanceRepayment();

  const { getDirectoryEmployees } = useEmployee();

  // --- State: View Management ---
  const [view, setView] = useState("list"); 
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false); 

  // --- State: List Data ---
  const [advances, setAdvances] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // --- State: Detail Data ---
  const [repayments, setRepayments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null); 

  // --- State: Form Data ---
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: "",
    amount: "",
    repaymentMonths: 1,
    reason: "",
    advanceDate: new Date().toISOString().split('T')[0]
  });

  const [repaymentFormData, setRepaymentFormData] = useState({ 
    paidAmount: "",
    paymentDate: new Date().toISOString().split('T')[0]
  });

  // --- Stats ---
  const stats = useMemo(() => {
    return {
      total: pagination.totalItems,
      pending: advances.filter(a => a.status === 'Pending').length,
      approved: advances.filter(a => a.status === 'Approved').length,
      outstanding: advances.reduce((acc, curr) => acc + (curr.amount || 0), 0) 
    };
  }, [advances, pagination.totalItems]);

  // ==========================================
  // 1. DATA FETCHING
  // ==========================================
  const fetchAdvances = useCallback(async () => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
      };
      
      const response = await getPaginatedAdvances(params);
      
      if (response) {
        setAdvances(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0
        }));
      }
    } catch (error) {
      toast.error("Failed to load advances");
    }
  }, [getPaginatedAdvances, pagination.currentPage, pagination.itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const fetchRepaymentsForAdvance = useCallback(async (advance) => {
    try {
      const response = await getPaginatedRepayments({
        employee: advance.employee._id,
        limit: 50 
      });

      if (response && response.data) {
        const relatedRepayments = response.data.filter(
            r => r.employeeAdvance?._id === advance._id || r.employeeAdvance === advance._id
        );
        setRepayments(relatedRepayments);
      }
    } catch (error) {
      toast.error("Could not load repayment schedule");
    }
  }, [getPaginatedRepayments]);

  // ==========================================
  // 2. HANDLERS
  // ==========================================
  
  // --- Status Change Handler (NEW) ---
  const handleStatusChange = async (id, newStatus) => {
    // Confirmation Dialog
    const result = await Swal.fire({
      title: `Mark as ${newStatus}?`,
      text: `Are you sure you want to ${newStatus.toLowerCase()} this advance request?`,
      icon: newStatus === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Approved' ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, ${newStatus} it!`
    });

    if (result.isConfirmed) {
      try {
        // Call the updateAdvance from your hook
        await updateAdvance(id, { status: newStatus });
        
        Swal.fire(
          'Updated!',
          `Request has been ${newStatus.toLowerCase()}.`,
          'success'
        );
        
        // Refresh the list to show new status
        fetchAdvances();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update status");
      }
    }
  };

  const handleViewDetails = (advance) => {
    setSelectedAdvance(advance);
    setRepayments([]); 
    fetchRepaymentsForAdvance(advance);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedAdvance(null);
  };

  // --- Advance Creation Handlers ---
  const handleOpenCreateModal = async () => {
    try {
      const empData = await getDirectoryEmployees();
      setEmployees(empData || []);
      setFormData({
        employee: "",
        amount: "",
        repaymentMonths: 1,
        reason: "",
        advanceDate: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Could not load employee list");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) return toast.error("Please select an employee");

    try {
      await createAdvance({
        ...formData,
        status: "Pending" 
      });
      toast.success("Advance request created successfully");
      setIsModalOpen(false);
      fetchAdvances();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create request");
    }
  };

  // --- Repayment Collection Handlers ---
  const handleOpenRepaymentModal = (installment) => {
    setSelectedInstallment(installment);
    setRepaymentFormData({
        paidAmount: installment.installmentAmount, 
        paymentDate: new Date().toISOString().split('T')[0]
    });
    setIsRepaymentModalOpen(true);
  };

  const handleSubmitRepayment = async (e) => {
    e.preventDefault();
    if (!selectedInstallment) return;

    try {
        await updateRepayment(selectedInstallment._id, {
            paidAmount: repaymentFormData.paidAmount,
            paymentDate: repaymentFormData.paymentDate,
            status: "Paid"
        });
        
        toast.success("Repayment collected successfully");
        setIsRepaymentModalOpen(false);
        fetchRepaymentsForAdvance(selectedAdvance);
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  // ==========================================
  // RENDER: LIST VIEW
  // ==========================================
  const renderListView = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={stats.total} icon={<FaFileInvoiceDollar />} color="text-gray-600" />
        <StatCard title="Pending" value={stats.pending} icon={<FaHourglassHalf />} color="text-warning" />
        <StatCard title="Advance approved" value={stats.approved} sub="successfully" icon={<FaCheckCircle />} color="text-success" />
        <StatCard title="Outstanding Amount" value={`৳${stats.outstanding.toFixed(2)}`} icon={<FaMoneyBillWave />} color="text-primary" />
      </div>

      {/* Controls */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700">
        <div className="p-4 border-b border-base-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Employee name, code..." 
              className="input input-bordered w-full pl-10 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="select select-bordered dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-50 dark:bg-gray-700/50 uppercase text-xs font-bold text-gray-500 dark:text-gray-300">
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Repayment Months</th>
                <th>Status</th>
                <th>Requested On</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingAdvances ? (
                <tr><td colSpan="6"><SkeletonLoader /></td></tr>
              ) : advances.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No advance records found.</td></tr>
              ) : (
                advances.map((adv) => (
                  <tr key={adv._id} className="hover:bg-base-50 dark:hover:bg-gray-700/30 transition-colors border-b dark:border-gray-700">
                    <td>
                      <div className="font-bold text-secondary dark:text-white">
                        {adv.employee?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400">{adv.employee?.employeeId}</div>
                    </td>
                    <td className="font-mono font-bold text-secondary dark:text-gray-200">
                      ৳{adv.amount?.toFixed(2)}
                    </td>
                    <td className="text-sm">{adv.repaymentMonths} Months</td>
                    <td><StatusBadge status={adv.status} /></td>
                    <td className="text-sm text-gray-500">
                      {new Date(adv.advanceDate).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* --- VIEW BUTTON --- */}
                        <button 
                          onClick={() => handleViewDetails(adv)}
                          className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                          title="View Details"
                        >
                          <FaEye />
                        </button>

                        {/* --- NEW ACTION BUTTONS (Only for Pending) --- */}
                        {adv.status === 'Pending' && (
                          <>
                             <div className="divider divider-horizontal m-0 h-4"></div>
                             <button 
                                onClick={() => handleStatusChange(adv._id, 'Approved')}
                                className="btn btn-sm btn-circle btn-success btn-outline hover:text-white"
                                title="Approve Request"
                             >
                                <FaCheck />
                             </button>
                             <button 
                                onClick={() => handleStatusChange(adv._id, 'Rejected')}
                                className="btn btn-sm btn-circle btn-error btn-outline hover:text-white"
                                title="Reject Request"
                             >
                                <FaTimes />
                             </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-base-200 dark:border-gray-700 flex justify-end">
             <div className="join">
                <button 
                  className="join-item btn btn-sm" 
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                >
                  <FaChevronLeft/>
                </button>
                <button className="join-item btn btn-sm bg-base-100 pointer-events-none">
                  Page {pagination.currentPage}
                </button>
                <button 
                  className="join-item btn btn-sm" 
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                >
                  <FaChevronRight/>
                </button>
             </div>
        </div>
      </div>
    </>
  );

  // ==========================================
  // RENDER: DETAIL VIEW
  // ==========================================
  const renderDetailView = () => {
    if (!selectedAdvance) return null;

    const monthlyInstallment = selectedAdvance.amount / selectedAdvance.repaymentMonths;
    const totalRepaid = repayments
        .filter(r => r.status === 'Paid')
        .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    
    const progress = Math.min((totalRepaid / selectedAdvance.amount) * 100, 100);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={handleBackToList} className="btn btn-square btn-ghost btn-sm dark:text-white">
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-secondary dark:text-white flex items-center gap-3">
              Advance Request #{selectedAdvance._id.slice(-6).toUpperCase()}
              <StatusBadge status={selectedAdvance.status} />
            </h2>
            <p className="text-gray-500 text-sm">
                {selectedAdvance.employee?.name} • {selectedAdvance.employee?.employeeId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Advance Details */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-base-200 dark:border-gray-700 p-6 h-fit">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs mb-4 tracking-wider">
                Advance Details
            </h3>
            
            <div className="mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</div>
                <div className="text-4xl font-black text-secondary dark:text-white">
                    ৳{selectedAdvance.amount.toFixed(2)}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 py-4 border-y border-dashed border-base-300 dark:border-gray-700">
                <div>
                    <div className="text-xs text-gray-400 mb-1">Repayment Months</div>
                    <div className="font-bold dark:text-gray-200">{selectedAdvance.repaymentMonths} Months</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Monthly Installment</div>
                    <div className="font-bold dark:text-gray-200">৳{monthlyInstallment.toFixed(2)}</div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Repayment Progress</span>
                    <span className="font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <progress className="progress progress-primary w-full h-2" value={progress} max="100"></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-400">
                    <span>Total Repaid: ৳{totalRepaid.toFixed(2)}</span>
                    <span>Remaining: ৳{(selectedAdvance.amount - totalRepaid).toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Request Date</span>
                    <span className="font-medium dark:text-gray-300">
                        {new Date(selectedAdvance.advanceDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
          </div>

          {/* Right Panel: Repayment Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-base-200 dark:border-gray-700 flex flex-col">
             <div className="p-6 border-b border-base-200 dark:border-gray-700 flex justify-between items-center">
                 <h3 className="font-bold text-secondary dark:text-white">Repayment Schedule</h3>
                 <span className="badge badge-ghost text-xs">{selectedAdvance.repaymentMonths} Months</span>
             </div>
             
             <div className="flex-1 overflow-x-auto p-2">
                <table className="table w-full">
                    <thead className="text-xs text-gray-400 bg-base-50 dark:bg-gray-700/30">
                        <tr>
                            <th>Month</th>
                            <th>Installment Amount</th>
                            <th>Status</th>
                            <th>Deducted On</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingRepayments ? (
                             <tr><td colSpan="5"><SkeletonLoader count={3}/></td></tr>
                        ) : repayments.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-6 text-gray-400">No repayment schedule generated yet.</td></tr>
                        ) : (
                            repayments.map((rep) => (
                                <tr key={rep._id} className="border-b dark:border-gray-700 hover:bg-base-50 dark:hover:bg-gray-700/30">
                                    <td className="font-mono text-xs dark:text-gray-300">
                                        {new Date(rep.dueDate).toLocaleDateString("en-CA", { year: 'numeric', month: '2-digit' })}
                                    </td>
                                    <td className="font-bold text-secondary dark:text-gray-200">
                                        ৳{rep.installmentAmount.toFixed(2)}
                                    </td>
                                    <td>
                                        <RepaymentStatusBadge status={rep.status} />
                                    </td>
                                    <td className="text-xs text-gray-400">
                                        {rep.paymentDate ? new Date(rep.paymentDate).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="text-right">
                                        {rep.status !== 'Paid' && (
                                            <button 
                                                onClick={() => handleOpenRepaymentModal(rep)}
                                                className="btn btn-xs btn-primary btn-outline gap-1"
                                                title="Collect Repayment"
                                            >
                                                <FaHandHoldingUsd /> Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: MAIN COMPONENT
  // ==========================================
  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300 font-sans">
      
      {/* Page Header */}
      {view === 'list' && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
          <div>
            <h1 className="text-2xl font-black text-secondary dark:text-white flex items-center gap-2">
              <FaMoneyBillWave className="text-primary" /> Employee Advances
            </h1>
            <p className="text-neutral-500 dark:text-gray-400 font-medium text-sm">
              Manage employee advance requests and deductions
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="btn btn-primary text-white shadow-lg hover:scale-105 transition-transform gap-2"
          >
            <FaPlus /> Request Advance
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {view === 'list' ? renderListView() : renderDetailView()}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
                    <h3 className="font-black text-xl text-secondary dark:text-white flex items-center gap-2">
                        <FaPlus className="text-primary"/> New Advance Request
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm">
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control md:col-span-2">
                            <label className="label-text font-bold mb-1 dark:text-gray-300">Employee *</label>
                            <select 
                                required
                                className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.employee}
                                onChange={e => setFormData({...formData, employee: e.target.value})}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label-text font-bold mb-1 dark:text-gray-300">Amount (৳) *</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label-text font-bold mb-1 dark:text-gray-300">Repayment (Months) *</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                max="24"
                                className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.repaymentMonths}
                                onChange={e => setFormData({...formData, repaymentMonths: parseInt(e.target.value)})}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label-text font-bold mb-1 dark:text-gray-300">Date *</label>
                            <input 
                                type="date" 
                                required
                                className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.advanceDate}
                                onChange={e => setFormData({...formData, advanceDate: e.target.value})}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label-text font-bold mb-1 dark:text-gray-300">Reason</label>
                            <textarea 
                                className="textarea textarea-bordered h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                placeholder="Describe the reason for the advance..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 border-t dark:border-gray-700 pt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary text-white px-8">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Collect Repayment Modal */}
      {isRepaymentModalOpen && selectedInstallment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border-t-8 border-success">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
                    <h3 className="font-black text-xl text-secondary dark:text-white flex items-center gap-2">
                        <FaHandHoldingUsd className="text-success"/> Collect Repayment
                    </h3>
                    <button onClick={() => setIsRepaymentModalOpen(false)} className="btn btn-circle btn-ghost btn-sm">
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmitRepayment} className="p-6">
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                        Recording payment for installment: 
                        <span className="font-bold text-secondary dark:text-white ml-1">
                            {new Date(selectedInstallment.dueDate).toLocaleDateString("en-CA", { year: 'numeric', month: '2-digit' })}
                        </span>
                    </p>

                    <div className="form-control mb-4">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Amount Received (৳)</label>
                        <input 
                            type="number" 
                            required
                            className="input input-bordered w-full font-bold text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={repaymentFormData.paidAmount}
                            onChange={e => setRepaymentFormData({...repaymentFormData, paidAmount: parseFloat(e.target.value)})}
                        />
                    </div>

                    <div className="form-control mb-6">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Payment Date</label>
                        <input 
                            type="date" 
                            required
                            className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={repaymentFormData.paymentDate}
                            onChange={e => setRepaymentFormData({...repaymentFormData, paymentDate: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsRepaymentModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-success text-white px-6">
                           <FaCheckCircle /> Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ title, value, icon, sub, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-base-100 dark:border-gray-700 flex flex-col justify-between h-28">
    <div className="flex items-start justify-between">
       <span className="text-4xl font-black text-secondary dark:text-white">{value}</span>
       <div className={`text-2xl opacity-80 ${color}`}>{icon}</div>
    </div>
    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
      {title} {sub && <div className="text-xs font-normal opacity-70">{sub}</div>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
    let classes = "";
    switch(status) {
        case 'Approved': classes = "bg-green-100 text-green-700 border-green-200"; break;
        case 'Pending': classes = "bg-orange-100 text-orange-700 border-orange-200"; break;
        case 'Rejected': classes = "bg-red-100 text-red-700 border-red-200"; break;
        default: classes = "bg-gray-100 text-gray-700 border-gray-200";
    }
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classes} flex items-center gap-1 w-fit`}>
            {status === 'Approved' && <FaCheckCircle/>}
            {status}
        </span>
    );
};

const RepaymentStatusBadge = ({ status }) => {
    if (status === 'Pending') {
        return <span className="badge badge-warning badge-outline gap-1 text-xs font-bold bg-yellow-50"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> Pending</span>;
    }
    if (status === 'Paid') {
        return <span className="badge badge-success badge-outline gap-1 text-xs font-bold bg-green-50"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Paid</span>;
    }
    return <span className="badge badge-ghost badge-outline text-xs">{status}</span>;
}

export default EmployeeAdvances;