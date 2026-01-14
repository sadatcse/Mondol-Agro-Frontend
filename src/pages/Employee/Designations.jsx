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
    Swal.fire({
      title: "Confirm Removal",
      text: "This designation will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
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
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-secondary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaUserTie className="text-primary" /> Designations
          </h1>
          <p className="text-neutral-500 font-medium italic text-sm">Employee Job Titles & Rank Management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg">
          <FaPlus /> New Designation
        </button>
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
            <thead className="bg-base-200/50 text-secondary uppercase text-[10px] tracking-widest">
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
                  <tr key={des._id} className="hover:bg-primary/5 transition-colors border-b">
                    <td><div className="font-bold text-secondary text-lg">{des.name}</div></td>
                    <td>
                      <div className={`badge ${des.status === 'Active' ? 'badge-success' : 'badge-error'} badge-outline font-bold text-[10px]`}>
                        {des.status === 'Active' ? <FaCheckCircle className="mr-1"/> : <FaBan className="mr-1"/>}
                        {des.status}
                      </div>
                    </td>
                    <td className="text-xs opacity-70">
                      {new Date(des.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button onClick={() => handleOpenModal(des)} className="btn btn-sm btn-ghost text-primary"><FaEdit /></button>
                      <button onClick={() => handleDelete(des._id)} className="btn btn-sm btn-ghost text-error"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center bg-base-50 rounded-b-2xl border-t">
           <span className="text-xs font-medium opacity-60">Total Records: {totalItems}</span>
           <div className="join">
              <button disabled={currentPage === 1} className="join-item btn btn-xs" onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
              <button className="join-item btn btn-xs bg-white px-4">{currentPage}</button>
              <button disabled={currentPage >= totalPages} className="join-item btn btn-xs" onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
           </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-md border-t-8 border-primary shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <FaUserTie/> {editingId ? "Edit Designation" : "New Designation"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm"><FaTimes/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label-text font-semibold mb-1">Designation Name *</label>
                <input 
                  required 
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  className="input input-bordered focus:border-primary" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1">Status</label>
                <select 
                  className="select select-bordered" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-8">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
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