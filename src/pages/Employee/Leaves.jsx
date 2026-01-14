import React, { useState, useEffect, useCallback } from "react";
import { useEmployeeLeave } from "../../Hook/useEmployeeLeave";
import { useEmployee } from "../../Hook/useEmployee";
import { useDepartment } from "../../Hook/useDepartment";
import { useLeave } from "../../Hook/useLeave";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls"; // Reusing your existing component
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaUser 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Leaves = () => {
  const { getPaginatedLeaves, createLeave, updateLeave, removeLeave, loading } = useEmployeeLeave();
  const { getAllEmployees } = useEmployee();
  const { getAllDepartments } = useDepartment();
  const { getAllLeaves } = useLeave();

  // State Management
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  
  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    year: "2026",
    employeeId: "",
    leaveType: "",
    department: ""
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { 
    employee: "", 
    leaveType: "", 
    date: new Date().toISOString().split('T')[0],
    period: "", 
    days: 1, 
    reason: "", 
    notes: "" 
  };
  const [formData, setFormData] = useState(initialForm);

  const selectedEmployee = employees.find(emp => emp._id === formData.employee);

  // Fetch Logic
  const loadInitialData = useCallback(async () => {
    const [empData, deptData, typeData] = await Promise.all([
      getAllEmployees(),
      getAllDepartments(),
      getAllLeaves()
    ]);
    if (empData) setEmployees(empData);
    if (deptData) setDepartments(deptData);
    if (typeData) setLeaveTypes(typeData);
  }, [getAllEmployees, getAllDepartments, getAllLeaves]);

  const loadLeaves = useCallback(async () => {
    const data = await getPaginatedLeaves({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      ...filters 
    });
    if (data) {
      setLeaves(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedLeaves, currentPage, itemsPerPage, searchTerm, filters]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);
  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  // Actions
  const handleOpenModal = (leave = null) => {
    if (leave) {
      setEditingId(leave._id);
      setFormData({
        employee: leave.employee?._id || "",
        leaveType: leave.leaveType,
        date: leave.date ? new Date(leave.date).toISOString().split('T')[0] : "",
        period: leave.period,
        days: leave.days,
        reason: leave.reason || "",
        notes: leave.notes || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        ...initialForm,
        leaveType: leaveTypes.length > 0 ? `${leaveTypes[0].name} — ${leaveTypes[0].daysPerYear} days/year` : ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) return toast.error("Please select an employee");
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateLeave(editingId, formData);
        toast.success("Record updated");
      } else {
        await createLeave(formData);
        toast.success("Leave recorded");
      }
      setIsModalOpen(false);
      loadLeaves();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "This will permanently remove the record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3B82F6",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await removeLeave(id);
        toast.success("Deleted");
        loadLeaves();
      }
    });
  };

  return (
    <div className="p-6 bg-[#f0f9f4] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-secondary">Leave Records</h1>
          <p className="text-xs text-neutral-500 font-medium italic">Track employee leave requests and balances</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg">
          <FaPlus /> Record Leave
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end border border-base-300">
        <div className="form-control">
          <label className="label-text text-[10px] text-neutral-400 font-bold mb-1 uppercase tracking-widest">Year</label>
          <select className="select select-bordered select-sm w-24" value={filters.year} onChange={e => { setFilters({...filters, year: e.target.value}); setCurrentPage(1); }}>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
     
  <div className="form-control">
  <label className="label-text text-[10px] ...">LEAVE TYPE</label>
  <select 
    className="select select-bordered select-sm w-40" 
    value={filters.leaveType} 
    onChange={e => { setFilters({...filters, leaveType: e.target.value}); setCurrentPage(1); }}
  >
    <option value="">All Types</option>
    {leaveTypes.map(lt => (
      // The value here MUST match how it is saved in the DB
      <option key={lt._id} value={`${lt.name} — ${lt.daysPerYear} days/year`}>
        {lt.name}
      </option>
    ))}
  </select>
</div>
        <div className="form-control">
          <label className="label-text text-[10px] text-neutral-400 font-bold mb-1 uppercase tracking-widest">Department</label>
          <select className="select select-bordered select-sm w-32" value={filters.department} onChange={e => { setFilters({...filters, department: e.target.value}); setCurrentPage(1); }}>
            <option value="">All</option>
            {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300">
        <div className="p-4">
          <TableControls 
            itemsPerPage={itemsPerPage} 
            onItemsPerPageChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }} 
            searchTerm={searchTerm} 
            onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 text-secondary uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Days</th>
                <th>Reason</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && leaves.length === 0 ? (
                <tr><td colSpan="7"><SkeletonLoader /></td></tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item._id} className="hover:bg-primary/5 border-b border-base-200 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-bold">
                            {item.employee?.name?.split(' ').map(n => n[0]).join('') || "??"}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-secondary text-sm">{item.employee?.name}</div>
                          <div className="text-[10px] text-neutral-400 uppercase">{item.employee?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">{item.employee?.department || "N/A"}</td>
                    <td>
                      <span className="badge badge-success badge-outline font-bold text-[10px] py-3 px-4 rounded-lg">
                        {item.leaveType.split("—")[0].trim()}
                      </span>
                    </td>
                    <td className="text-neutral-500 text-xs font-medium">{item.period}</td>
                    <td><span className="font-bold text-secondary text-sm">{item.days.toFixed(1)}d</span></td>
                    <td className="text-neutral-400 italic text-xs">{item.reason}</td>
                    <td className="text-center">
                      <button onClick={() => handleOpenModal(item)} className="btn btn-sm btn-ghost text-primary"><FaEdit /></button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-ghost text-error"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 flex justify-between items-center bg-base-50 rounded-b-2xl border-t">
          <span className="text-xs font-medium opacity-60">Total Records: {totalItems}</span>
          <div className="join gap-1">
            <button 
              disabled={currentPage === 1} 
              className="join-item btn btn-xs" 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <FaChevronLeft/>
            </button>
            <button className="join-item btn btn-xs bg-white border border-base-300 px-4">{currentPage}</button>
            <button 
              disabled={currentPage >= totalPages} 
              className="join-item btn btn-xs" 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <FaChevronRight/>
            </button>
          </div>
        </div>
      </div>

  {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-3 mb-6 bg-blue-50/40 p-4 rounded-xl border border-blue-50">
                 <div className="bg-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {selectedEmployee ? selectedEmployee.name.split(' ').map(n => n[0]).join('') : "?"}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedEmployee ? selectedEmployee.name : "Select Employee"}</h2>
                    <p className="text-xs text-slate-400 uppercase font-medium">{selectedEmployee ? selectedEmployee.employeeId : "No Employee Selected"}</p>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Employee Select */}
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Select Employee *</label>
                  <select required className="select select-bordered w-full border-slate-200 bg-slate-50/50" value={formData.employee} onChange={e => setFormData({...formData, employee: e.target.value})} disabled={!!editingId}>
                    <option value="" disabled>Choose an employee...</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                {/* Leave Type */}
                <div className="form-control">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Leave Type *</label>
                  <select required className="select select-bordered w-full border-blue-200 bg-slate-50/50" value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
                    <option value="" disabled>Select Type</option>
                    {leaveTypes.map(lt => (
                      <option key={lt._id} value={`${lt.name} — ${lt.daysPerYear} days/year`}>
                        {lt.name} — {lt.daysPerYear} days/year
                      </option>
                    ))}
                    <option value="Compensatory Off (CO)">Compensatory Off (CO)</option>
                    <option value="Unpaid Leave (UL) — Unpaid">Unpaid Leave (UL) — Unpaid</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="form-control">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Reference Date *</label>
                  <input required type="date" className="input input-bordered w-full border-slate-200" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>

                {/* Period Description */}
                <div className="form-control">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Leave Period (Description) *</label>
                  <input required type="text" placeholder="e.g. Jan 3 to Jan 4" className="input input-bordered w-full border-slate-200" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
                </div>

                {/* Days */}
                <div className="form-control">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Number of Days *</label>
                  <input required type="number" step="0.5" min="0.5" className="input input-bordered w-full border-slate-200" value={formData.days} onChange={e => setFormData({...formData, days: parseFloat(e.target.value)})} />
                </div>

                {/* Reason */}
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Reason for Leave</label>
                  <input type="text" placeholder="Brief reason..." className="input input-bordered w-full border-slate-200 bg-slate-50/50" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </div>

                {/* Notes */}
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Additional Notes</label>
                  <textarea className="textarea textarea-bordered h-24 border-slate-200 bg-slate-50/50" placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>

                <div className="flex gap-3 mt-4 md:col-span-2">
                  <button type="submit" className="btn btn-primary flex-1 text-white shadow-lg shadow-blue-100" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="btn btn-ghost flex-1 text-slate-400 font-bold" onClick={() => setIsModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;