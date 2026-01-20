import React, { useState, useEffect, useCallback } from "react";
import { useDesignation } from "../../Hook/useDesignation";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaUserTie, FaSave, 
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaBan 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Designations = () => {
  const { getPaginatedDesignations, createDesignation, updateDesignation, removeDesignation, loading } = useDesignation();

  // State Management
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "", status: "Active" };
  const [formData, setFormData] = useState(initialForm);

  // Fetch Logic
  const loadDesignations = useCallback(async () => {
    const data = await getPaginatedDesignations({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm 
    });
    if (data) {
      setDesignations(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedDesignations, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadDesignations(); }, [loadDesignations]);

  // Actions
  const handleOpenModal = (desig = null) => {
    if (desig) {
      setEditingId(desig._id);
      setFormData({ name: desig.name, status: desig.status || "Active" });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDesignation(editingId, formData);
        toast.success("Designation updated successfully");
      } else {
        await createDesignation(formData);
        toast.success("Designation created successfully");
      }
      setIsModalOpen(false);
      loadDesignations();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Confirm Removal",
      text: "This designation will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeDesignation(id);
          toast.success("Deleted");
          loadDesignations();
        } catch (err) {
          toast.error("Failed to delete");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-secondary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaUserTie className="text-primary" /> Designations
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium italic text-sm">Employee Job Titles & Rank Management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg mt-4 md:mt-0">
          <FaPlus /> New Designation
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 transition-colors">
        <div className="p-4 bg-base-50/50 dark:bg-gray-700/30">
          <TableControls 
            itemsPerPage={itemsPerPage} 
            onItemsPerPageChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }} 
            searchTerm={searchTerm} 
            onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 dark:bg-gray-700/50 text-secondary dark:text-gray-200 uppercase text-[10px] tracking-widest border-b dark:border-gray-600">
              <tr>
                <th>Designation Name</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && designations.length === 0 ? (
                <tr><td colSpan="4"><SkeletonLoader /></td></tr>
              ) : (
                designations.map((des) => (
                  <tr key={des._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 border-base-200">
                    <td><div className="font-bold text-secondary dark:text-white text-lg">{des.name}</div></td>
                    <td>
                      <div className={`badge ${des.status === 'Active' ? 'badge-success' : 'badge-error'} badge-outline font-bold text-[10px]`}>
                        {des.status === 'Active' ? <FaCheckCircle className="mr-1"/> : <FaBan className="mr-1"/>}
                        {des.status}
                      </div>
                    </td>
                    <td className="text-xs opacity-70 dark:text-gray-400">
                      {new Date(des.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(des)} className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"><FaEdit /></button>
                        <button onClick={() => handleDelete(des._id)} className="btn btn-sm btn-ghost text-error hover:bg-error/10"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-base-50 dark:bg-gray-800 rounded-b-2xl border-t dark:border-gray-700 transition-colors">
           <span className="text-xs font-medium opacity-60 dark:text-gray-400 mb-2 md:mb-0">Total Records: {totalItems}</span>
           <div className="join">
              <button disabled={currentPage === 1} className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
              <button className="join-item btn btn-xs bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4">{currentPage}</button>
              <button disabled={currentPage >= totalPages} className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
           </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 dark:bg-gray-800 rounded-2xl w-full max-w-md border-t-8 border-primary shadow-2xl transition-colors">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                <FaUserTie/> {editingId ? "Edit Designation" : "New Designation"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm dark:text-gray-300 dark:hover:bg-gray-600"><FaTimes/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Designation Name *</label>
                <input 
                  required 
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Status</label>
                <select 
                  className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-8 border-t dark:border-gray-700 pt-4">
                <button type="button" className="btn btn-ghost dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-white px-10 shadow-md" disabled={isSubmitting}>
                  <FaSave className="mr-2" />
                  {isSubmitting ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;