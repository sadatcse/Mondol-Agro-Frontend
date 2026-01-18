import React, { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import ImageUpload from "../../config/ImageUploadcpanel";
import useDistricts from "../../Hook/useDistricts"; // Import District Hook
import { 
  FaEdit, FaTrash, FaPlus, FaGlobe,  FaTimes, 
  FaBuilding, FaSave, FaMapMarkerAlt, FaIdCard, FaUserTie, FaBriefcase,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Company = () => {
  const axiosSecure = UseAxiosSecure();
  const { districts } = useDistricts(); // Use District Hook

  // Logic States
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    companyName: "",
    parentGroupName: "",
    companyType: "Private Limited",
    registrationNumber: "",
    tradeLicenseNumber: "",
    tinNumber: "",
    binNumber: "",
    registeredAddress: "",
    city: "", // Integrated with District dropdown
    managingDirectorName: "",
    contactPhone: "",
    companyEmail: "",
    website: "",
    businessNature: "",
    logo: "",
    role: "user",
  };

  const [formData, setFormData] = useState(initialForm);

  // --- API FETCHING ---
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get("/company/paginate", {
        params: { 
            page: currentPage, 
            limit: itemsPerPage, 
            search: searchTerm 
        },
      });
      setCompanies(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      toast.error("Network error: Could not fetch companies");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // --- HANDLERS ---
  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingId(company._id);
      setFormData({
        ...company,
        businessNature: Array.isArray(company.businessNature) ? company.businessNature.join(", ") : ""
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This record will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/company/delete/${id}`);
          toast.success("Company deleted successfully");
          fetchCompanies();
        } catch {
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      ...formData,
      businessNature: formData.businessNature
        ? formData.businessNature.split(",").map(item => item.trim()).filter(i => i !== "")
        : []
    };

    try {
      if (editingId) {
        await axiosSecure.put(`/company/update/${editingId}`, submissionData);
        toast.success("Company updated!");
      } else {
        await axiosSecure.post("/company/post", submissionData);
        toast.success("Company registered!");
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaBuilding className="text-primary" /> Company Hub
          </h1>
          <p className="text-neutral-500 font-medium font-sans">Corporate Identity Management System</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all">
          <FaPlus /> Register Company
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300">
        <div className="p-4 bg-base-50/50">
          <TableControls
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(e) => setItemsPerPage(e.target.value)}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-secondary uppercase text-xs tracking-widest bg-base-200/50">
                <th>Legal Identity</th>
                <th>MD / Location</th>
                <th>Type / Group</th>
                <th>Tax Details</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 opacity-50 font-bold">No companies found.</td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c._id} className="hover:bg-primary/5 transition-colors border-b border-base-200">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle w-12 h-12 bg-white border p-1 shadow-inner flex items-center justify-center">
                          {c.logo ? <img src={c.logo} alt="logo" className="object-contain" /> : <FaBuilding className="opacity-20 text-xl" />}
                        </div>
                        <div>
                          <div className="font-bold text-secondary text-base">{c.companyName}</div>
                          <div className="text-xs opacity-60 flex items-center gap-1 font-medium"> {Array.isArray(c.businessNature) ? c.businessNature.join(" • ") : "No Nature Defined"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold flex items-center gap-1 text-secondary"><FaUserTie className="text-primary text-xs"/> {c.managingDirectorName || "N/A"}</div>
                      <div className="text-[10px] flex items-center gap-1 mt-1 opacity-70 font-bold"><FaMapMarkerAlt className="text-primary"/> {c.city || "N/A"}</div>
                    </td>
                    <td>
                      <div className="badge badge-primary badge-outline font-black text-[9px] mb-1">{c.companyType}</div>
                      <div className="text-[11px] block italic text-neutral-400 font-medium">{c.parentGroupName}</div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono bg-base-200 px-2 py-0.5 rounded block w-fit font-bold">BIN: {c.binNumber || "N/A"}</span>
                        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded block w-fit font-bold">TIN: {c.tinNumber || "N/A"}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(c)} className="btn btn-sm btn-circle btn-ghost text-info hover:bg-info/10"><FaEdit className="text-primary text-lg" /></button>
                        <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/10"><FaTrash className="text-red-500 text-lg" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-50 rounded-b-2xl border-t">
          <div className="text-sm font-medium text-neutral-500">
            Showing <span className="text-secondary font-bold">{companies.length}</span> of <span className="text-secondary font-bold">{totalItems}</span> companies
          </div>
          
          <div className="join shadow-sm border border-base-300 bg-white">
            <button className="join-item btn btn-sm bg-white" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
              <FaChevronLeft className="text-xs" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`join-item btn btn-sm border-none ${currentPage === index + 1 ? "btn-primary text-white" : "bg-white text-neutral-500"}`}
              >
                {index + 1}
              </button>
            ))}
            <button className="join-item btn btn-sm bg-white" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary">
            
            <div className="p-6 border-b flex justify-between items-center bg-base-50">
              <h2 className="text-2xl font-black text-secondary flex items-center gap-3 uppercase tracking-tight">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Update Profile" : "Company Registration"}
              </h2>
              <button className="btn btn-circle btn-ghost" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Section: Legal Identity */}
                <div className="md:col-span-3 border-b pb-2"><h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm"><FaIdCard /> Corporate Identity</h3></div>
                
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Company Full Name *</label>
                  <input required className="input input-bordered focus:border-primary" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Company Type *</label>
                  <select required className="select select-bordered" value={formData.companyType} onChange={(e) => setFormData({...formData, companyType: e.target.value})}>
                    <option>Private Limited</option>
                    <option>Public Limited</option>
                    <option>Subsidiary</option>
                    <option>One Person Company</option>
                    <option>Branch Office</option>
                    <option>Sister Concern</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Parent Group *</label>
                  <input required className="input input-bordered" value={formData.parentGroupName} onChange={(e) => setFormData({...formData, parentGroupName: e.target.value})} />
                </div>

                {/* Section: Leadership & Nature */}
                <div className="md:col-span-3 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm"><FaUserTie /> Governance & Operations</h3></div>
                
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Managing Director Name</label>
                  <input className="input input-bordered" placeholder="Enter MD Name" value={formData.managingDirectorName} onChange={(e) => setFormData({...formData, managingDirectorName: e.target.value})} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1 flex items-center gap-2">Business Nature <span className="text-[10px] font-normal opacity-50">(Separate with commas)</span></label>
                  <input className="input input-bordered" placeholder="e.g. Manufacturing, IT Services, Export" value={formData.businessNature} onChange={(e) => setFormData({...formData, businessNature: e.target.value})} />
                </div>

                {/* Section: Legal Identifiers */}
                <div className="md:col-span-3 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm"><FaBriefcase /> Legal Identifiers</h3></div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1 text-xs">Reg Number</label>
                  <input className="input input-bordered input-sm" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1 text-xs">Trade License</label>
                  <input className="input input-bordered input-sm" value={formData.tradeLicenseNumber} onChange={(e) => setFormData({...formData, tradeLicenseNumber: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1 text-xs">TIN Number</label>
                  <input className="input input-bordered input-sm" value={formData.tinNumber} onChange={(e) => setFormData({...formData, tinNumber: e.target.value})} />
                </div>

                {/* Section: Contact & Website */}
                <div className="md:col-span-3 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm"><FaGlobe /> Connectivity</h3></div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Company Email</label>
                  <input type="email" className="input input-bordered" value={formData.companyEmail} onChange={(e) => setFormData({...formData, companyEmail: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Contact Phone</label>
                  <input className="input input-bordered" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Website URL</label>
                  <input className="input input-bordered" placeholder="https://..." value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>

                {/* Section: Address - Integrated City Dropdown */}
                <div className="md:col-span-2">
                  <label className="label-text font-bold mb-1 flex items-center gap-2"><FaMapMarkerAlt className="text-primary"/> Registered Address</label>
                  <input className="input input-bordered w-full" value={formData.registeredAddress} onChange={(e) => setFormData({...formData, registeredAddress: e.target.value})} placeholder="House, Road, Area..." />
                </div>

                <div className="form-control">
                  <label className="label-text font-bold mb-1 flex items-center gap-2">City/District *</label>
                  <select 
                    required 
                    className="select select-bordered w-full" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="">Select City</option>
                    {districts.map((dist) => (
                      <option key={dist.id || dist.district} value={dist.district}>
                        {dist.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 bg-base-200/50 p-6 rounded-2xl">
                  <ImageUpload label="Corporate Logo" setImageUrl={(url) => setFormData({...formData, logo: url})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 border-t pt-8">
                <button type="button" className="btn btn-ghost px-8" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-12 text-white shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save Company</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;