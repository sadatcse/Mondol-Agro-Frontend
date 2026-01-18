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
    Swal.fire({
      title: "Are you sure?",
      text: "This department will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
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
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaBuilding className="text-primary" /> Departments
          </h1>
          <p className="text-neutral-500 font-medium italic text-sm">Manage company divisions and codes</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg">
          <FaPlus /> Add Department
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
                  <tr key={dept._id} className="hover:bg-primary/5 transition-colors border-b">
                    <td><div className="font-bold text-secondary text-lg">{dept.name}</div></td>
                    <td><div className="badge badge-ghost font-mono text-primary uppercase">{dept.code || "N/A"}</div></td>
                    <td>
                      <div className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-error'} badge-outline font-bold text-[10px]`}>
                        {dept.status === 'Active' ? <FaCheckCircle className="mr-1"/> : <FaBan className="mr-1"/>}
                        {dept.status}
                      </div>
                    </td>
                    <td className="text-center">
                      <button onClick={() => handleOpenModal(dept)} className="btn btn-sm btn-ghost text-primary"><FaEdit /></button>
                      <button onClick={() => handleDelete(dept._id)} className="btn btn-sm btn-ghost text-error"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center bg-base-50 rounded-b-2xl">
           <span className="text-xs font-medium opacity-60">Showing {departments.length} of {totalItems}</span>
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
                <FaBuilding/> {editingId ? "Edit Department" : "New Department"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm"><FaTimes/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label-text font-semibold mb-1">Name <span className="text-error">*</span></label>
                <input required className="input input-bordered" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1">Code</label>
                <input className="input input-bordered" placeholder="e.g. HR, IT, FIN" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1">Status</label>
                <select className="select select-bordered" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
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