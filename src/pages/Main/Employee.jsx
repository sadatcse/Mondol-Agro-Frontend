import React, { useState, useEffect, useCallback } from "react";
import { useEmployee } from "../../Hook/useEmployee";
import { useCompany } from "../../Hook/useCompany";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import ImageUpload from "../../config/ImageUploadcpanel";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaUserTie, 
  FaIdCard, FaBriefcase, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFacebook, FaLinkedin, FaUsers, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaBuilding
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Employee = () => {
  const { getPaginatedEmployees, createEmployee, updateEmployee, removeEmployee } = useEmployee();
  const { getAllCompanies } = useCompany();

  // Logic States
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Table & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(""); // NEW: Filter State
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const initialForm = {
    name: "", employeeId: "", employeePhoto: "", company: "", rfidNumber: "",
    nationalIdCardName: "", department: "", designation: "", joiningDate: "",
    currentSalary: "", fatherName: "", motherName: "", employeePhone: "",
    employeeEmail: "", employeeAddress: "", city: "", emergencyContactName: "",
    emergencyContactPhone: "", emergencyContactRelation: "", facebookProfile: "",
    linkedinProfile: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Companies for Filter and Dropdown
  const fetchCompanies = useCallback(async () => {
    const data = await getAllCompanies();
    if (data) setCompanies(data);
  }, [getAllCompanies]);

  // Fetch Paginated Employees with Company Filter
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const data = await getPaginatedEmployees({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      company: selectedCompany // NEW: Passed to API
    });
    if (data) {
      setEmployees(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
    setLoading(false);
  }, [getPaginatedEmployees, currentPage, itemsPerPage, searchTerm, selectedCompany]);

  useEffect(() => { 
    fetchEmployees(); 
    fetchCompanies();
  }, [fetchEmployees, fetchCompanies]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, searchTerm]);

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    if (!formData.nationalIdCardName.trim()) newErrors.nationalIdCardName = "National ID is required";
    if (!formData.company) newErrors.company = "Please select a company";
    if (!formData.currentSalary || formData.currentSalary <= 0) newErrors.currentSalary = "Valid salary is required";
    if (!formData.employeePhone.trim()) {
        newErrors.employeePhone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.employeePhone)) {
        newErrors.employeePhone = "Phone must contain only numbers";
    }
    
    if (formData.employeeEmail && !/\S+@\S+\.\S+/.test(formData.employeeEmail)) {
      newErrors.employeeEmail = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (employee = null) => {
    setErrors({});
    if (employee) {
      setEditingId(employee._id);
      setFormData({
        ...employee,
        company: employee.company?._id || employee.company,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : ""
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Employee record will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await removeEmployee(id);
        toast.success("Employee deleted");
        fetchEmployees();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        toast.error("Please fill in all required fields correctly");
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateEmployee(editingId, formData);
        toast.success("Employee updated!");
      } else {
        await createEmployee(formData);
        toast.success("Employee onboarded!");
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label, field, type = "text", required = false, icon = null) => (
    <div className="form-control">
      <label className="label-text font-bold mb-1 flex items-center gap-2">
        {icon} {label} {required && <span className="text-error">*</span>}
      </label>
      <input 
        type={type}
        className={`input input-bordered w-full ${errors[field] ? "input-error" : ""}`} 
        value={formData[field]} 
        onChange={(e) => {
            setFormData({...formData, [field]: e.target.value});
            if (errors[field]) setErrors({...errors, [field]: null}); 
        }} 
      />
      {errors[field] && <span className="text-error text-xs mt-1">{errors[field]}</span>}
    </div>
  );

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaUsers className="text-primary" /> Employee Directory
          </h1>
          <p className="text-neutral-500 font-medium font-sans">Human Resource Information System</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all">
          <FaPlus /> Add New Employee
        </button>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300">
        <div className="p-4 bg-base-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <TableControls
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(e) => setItemsPerPage(e.target.value)}
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* NEW: Company Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="form-control w-full md:w-64">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="text-primary/50" />
                    </div>
                    <select 
                        className="select select-bordered select-sm pl-10 w-full"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        <option value="">All Companies</option>
                        {companies.map(c => (
                            <option key={c._id} value={c._id}>{c.companyName}</option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedCompany && (
                <button onClick={() => setSelectedCompany("")} className="btn btn-sm btn-ghost btn-circle text-error">
                    <FaTimes />
                </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-secondary uppercase text-xs tracking-widest bg-base-200/50">
                <th>Employee</th>
                <th>Work Details</th>
                <th>Contact</th>
                <th>Financials</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 opacity-50 font-bold">No employees found.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-primary/5 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={emp.employeePhoto || "https://via.placeholder.com/150"} alt="profile" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-secondary">{emp.name}</div>
                          <div className="text-xs opacity-60">ID: {emp.employeeId}</div>
                          <div className="text-[10px] bg-primary/10 text-primary px-1 rounded inline-block font-semibold">
                            {emp.company?.companyName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold">{emp.designation || 'N/A'}</div>
                      <div className="text-xs opacity-60">{emp.department || 'N/A'}</div>
                      <div className="text-[10px] italic">Joined: {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td>
                      <div className="text-xs flex items-center gap-1"><FaEnvelope className="text-[10px] text-primary"/> {emp.employeeEmail}</div>
                      <div className="text-xs flex items-center gap-1 mt-1"><FaPhone className="text-[10px] text-primary"/> {emp.employeePhone}</div>
                    </td>
                    <td>
                      <div className="font-mono font-bold text-success">${emp.currentSalary}</div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(emp)} className="btn btn-sm btn-circle btn-ghost text-info"><FaEdit className="text-primary" /></button>
                        <button onClick={() => handleDelete(emp._id)} className="btn btn-sm btn-circle btn-ghost text-error"><FaTrash className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-50 rounded-b-2xl border-t">
          <div className="text-sm font-medium text-neutral-500">
            Showing <span className="text-secondary font-bold">{employees.length}</span> of <span className="text-secondary font-bold">{totalItems}</span> employees
          </div>
          
          <div className="join shadow-sm border border-base-300 bg-white">
            <button className="join-item btn btn-sm bg-white" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
              <FaChevronLeft className="text-xs" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`join-item btn btn-sm border-none ${currentPage === index + 1 ? "btn-primary text-white" : "bg-white"}`}
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

      {/* --- FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary">
            
            <div className="p-6 border-b flex justify-between items-center bg-base-50">
              <h2 className="text-2xl font-black text-secondary flex items-center gap-3 uppercase">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Update Employee" : "Employee Onboarding"}
              </h2>
              <button className="btn btn-circle btn-ghost" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="md:col-span-4 border-b pb-2"><h3 className="font-bold text-primary flex items-center gap-2"><FaIdCard /> Primary Information</h3></div>
                
                {renderInput("Full Name", "name", "text", true)}
                {renderInput("Employee ID", "employeeId", "text", true)}
                {renderInput("RFID Number", "rfidNumber")}
                {renderInput("National ID", "nationalIdCardName", "text", true)}

                <div className="md:col-span-4 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2"><FaBriefcase /> Employment Details</h3></div>
                
                <div className="form-control">
                  <label className="label-text font-bold mb-1">Company Selection <span className="text-error">*</span></label>
                  <select 
                    className={`select select-bordered w-full ${errors.company ? "select-error" : ""}`} 
                    value={formData.company} 
                    onChange={e => {
                        setFormData({...formData, company: e.target.value});
                        setErrors({...errors, company: null});
                    }}
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                  </select>
                  {errors.company && <span className="text-error text-xs mt-1">{errors.company}</span>}
                </div>

                {renderInput("Department", "department")}
                {renderInput("Designation", "designation")}
                {renderInput("Joining Date", "joiningDate", "date", false, <FaCalendarAlt/>)}
                {renderInput("Current Salary", "currentSalary", "number", true, <FaMoneyBillWave/>)}

                <div className="md:col-span-4 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2"><FaUserTie /> Personal & Contact</h3></div>
                
                {renderInput("Father's Name", "fatherName")}
                {renderInput("Mother's Name", "motherName")}
                {renderInput("Email", "employeeEmail", "email")}
                {renderInput("Phone", "employeePhone", "text", true)}
                
                <div className="form-control md:col-span-3">
                  <label className="label-text font-bold mb-1">Address</label>
                  <input className="input input-bordered" value={formData.employeeAddress} onChange={(e) => setFormData({...formData, employeeAddress: e.target.value})} />
                </div>
                {renderInput("City", "city")}

                <div className="md:col-span-4 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2"><FaShieldAlt /> Emergency Contact</h3></div>
                
                {renderInput("Contact Name", "emergencyContactName")}

                <div className="form-control">
                  <label className="label-text font-bold mb-1">Relationship</label>
                  <select
                    className="select select-bordered"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                  >
                    <option value="">Select relationship</option>
                        <option value="Father">Father</option>
    <option value="Mother">Mother</option>
    <option value="Husband">Husband</option>
    <option value="Wife">Wife</option>
    <option value="Son">Son</option>
    <option value="Daughter">Daughter</option>
    <option value="Brother">Brother</option>
    <option value="Sister">Sister</option>
    <option value="Uncle">Uncle</option>
    <option value="Aunt">Aunt</option>
    <option value="Cousin">Cousin</option>
    <option value="Grandfather">Grandfather</option>
    <option value="Grandmother">Grandmother</option>
        <option value="Guardian">Guardian</option>
    <option value="Relative">Relative</option>
    <option value="Friend">Friend</option>
    <option value="Neighbor">Neighbor</option>
    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {renderInput("Emergency Phone", "emergencyContactPhone")}

                <div className="md:col-span-4 border-b pb-2 mt-4"><h3 className="font-bold text-primary flex items-center gap-2"><FaFacebook /> Social Profiles</h3></div>
                
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1">Facebook Link</label>
                  <input className="input input-bordered" value={formData.facebookProfile} onChange={(e) => setFormData({...formData, facebookProfile: e.target.value})} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1">LinkedIn Link</label>
                  <input className="input input-bordered" value={formData.linkedinProfile} onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})} />
                </div>

                <div className="md:col-span-4 bg-base-200/50 p-6 rounded-2xl">
                  <ImageUpload label="Employee Photograph" setImageUrl={(url) => setFormData({...formData, employeePhoto: url})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 border-t pt-8">
                <button type="button" className="btn btn-ghost px-8" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-12 text-white shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save Record</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;