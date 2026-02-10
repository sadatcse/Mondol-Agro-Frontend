import React, { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import useDistricts from "../../Hook/useDistricts";
import { 
  FaEdit, FaTrash, FaPlus, FaEnvelope, FaTimes, 
  FaSave, FaMapMarkerAlt, FaStore, FaPhone, 
  FaIdCard, FaTags, FaUserTie, FaMobileAlt,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const VendorList = () => {
  const axiosSecure = UseAxiosSecure();
  const { districts } = useDistricts();

  // Logic States
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Initial Form State
  const initialForm = {
    name: "",
    description: "",
    contactPerson: "",
    contactPersonMobile: "",
    vendorPhone: "",
    vendorEmail: "",
    vendorAddress: "",
    city: "",
    tradeLicense: "",
    purpose: "", 
  };

  const [formData, setFormData] = useState(initialForm);

  // --- API FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosSecure.get("/vendor/paginate", {
        params: { page: currentPage, limit: itemsPerPage, search: searchTerm }
      });
      
      setVendors(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (err) {
      toast.error("Network error: Could not sync data");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- PAGINATION HANDLER ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- MODAL HANDLERS ---
  const handleOpenModal = (vendor = null) => {
    if (vendor) {
      setEditingId(vendor._id);
      setFormData({
        ...vendor,
        purpose: Array.isArray(vendor.purpose) ? vendor.purpose.join(", ") : "",
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Are you sure?",
      text: "This vendor record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/vendor/delete/${id}`);
          toast.success("Vendor deleted successfully");
          fetchData();
        } catch {
          toast.error("Delete operation failed");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      ...formData,
      purpose: formData.purpose 
        ? formData.purpose.split(",").map(t => t.trim()).filter(t => t !== "") 
        : []
    };

    try {
      if (editingId) {
        await axiosSecure.put(`/vendor/update/${editingId}`, submissionData);
        toast.success("Vendor profile updated!");
      } else {
        await axiosSecure.post("/vendor/post", submissionData);
        toast.success("New vendor registered!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaStore className="text-primary" /> Vendor Management
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium">Supply Chain & Partners</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all mt-4 md:mt-0">
          <FaPlus /> Add New Vendor
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 transition-colors">
        
        {/* TOP CONTROLS */}
        <div className="p-4 bg-base-50/50 dark:bg-gray-700/30">
          <TableControls
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 dark:bg-gray-700/50 text-secondary dark:text-gray-200 uppercase text-xs tracking-widest border-b dark:border-gray-600">
              <tr>
                <th>Vendor Identity</th>
                <th>Contact Person</th>
                <th>Location</th>
                <th>Business Details</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 font-bold opacity-30 dark:text-gray-400">No vendors found.</td></tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b border-base-200 dark:border-gray-700">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle w-12 h-12 bg-primary/10 dark:bg-gray-700 border dark:border-gray-600 p-1 flex items-center justify-center">
                           <FaStore className="text-2xl text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-secondary dark:text-white">{v.name}</div>
                          <div className="text-[11px] opacity-60 dark:text-gray-400 flex items-center gap-1">
                            <FaEnvelope className="text-primary text-[10px]"/> {v.vendorEmail}
                          </div>
                          <div className="text-[11px] opacity-60 dark:text-gray-400 flex items-center gap-1">
                            <FaPhone className="text-primary text-[10px]"/> {v.vendorPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold flex items-center gap-1 text-secondary dark:text-gray-200">
                        <FaUserTie className="text-primary text-xs"/> {v.contactPerson}
                      </div>
                      <div className="text-[11px] opacity-70 dark:text-gray-400 mt-1 flex items-center gap-1">
                         <FaMobileAlt className="text-primary text-[10px]"/> {v.contactPersonMobile}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                         <span className="text-xs font-bold flex items-center gap-1 dark:text-gray-300">
                            <FaMapMarkerAlt className="text-primary"/> {v.city}
                         </span>
                         <span className="text-[10px] opacity-60 max-w-[150px] truncate dark:text-gray-400">
                           {v.vendorAddress}
                         </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                         <div className="text-[10px] font-mono bg-base-200 dark:bg-gray-700 dark:text-gray-300 px-1 rounded block w-fit mb-1">
                           Lic: {v.tradeLicense}
                         </div>
                         <div className="flex flex-wrap gap-1 max-w-[200px]">
                           {v.purpose?.map((p, idx) => (
                             <span key={idx} className="badge badge-primary badge-outline font-bold text-[8px] uppercase dark:bg-gray-700 dark:text-gray-200">
                               {p}
                             </span>
                           ))}
                         </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(v)} className="btn btn-sm btn-circle btn-ghost text-primary hover:bg-primary/10 dark:hover:bg-blue-900/30">
                            <FaEdit className="text-lg" />
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/10 dark:hover:bg-red-900/30">
                            <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-base-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center bg-base-50/50 dark:bg-gray-700/30 gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold">{totalItems}</span> entries
          </div>
          <div className="join shadow-sm">
            <button 
              className="join-item btn btn-sm btn-ghost dark:text-gray-300 dark:hover:bg-gray-600" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft />
            </button>
            <button className="join-item btn btn-sm btn-active dark:bg-gray-600 dark:text-white pointer-events-none">
              Page {currentPage} of {totalPages}
            </button>
            <button 
              className="join-item btn btn-sm btn-ghost dark:text-gray-300 dark:hover:bg-gray-600" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 dark:bg-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary transition-colors">
            
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-2xl font-black text-secondary dark:text-white uppercase tracking-tight flex items-center gap-3">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Update Vendor Profile" : "Register New Vendor"}
              </h2>
              <button className="btn btn-circle btn-ghost dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-base-content dark:text-gray-200">
                
                {/* COLUMN 1: Basic Info */}
                <div className="space-y-5">
                  <div className="border-b dark:border-gray-700 pb-2">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm">
                      <FaStore /> Basic Information
                    </h3>
                  </div>
                  
                  <div className="form-control">
                    <label className="label-text font-bold mb-1 dark:text-gray-300">Vendor Name *</label>
                    <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           value={formData.name} 
                           onChange={(e) => setFormData({...formData, name: e.target.value})} 
                           placeholder="e.g. ABC Supplies Ltd." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Vendor Email *</label>
                        <input type="email" required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                               value={formData.vendorEmail} 
                               onChange={(e) => setFormData({...formData, vendorEmail: e.target.value})} />
                      </div>
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Vendor Phone *</label>
                        <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                               value={formData.vendorPhone} 
                               onChange={(e) => setFormData({...formData, vendorPhone: e.target.value})} />
                      </div>
                  </div>

                  <div className="form-control">
                    <label className="label-text font-bold mb-1 dark:text-gray-300">Description *</label>
                    <textarea required className="textarea textarea-bordered h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                              value={formData.description} 
                              onChange={(e) => setFormData({...formData, description: e.target.value})} 
                              placeholder="Brief description of services..."></textarea>
                  </div>
                </div>

                {/* COLUMN 2: Contact & Location */}
                <div className="space-y-5">
                   {/* Contact Person Section */}
                   <div className="border-b dark:border-gray-700 pb-2">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm">
                      <FaUserTie /> Contact Person
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Contact Name *</label>
                        <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                               value={formData.contactPerson} 
                               onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
                      </div>
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">Mobile Number *</label>
                        <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                               value={formData.contactPersonMobile} 
                               onChange={(e) => setFormData({...formData, contactPersonMobile: e.target.value})} />
                      </div>
                  </div>

                  {/* Location & Details Section */}
                  <div className="border-b dark:border-gray-700 pb-2 pt-2">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm">
                      <FaMapMarkerAlt /> Location & Legal
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300">City *</label>
                        <select className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.city} 
                                onChange={(e) => setFormData({...formData, city: e.target.value})}>
                          <option value="">Select City</option>
                          {districts.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label-text font-bold mb-1 dark:text-gray-300 flex items-center gap-2">
                           <FaIdCard className="text-primary"/> Trade License *
                        </label>
                        <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                               value={formData.tradeLicense} 
                               onChange={(e) => setFormData({...formData, tradeLicense: e.target.value})} />
                      </div>
                  </div>

                  <div className="form-control">
                    <label className="label-text font-bold mb-1 dark:text-gray-300">Address *</label>
                    <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           value={formData.vendorAddress} 
                           onChange={(e) => setFormData({...formData, vendorAddress: e.target.value})} />
                  </div>

                  <div className="form-control">
                    <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300">
                        <FaTags className="text-primary"/> Purpose (comma separated) *
                    </label>
                    <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           placeholder="Supply, Maintenance, IT Support" 
                           value={formData.purpose} 
                           onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-10 border-t dark:border-gray-700 pt-8">
                <button type="button" className="btn btn-ghost px-10 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-16 text-white shadow-xl" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save Vendor</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;