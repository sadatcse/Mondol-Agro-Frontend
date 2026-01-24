import React, { useState, useEffect, useCallback } from "react";
import { useWarehouse } from "../../Hook/useWarehouse";
import { useCompany } from "../../Hook/useCompany";
import { useEmployee } from "../../Hook/useEmployee"; // Import Employee Hook
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaWarehouse,
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaPhone, FaUserTie
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Warehouses = () => {
  const { getPaginatedWarehouses, createWarehouse, updateWarehouse, removeWarehouse, loading } = useWarehouse();
  const { getAllCompanies } = useCompany();
  const { getAllEmployees } = useEmployee(); // Destructure employee method

  // State Management
  const [warehouses, setWarehouses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]); // Store employees
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = { 
    name: "", 
    code: "", 
    company: "", 
    address: "", 
    phone: "", 
    manager: "" 
  };
  const [formData, setFormData] = useState(initialForm);

  // Load Data
  const loadWarehouses = useCallback(async () => {
    const data = await getPaginatedWarehouses({ page: currentPage, limit: itemsPerPage, search: searchTerm });
    if (data) {
      setWarehouses(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedWarehouses, currentPage, itemsPerPage, searchTerm]);

  // Load Dropdown Data (Companies & Employees)
  const loadDropdownData = useCallback(async () => {
    const [companyData, employeeData] = await Promise.all([
      getAllCompanies(),
      getAllEmployees()
    ]);
    
    if (companyData) setCompanies(companyData);
    if (employeeData) setEmployees(employeeData);
  }, [getAllCompanies, getAllEmployees]);

  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);
  useEffect(() => { loadDropdownData(); }, [loadDropdownData]);

  // Modal Handlers
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({ 
        name: item.name, 
        code: item.code || "", 
        company: item.company?._id || item.company || "", 
        address: item.address,
        phone: item.phone,
        manager: item.manager || "" // Matches existing manager name string
      });
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
        await updateWarehouse(editingId, formData);
        toast.success("Warehouse updated");
      } else {
        await createWarehouse(formData);
        toast.success("Warehouse created");
      }
      setIsModalOpen(false);
      loadWarehouses();
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
      text: "This warehouse will be permanently deleted!",
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
          await removeWarehouse(id);
          toast.success("Deleted successfully");
          loadWarehouses();
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
            <FaWarehouse className="text-primary" /> Warehouses
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium italic text-sm">Manage inventory locations</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg mt-4 md:mt-0">
          <FaPlus /> Add Warehouse
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
                <th>Warehouse Details</th>
                <th>Contact Info</th>
                <th>Company</th>
                <th>Manager</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && warehouses.length === 0 ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 border-base-200">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-secondary dark:text-white text-lg">{wh.name}</span>
                        <span className="badge badge-ghost badge-sm dark:bg-gray-700 dark:text-gray-300 font-mono text-xs mt-1">{wh.code || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm dark:text-gray-300 space-y-1">
                        <div className="flex items-center gap-1"><FaMapMarkerAlt className="text-primary text-xs" /> {wh.address}</div>
                        <div className="flex items-center gap-1"><FaPhone className="text-success text-xs" /> {wh.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-neutral-600 dark:text-gray-400">
                        {wh.company?.companyName || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                        {wh.manager ? (
                          <>
                            <FaUserTie className="text-secondary dark:text-gray-400"/> {wh.manager}
                          </>
                        ) : "N/A"}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(wh)} className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"><FaEdit /></button>
                        <button onClick={() => handleDelete(wh._id)} className="btn btn-sm btn-ghost text-error hover:bg-error/10"><FaTrash /></button>
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
           <span className="text-xs font-medium opacity-60 dark:text-gray-400 mb-2 md:mb-0">Showing {warehouses.length} of {totalItems}</span>
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
          <div className="bg-base-100 dark:bg-gray-800 rounded-2xl w-full max-w-lg border-t-8 border-primary shadow-2xl transition-colors">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                <FaWarehouse/> {editingId ? "Edit Warehouse" : "New Warehouse"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm dark:text-gray-300 dark:hover:bg-gray-600"><FaTimes/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label-text font-semibold mb-1 dark:text-gray-300">Warehouse Name <span className="text-error">*</span></label>
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
                    placeholder="e.g. WH-01"
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label-text font-semibold mb-1 dark:text-gray-300">Company <span className="text-error">*</span></label>
                  <select 
                    required
                    className="select select-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  >
                    <option value="" disabled>Select a company</option>
                    {companies.map(comp => (
                      <option key={comp._id} value={comp._id}>{comp.companyName}</option>
                    ))}
                  </select>
                </div>
                
                {/* Manager Field converted to Dropdown */}
                <div className="form-control">
                   <label className="label-text font-semibold mb-1 dark:text-gray-300">Manager</label>
                   <select 
                     className="select select-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                     value={formData.manager} 
                     onChange={e => setFormData({...formData, manager: e.target.value})} 
                   >
                     <option value="">Select a manager</option>
                     {employees.map(emp => (
                       <option key={emp._id} value={emp.name}>
                         {emp.name} {emp.designation ? `(${emp.designation})` : ''}
                       </option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="form-control">
                 <label className="label-text font-semibold mb-1 dark:text-gray-300">Phone <span className="text-error">*</span></label>
                 <input 
                   required
                   className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                   value={formData.phone} 
                   onChange={e => setFormData({...formData, phone: e.target.value})} 
                 />
              </div>

              <div className="form-control">
                 <label className="label-text font-semibold mb-1 dark:text-gray-300">Address <span className="text-error">*</span></label>
                 <textarea 
                   required
                   className="textarea textarea-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                   value={formData.address} 
                   onChange={e => setFormData({...formData, address: e.target.value})} 
                 />
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

export default Warehouses;