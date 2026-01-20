import React, { useState, useEffect, useCallback } from "react";
import { useEmployee } from "../../Hook/useEmployee";
import { useCompany } from "../../Hook/useCompany";
import { useDepartment } from "../../Hook/useDepartment";
import { useDesignation } from "../../Hook/useDesignation";
import useDistricts from "../../Hook/useDistricts";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import ImageUpload from "../../config/ImageUploadcpanel";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaUserTie, 
  FaIdCard, FaBriefcase, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFacebook, FaLinkedin, FaUsers, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaBuilding,
  FaCreditCard,
  FaUniversity
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import useBanks from "../../Hook/useBanks";

const Employee = () => {
  const { getPaginatedEmployees, createEmployee, updateEmployee, removeEmployee } = useEmployee();
  const { getAllCompanies } = useCompany();
  const { getAllDepartments } = useDepartment(); 
  const { getAllDesignations } = useDesignation(); 
  const { districts } = useDistricts();
  const { banks: bankList } = useBanks();

  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [designations, setDesignations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(""); 
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
    linkedinProfile: "", status: "Active", 
    role: "user",
    bankInfo: {
      bankName: "",
      accountNumber: "",
      branch: "",
      routingNumber: "" 
    },
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [compData, deptData, desigData] = await Promise.all([
        getAllCompanies(),
        getAllDepartments(),
        getAllDesignations()
      ]);
      if (compData) setCompanies(compData);
      if (deptData) setDepartments(deptData);
      if (desigData) setDesignations(desigData);
    } catch (err) {
      console.error("Error fetching dropdown lists", err);
    }
  }, [getAllCompanies, getAllDepartments, getAllDesignations]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const data = await getPaginatedEmployees({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm,
      company: selectedCompany 
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
    fetchDropdownData();
  }, [fetchEmployees, fetchDropdownData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, searchTerm]);

  // --- VALIDATION & UTILS ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.company) newErrors.company = "Please select a company";
    if (!formData.department) newErrors.department = "Please select a department";
    if (!formData.designation) newErrors.designation = "Please select a designation";
    if (!formData.employeePhone.trim()) newErrors.employeePhone = "Phone number is required";
    if (!formData.employeeEmail.trim()) newErrors.employeeEmail = "Email is required";
    if (!formData.employeeAddress.trim()) newErrors.employeeAddress = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City selection is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "Active": return "badge-success text-white";
      case "Inactive": return "badge-warning text-white";
      case "Resigned": return "badge-error text-white";
      default: return "badge-ghost";
    }
  };

  const handleOpenModal = (employee = null) => {
    setErrors({});
    if (employee) {
      setEditingId(employee._id);
      setFormData({
        ...employee,
        company: employee.company?._id || employee.company || "",
        department: employee.department?._id || employee.department || "",
        designation: employee.designation?._id || employee.designation || "",
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : "",
        status: employee.status || "Active",
        role: employee.role || "user",
        bankInfo: {
          bankName: employee.bankInfo?.bankName || "",
          accountNumber: employee.bankInfo?.accountNumber || "",
          branch: employee.bankInfo?.branch || "",
          routingNumber: employee.bankInfo?.routingNumber || "" 
        }
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the employee record and any existing login account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      try {
        const response = await removeEmployee(id);
        toast.success(response.message);
        fetchEmployees();
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Delete failed";
        Swal.fire({
            title: "Error", 
            text: errorMsg, 
            icon: "error",
            background: isDark ? "#1f2937" : "#fff",
            color: isDark ? "#fff" : "#000",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateEmployee(editingId, formData);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(formData);
        toast.success("Employee onboarded successfully!");
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || "An unexpected error occurred.";
      if (serverMessage.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, employeeEmail: serverMessage }));
      }
      toast.error(serverMessage, {
        duration: 5000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for text inputs
  const renderInput = (label, field, type = "text", required = false, icon = null) => (
    <div className="form-control">
      <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300">
        {icon} {label} {required && <span className="text-error">*</span>}
      </label>
      <input 
        type={type}
        className={`input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors[field] ? "input-error" : ""}`} 
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
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaUsers className="text-primary" /> Employee Directory
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium font-sans">Human Resource Information System</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all">
          <FaPlus /> Add New Employee
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 transition-colors">
        <div className="p-4 bg-base-50/50 dark:bg-gray-700/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <TableControls
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(e) => setItemsPerPage(e.target.value)}
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="form-control w-full md:w-64">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="text-primary/50 dark:text-gray-400" />
                    </div>
                    <select 
                        className="select select-bordered select-sm pl-10 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-secondary dark:text-gray-200 uppercase text-xs tracking-widest bg-base-200/50 dark:bg-gray-700/50 border-b dark:border-gray-600">
                <th>Employee</th>
                <th>Work Details</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Financials</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6"><SkeletonLoader /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 opacity-50 font-bold dark:text-gray-400">No employees found.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b border-base-200 dark:border-gray-700">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12 bg-gray-100 dark:bg-gray-600">
                            <img src={emp.employeePhoto || "https://via.placeholder.com/150"} alt="profile" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-secondary dark:text-white">{emp.name}</div>
                          <div className="text-xs opacity-60 dark:text-gray-400">ID: {emp.employeeId}</div>
                          <div className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary px-1 rounded inline-block font-bold mt-1">
                            {emp.company?.companyName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-bold dark:text-gray-200">{emp.designation?.name || emp.designation || 'N/A'}</div>
                      <div className="text-xs opacity-60 dark:text-gray-400">{emp.department?.name || emp.department || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-sm font-bold p-3 ${getStatusClass(emp.status)}`}>
                        {emp.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs flex items-center gap-1 font-medium dark:text-gray-300"><FaEnvelope className="text-[10px] text-primary"/> {emp.employeeEmail}</div>
                      <div className="text-xs flex items-center gap-1 mt-1 font-medium dark:text-gray-300"><FaPhone className="text-[10px] text-primary"/> {emp.employeePhone}</div>
                    </td>
                    <td>
                      <div className="font-mono font-black text-success text-sm">${emp.currentSalary?.toLocaleString()}</div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(emp)} className="btn btn-sm btn-circle btn-ghost text-info hover:bg-info/10 dark:hover:bg-blue-900/30"><FaEdit className="text-primary text-lg" /></button>
                        <button onClick={() => handleDelete(emp._id)} className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/10 dark:hover:bg-red-900/30"><FaTrash className="text-red-500 text-lg" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-50 dark:bg-gray-800 rounded-b-2xl border-t dark:border-gray-700 transition-colors">
          <div className="text-sm font-medium text-neutral-500 dark:text-gray-400">
            Showing <span className="text-secondary dark:text-white font-bold">{employees.length}</span> of <span className="text-secondary dark:text-white font-bold">{totalItems}</span> employees
          </div>
          
          <div className="join shadow-sm border border-base-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <button 
                className="join-item btn btn-sm bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:dark:bg-gray-600" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <FaChevronLeft className="text-xs" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`join-item btn btn-sm border-none ${
                    currentPage === index + 1 
                    ? "btn-primary text-white" 
                    : "bg-white text-neutral-500 dark:bg-gray-700 dark:text-gray-300 hover:dark:bg-gray-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button 
                className="join-item btn btn-sm bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:dark:bg-gray-600" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 dark:bg-gray-800 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary transition-colors">
            
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-2xl font-black text-secondary dark:text-white flex items-center gap-3 uppercase">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Update Employee" : "Employee Onboarding"}
              </h2>
              <button className="btn btn-circle btn-ghost dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-base-content dark:text-gray-200">
                
                {/* SECTION: Primary Info */}
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 flex justify-between items-center">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider"><FaIdCard /> Primary Information</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black opacity-50 uppercase dark:text-gray-400">Status:</span>
                        <select 
                            className={`select select-xs select-bordered font-bold rounded-full dark:bg-gray-700 dark:border-gray-600 ${getStatusClass(formData.status)}`}
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Active" className="text-black dark:text-white">Active</option>
                            <option value="Inactive" className="text-black dark:text-white">Inactive</option>
                            <option value="Resigned" className="text-black dark:text-white">Resigned</option>
                        </select>
                    </div>
                </div>
                
                {renderInput("Full Name", "name", "text", true)}
                {renderInput("Employee ID", "employeeId", "text", true)}
                {renderInput("RFID Number", "rfidNumber")}
                {renderInput("National ID Name", "nationalIdCardName", "text", true)}

                {/* SECTION: Job Info */}
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 mt-4">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider"><FaBriefcase /> Employment Details</h3>
                </div>
                
                {/* Company Dropdown */}
                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Company <span className="text-error">*</span></label>
                  <select 
                    className={`select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.company ? "select-error" : ""}`} 
                    value={formData.company} 
                    onChange={e => {
                        setFormData({...formData, company: e.target.value});
                        setErrors({...errors, company: null});
                    }}
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                  </select>
                </div>

                {/* Department Dropdown */}
                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Department <span className="text-error">*</span></label>
                  <select 
                    className={`select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.department ? "select-error" : ""}`} 
                    value={formData.department} 
                    onChange={e => {
                        setFormData({...formData, department: e.target.value});
                        setErrors({...errors, department: null});
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                {/* Designation Dropdown */}
                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Designation <span className="text-error">*</span></label>
                  <select 
                    className={`select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.designation ? "select-error" : ""}`} 
                    value={formData.designation} 
                    onChange={e => {
                        setFormData({...formData, designation: e.target.value});
                        setErrors({...errors, designation: null});
                    }}
                  >
                    <option value="">Select Designation</option>
                    {designations.map(des => <option key={des._id} value={des.name}>{des.name}</option>)}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">System Access Role</label>
                  <select 
                    className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Default Password will be: Welcome123</p>
                </div>

                {renderInput("Joining Date", "joiningDate", "date", false, <FaCalendarAlt/>)}
                {renderInput("Current Salary", "currentSalary", "number", true, <FaMoneyBillWave/>)}

                {/* SECTION: Contact Info */}
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 mt-4">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider"><FaUserTie /> Contact & Location</h3>
                </div>
                
                {renderInput("Father's Name", "fatherName")}
                {renderInput("Mother's Name", "motherName")}
                {renderInput("Email", "employeeEmail", "email", true, <FaEnvelope/>)}
                {renderInput("Phone", "employeePhone", "text", true, <FaPhone/>)}
                
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Detailed Address <span className="text-error">*</span></label>
                  <input 
                    className={`input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.employeeAddress ? "input-error" : ""}`} 
                    value={formData.employeeAddress} 
                    onChange={(e) => setFormData({...formData, employeeAddress: e.target.value})} 
                    placeholder="House, Road, Area..." 
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300">
                    <FaMapMarkerAlt className="text-primary"/> City/District <span className="text-error">*</span>
                  </label>
                  <select 
                    className={`select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.city ? "select-error" : ""}`}
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="">Select City</option>
                    {districts.map((dist) => (
                      <option key={dist.id || dist.district} value={dist.district}>{dist.district}</option>
                    ))}
                  </select>
                </div>

                {/* SECTION: Emergency Contact */}
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 mt-4">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider"><FaShieldAlt /> Emergency Contact</h3>
                </div>
                
                {renderInput("Contact Name", "emergencyContactName")}
                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Relationship</label>
                  <select
                    className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                  >
                    <option value="">Select relationship</option>
                    {["Father", "Mother", "Husband", "Wife", "Brother", "Sister", "Other"].map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
                {renderInput("Emergency Phone", "emergencyContactPhone")}

                {/* SECTION: Socials & Photo */}
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 mt-4">
                    <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider"><FaFacebook /> Social Profiles</h3>
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300"><FaFacebook className="text-blue-600"/> Facebook</label>
                  <input className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.facebookProfile} onChange={(e) => setFormData({...formData, facebookProfile: e.target.value})} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300"><FaLinkedin className="text-blue-700"/> LinkedIn</label>
                  <input className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.linkedinProfile} onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})} />
                </div>
                
                <div className="md:col-span-4 border-b dark:border-gray-700 pb-2 mt-4">
                  <h3 className="font-bold text-accent flex items-center gap-2 uppercase tracking-wider">
                    <FaUniversity /> Bank Account Details
                  </h3>
                </div>

                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Bank Name</label>
                  <select 
                    className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={formData.bankInfo.bankName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo, bankName: e.target.value }
                    })}
                  >
                    <option value="">Select Bank</option>
                    {bankList.map((bank, index) => (
                      <option key={index} value={bank.name}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label-text font-bold mb-1 flex items-center gap-2 dark:text-gray-300">
                    <FaCreditCard className="text-gray-400" /> Account Number
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123.105.4567" 
                    className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.bankInfo.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo, accountNumber: e.target.value }
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Branch Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Motijheel Branch" 
                    className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.bankInfo.branch}
                    onChange={(e) => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo, branch: e.target.value }
                    })}
                  />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-1 dark:text-gray-300">Routing Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 020264567" 
                    className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.bankInfo.routingNumber}
                    onChange={(e) => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo, routingNumber: e.target.value }
                    })}
                  />
                </div>
                
                <div className="md:col-span-4 bg-base-200/50 dark:bg-gray-700/50 p-6 rounded-2xl mt-4 border dark:border-gray-700">
                  <ImageUpload label="Employee Photograph" setImageUrl={(url) => setFormData({...formData, employeePhoto: url})} />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-3 mt-10 border-t dark:border-gray-700 pt-8">
                <button type="button" className="btn btn-ghost px-8 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Discard</button>
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