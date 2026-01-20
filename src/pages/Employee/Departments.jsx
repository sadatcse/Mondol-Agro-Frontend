import React, { useState, useEffect, useCallback } from "react";
import { useDepartment } from "../../Hook/useDepartment";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaBuilding,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaBan 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Departments = () => {
  const { getPaginatedDepartments, createDepartment, updateDepartment, removeDepartment, loading } = useDepartment();

  // State Management
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "", code: "", status: "Active" };
  const [formData, setFormData] = useState(initialForm);

  // Load Data
  const loadDepartments = useCallback(async () => {
    const data = await getPaginatedDepartments({ page: currentPage, limit: itemsPerPage, search: searchTerm });
    if (data) {
      setDepartments(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedDepartments, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  // Modal Handlers
  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingId(dept._id);
      setFormData({ name: dept.name, code: dept.code || "", status: dept.status || "Active" });
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
        await updateDepartment(editingId, formData);
        toast.success("Department updated");
      } else {
        await createDepartment(formData);
        toast.success("Department created");
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Are you sure?",
      text: "This department will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeDepartment(id);
          toast.success("Deleted successfully");
          loadDepartments();
        } catch (err) {
          toast.error("Deletion failed");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaBuilding className="text-primary" /> Departments
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium italic text-sm">Manage company divisions and codes</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg mt-4 md:mt-0">
          <FaPlus /> Add Department
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
                <th>Department Details</th>
                <th>Code</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && departments.length === 0 ? (
                <tr><td colSpan="4"><SkeletonLoader /></td></tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 border-base-200">
                    <td><div className="font-bold text-secondary dark:text-white text-lg">{dept.name}</div></td>
                    <td><div className="badge badge-ghost dark:bg-gray-700 dark:text-gray-300 font-mono text-primary uppercase">{dept.code || "N/A"}</div></td>
                    <td>
                      <div className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-error'} badge-outline font-bold text-[10px]`}>
                        {dept.status === 'Active' ? <FaCheckCircle className="mr-1"/> : <FaBan className="mr-1"/>}
                        {dept.status}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(dept)} className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"><FaEdit /></button>
                        <button onClick={() => handleDelete(dept._id)} className="btn btn-sm btn-ghost text-error hover:bg-error/10"><FaTrash /></button>
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
           <span className="text-xs font-medium opacity-60 dark:text-gray-400 mb-2 md:mb-0">Showing {departments.length} of {totalItems}</span>
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
                <FaBuilding/> {editingId ? "Edit Department" : "New Department"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm dark:text-gray-300 dark:hover:bg-gray-600"><FaTimes/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Name <span className="text-error">*</span></label>
                <input 
                  required 
                  className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Code</label>
                <input 
                  className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  placeholder="e.g. HR, IT, FIN" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})} 
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
              <div className="flex justify-end gap-2 mt-6 border-t dark:border-gray-700 pt-4">
                <button type="button" className="btn btn-ghost dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-white px-8" disabled={isSubmitting}>
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

export default Departments;