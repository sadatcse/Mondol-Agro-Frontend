import React, { useState, useEffect, useCallback } from "react";
import { useSalaryComponent } from "../../Hook/useSalaryComponent";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaMoneyCheckAlt, FaSave, 
  FaChevronLeft, FaChevronRight, FaPercent, FaCoins,
  FaFilter, FaRedo
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Salary_Components = () => {
  const { getPaginatedSalaryComponents, createSalaryComponent, updateSalaryComponent, removeSalaryComponent, loading } = useSalaryComponent();

  // Data State
  const [components, setComponents] = useState([]);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [calcFilter, setCalcFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    name: "",
    code: "",
    type: "Earnings",
    calculationType: "Fixed",
    defaultAmount: 0,
    taxable: false,
    status: "active",
    description: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- FETCHING LOGIC ---
  const loadComponents = useCallback(async () => {
    const data = await getPaginatedSalaryComponents({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      type: typeFilter,
      calculationType: calcFilter
    });
    if (data) {
      setComponents(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedSalaryComponents, currentPage, itemsPerPage, searchTerm, typeFilter, calcFilter]);

  useEffect(() => { loadComponents(); }, [loadComponents]);

  // --- HANDLERS ---
  const handleOpenModal = (comp = null) => {
    if (comp) {
      setEditingId(comp._id);
      setFormData({ ...comp });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setTypeFilter("");
    setCalcFilter("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateSalaryComponent(editingId, formData);
        toast.success("Component updated");
      } else {
        await createSalaryComponent(formData);
        toast.success("Component created");
      }
      setIsModalOpen(false);
      loadComponents();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirm Delete",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeSalaryComponent(id);
          toast.success("Deleted");
          loadComponents();
        } catch (err) {
          toast.error("Deletion failed");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaMoneyCheckAlt className="text-primary" /> Salary Components
          </h1>
          <p className="text-neutral-500 font-medium italic text-sm">Payroll Structures & Filter Management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg">
          <FaPlus /> New Component
        </button>
      </div>

      {/* TABLE & FILTER SECTION */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
               <TableControls 
                 itemsPerPage={itemsPerPage} 
                 onItemsPerPageChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }} 
                 searchTerm={searchTerm} 
                 onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
               />
            </div>

            {/* QUICK FILTERS */}
            <div className="flex items-center gap-2 bg-base-200/50 p-2 rounded-xl border border-base-300">
              <FaFilter className="text-primary ml-2" />
              <select 
                className="select select-sm select-bordered focus:outline-none"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Types</option>
                <option value="Earnings">Earnings</option>
                <option value="Deductions">Deductions</option>
              </select>

              <select 
                className="select select-sm select-bordered focus:outline-none"
                value={calcFilter}
                onChange={(e) => { setCalcFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Calculations</option>
                <option value="Fixed">Fixed</option>
                <option value="Percentage">Percentage</option>
              </select>

              <button onClick={resetFilters} className="btn btn-sm btn-ghost text-error" title="Reset All">
                <FaRedo />
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 text-secondary uppercase text-[10px] tracking-widest">
              <tr>
                <th>Component</th>
                <th>Category</th>
                <th>Logic</th>
                <th>Default</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && components.length === 0 ? (
                <tr><td colSpan="6"><SkeletonLoader /></td></tr>
              ) : (
                components.map((comp) => (
                  <tr key={comp._id} className="hover:bg-primary/5 transition-colors border-b">
                    <td>
                      <div className="font-bold text-secondary">{comp.name}</div>
                      <div className="text-[10px] font-mono text-primary">{comp.code}</div>
                    </td>
                    <td>
                      <span className={`badge badge-sm font-bold ${comp.type === 'Earnings' ? 'badge-success' : 'badge-error'} badge-outline`}>
                        {comp.type}
                      </span>
                    </td>
                    <td className="text-xs">
                       {comp.calculationType === 'Percentage' ? <span className="flex items-center gap-1"><FaPercent className="text-primary"/> Percentage</span> : <span className="flex items-center gap-1"><FaCoins className="text-secondary"/> Fixed Amount</span>}
                    </td>
                    <td className="font-mono font-bold">
                        {comp.defaultAmount}{comp.calculationType === 'Percentage' ? '%' : ''}
                    </td>
                    <td>
                      <div className={`badge badge-sm font-bold ${comp.status === 'active' ? 'badge-primary' : 'badge-ghost'}`}>
                        {comp.status}
                      </div>
                      {comp.taxable && <span className="ml-1 badge badge-warning badge-xs">TAX</span>}
                    </td>
                    <td className="text-center">
                      <button onClick={() => handleOpenModal(comp)} className="btn btn-sm btn-ghost text-primary"><FaEdit /></button>
                      <button onClick={() => handleDelete(comp._id)} className="btn btn-sm btn-ghost text-error"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 flex justify-between items-center bg-base-50 border-t">
           <span className="text-xs font-medium opacity-60">Showing {components.length} of {totalItems}</span>
           <div className="join">
              <button disabled={currentPage === 1} className="join-item btn btn-xs" onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
              <button className="join-item btn btn-xs bg-white px-4">{currentPage}</button>
              <button disabled={currentPage >= totalPages} className="join-item btn btn-xs" onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
           </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl w-full max-w-2xl border-t-8 border-primary shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                <FaMoneyCheckAlt/> {editingId ? "Update Configuration" : "New Salary Component"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm"><FaTimes/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label-text font-bold mb-1">Name *</label>
                <input required className="input input-bordered" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1">Code *</label>
                <input required className="input input-bordered font-mono uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1">Type *</label>
                <select className="select select-bordered" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Earnings">Earnings</option>
                  <option value="Deductions">Deductions</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1">Calculation Method *</label>
                <select className="select select-bordered" value={formData.calculationType} onChange={e => setFormData({...formData, calculationType: e.target.value})}>
                  <option value="Fixed">Fixed Amount</option>
                  <option value="Percentage">Percentage (%)</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1">Value *</label>
                <input required type="number" step="0.01" className="input input-bordered" value={formData.defaultAmount} onChange={e => setFormData({...formData, defaultAmount: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1">Status</label>
                <select className="select select-bordered" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-control md:col-span-2">
                <label className="label-text font-bold mb-1">Description</label>
                <textarea className="textarea textarea-bordered h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-control flex-row items-center gap-2">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={formData.taxable} onChange={e => setFormData({...formData, taxable: e.target.checked})} />
                <span className="label-text font-bold text-neutral-600">Taxable Component</span>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-12 text-white" disabled={isSubmitting}>
                  <FaSave className="mr-1" /> {isSubmitting ? "Saving..." : "Save Component"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary_Components;