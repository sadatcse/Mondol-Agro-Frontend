import React, { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import ImageUpload from "../../config/ImageUploadcpanel";
import useDistricts from "../../Hook/useDistricts";
import { 
  FaEdit, FaTrash, FaPlus, FaGlobe, FaEnvelope, FaTimes, 
  FaUserFriends, FaSave, FaPhone, FaMapMarkerAlt, FaBriefcase,
  FaChevronLeft, FaChevronRight, FaAddressCard, FaCreditCard, 
  FaTags, FaUserPlus, FaUserTie
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Client = () => {
  const axiosSecure = UseAxiosSecure();
  const { districts } = useDistricts();

  // Logic States
  const [clients, setClients] = useState([]);
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
    companies: [],
    logo: "https://via.placeholder.com/150",
    name: "",
    email: "",
    phone: "",
    contacts: [], // Array of objects: { firstName, lastName, email, phone, role, status }
    address: { street: "", city: "", state: "", zip: "", country: "USA" },
    billingInfo: { taxId: "", vatNumber: "", paymentMethod: "Wire Transfer", currency: "USD" },
    status: "active",
    tags: "", // Handled as string for input, converted to array for API
    notes: "",
    website: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // --- API FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, companyRes] = await Promise.all([
        axiosSecure.get("/client/paginate", {
          params: { page: currentPage, limit: itemsPerPage, search: searchTerm }
        }),
        axiosSecure.get("/company")
      ]);
      setClients(clientRes.data.data);
      setTotalPages(clientRes.data.totalPages);
      setTotalItems(clientRes.data.totalItems);
      setCompanies(companyRes.data);
    } catch (err) {
      toast.error("Network error: Could not sync data");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- CONTACT PERSON HELPERS ---
  const addContactRow = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { firstName: "", lastName: "", email: "", phone: "", role: "", status: "active" }]
    });
  };

  const removeContactRow = (index) => {
    const updatedContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: updatedContacts });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index][field] = value;
    setFormData({ ...formData, contacts: updatedContacts });
  };

  // --- HANDLERS ---
  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingId(client._id);
      setFormData({
        ...client,
        companies: client.companies?.map(c => c._id || c) || [],
        tags: Array.isArray(client.tags) ? client.tags.join(", ") : "",
        address: { ...initialForm.address, ...client.address },
        billingInfo: { ...initialForm.billingInfo, ...client.billingInfo }
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
      text: "This client record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/client/delete/${id}`);
          toast.success("Client deleted successfully");
          fetchData();
        } catch {
          toast.error("Delete operation failed");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.companies.length === 0) return toast.error("Please assign at least one company");

    setIsSubmitting(true);
    const submissionData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(t => t !== "") : []
    };

    try {
      if (editingId) {
        await axiosSecure.put(`/client/update/${editingId}`, submissionData);
        toast.success("Client profile updated!");
      } else {
        await axiosSecure.post("/client/post", submissionData);
        toast.success("New client registered!");
      }
      setIsModalOpen(false);
      fetchData();
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
            <FaUserFriends className="text-primary" /> Client Hub
          </h1>
          <p className="text-neutral-500 font-medium">CRM & Stakeholder Management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all">
          <FaPlus /> Register New Client
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300">
        <div className="p-4">
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
                <th>Client Identity</th>
                <th>Location / Contacts</th>
                <th>Affiliations</th>
                <th>Status / Tax</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 font-bold opacity-30">No clients found.</td></tr>
              ) : (
                clients.map((c) => (
                  <tr key={c._id} className="hover:bg-primary/5 transition-colors border-b border-base-200">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle w-12 h-12 bg-white border p-1 flex items-center justify-center">
                          <img src={c.logo} alt="logo" className="object-contain" />
                        </div>
                        <div>
                          <div className="font-bold text-secondary">{c.name}</div>
                          <div className="text-[11px] opacity-60 flex items-center gap-1"><FaEnvelope className="text-primary"/> {c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold flex items-center gap-1 text-secondary"><FaMapMarkerAlt className="text-primary text-xs"/> {c.address?.city || "N/A"}</div>
                      <div className="text-[10px] font-bold opacity-70 mt-1">{c.contacts?.length || 0} Key Contacts</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.companies?.map(comp => (
                          <span key={comp._id} className="badge badge-primary badge-outline font-black text-[8px] uppercase">{comp.companyName}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={`badge badge-xs font-bold uppercase mb-1 ${c.status === 'active' ? 'badge-success text-white' : 'badge-warning'}`}>{c.status}</div>
                      <div className="text-[10px] font-mono bg-base-200 px-1 rounded block w-fit">TIN: {c.billingInfo?.taxId || "N/A"}</div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(c)} className="btn btn-sm btn-circle btn-ghost text-primary"><FaEdit className="text-lg" /></button>
                        <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-circle btn-ghost text-error"><FaTrash className="text-lg" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-base-50">
              <h2 className="text-2xl font-black text-secondary uppercase tracking-tight flex items-center gap-3">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Update Client Profile" : "Client Registration"}
              </h2>
              <button className="btn btn-circle btn-ghost" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: Basic Info & Branding */}
                <div className="space-y-6">
                  <div className="border-b pb-2"><h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm"><FaAddressCard /> Identity</h3></div>
                  <div className="form-control">
                    <label className="label-text font-bold mb-1">Client Full Name *</label>
                    <input required className="input input-bordered" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-control">
                    <label className="label-text font-bold mb-1">Primary Email *</label>
                    <input type="email" required className="input input-bordered" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-control">
                    <label className="label-text font-bold mb-1">Company Association *</label>
                    <select multiple className="select select-bordered h-32" value={formData.companies} onChange={(e) => setFormData({...formData, companies: Array.from(e.target.selectedOptions, o => o.value)})}>
                      {companies.map(comp => <option key={comp._id} value={comp._id}>{comp.companyName}</option>)}
                    </select>
                  </div>
                  <ImageUpload label="Client Logo" setImageUrl={(url) => setFormData({...formData, logo: url})} />
                </div>

                {/* COLUMN 2: Logistics & Billing */}
                <div className="space-y-6">
                  <div className="border-b pb-2"><h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm"><FaGlobe /> Logistics & Billing</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control col-span-2">
                      <label className="label-text font-bold mb-1">Street Address</label>
                      <input className="input input-bordered" value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1">City/District</label>
                      <select className="select select-bordered" value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}>
                        <option value="">Select City</option>
                        {districts.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1">Zip Code</label>
                      <input className="input input-bordered" value={formData.address.zip} onChange={(e) => setFormData({...formData, address: {...formData.address, zip: e.target.value}})} />
                    </div>
                  </div>
                  <div className="bg-base-200 p-4 rounded-2xl space-y-4">
                    <div className="form-control">
                      <label className="label-text font-bold mb-1 flex items-center gap-2"><FaCreditCard className="text-primary"/> Tax ID / TIN</label>
                      <input className="input input-bordered bg-white" value={formData.billingInfo.taxId} onChange={(e) => setFormData({...formData, billingInfo: {...formData.billingInfo, taxId: e.target.value}})} />
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1 text-xs">Payment Method</label>
                      <select className="select select-bordered select-sm bg-white" value={formData.billingInfo.paymentMethod} onChange={(e) => setFormData({...formData, billingInfo: {...formData.billingInfo, paymentMethod: e.target.value}})}>
                        <option>Wire Transfer</option>
                        <option>Credit Card</option>
                        <option>Check</option>
                        <option>Cash</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Contact Persons (Dynamic Array) */}
                <div className="space-y-6">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase text-sm"><FaUserTie /> Contact Persons</h3>
                    <button type="button" onClick={addContactRow} className="btn btn-xs btn-primary text-white"><FaUserPlus /> Add</button>
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="p-4 bg-base-50 border rounded-xl relative group">
                        <button type="button" onClick={() => removeContactRow(index)} className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 hidden group-hover:flex"><FaTimes className="text-white text-[10px]"/></button>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="First Name" className="input input-bordered input-sm" value={contact.firstName} onChange={(e) => handleContactChange(index, 'firstName', e.target.value)} />
                          <input placeholder="Last Name" className="input input-bordered input-sm" value={contact.lastName} onChange={(e) => handleContactChange(index, 'lastName', e.target.value)} />
                          <input placeholder="Email" className="input input-bordered input-sm col-span-2" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} />
                          <input placeholder="Role" className="input input-bordered input-sm col-span-2" value={contact.role} onChange={(e) => handleContactChange(index, 'role', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    {formData.contacts.length === 0 && <p className="text-center text-xs opacity-40 py-4 italic">No contacts added yet</p>}
                  </div>
                  
                  <div className="form-control">
                    <label className="label-text font-bold mb-1 flex items-center gap-2"><FaTags className="text-primary"/> Tags (comma separated)</label>
                    <input className="input input-bordered" placeholder="Premium, Tech, Govt" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-10 border-t pt-8">
                <button type="button" className="btn btn-ghost px-10" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-16 text-white shadow-xl" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save Client</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Client;