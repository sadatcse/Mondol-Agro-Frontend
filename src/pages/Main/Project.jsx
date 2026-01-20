import React, { useState, useEffect, useCallback } from "react";
import { useCompany } from "../../Hook/useCompany";
import { useEmployee } from "../../Hook/useEmployee";
import { useProject } from "../../Hook/useProject";
import { useClient } from "../../Hook/useClient"; 
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaProjectDiagram,
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMoneyBillWave 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Project = () => {
  // Hooks
  const { getPaginatedProjects, createProject, updateProject, removeProject, loading: projectLoading } = useProject();
  const { getAllCompanies } = useCompany();
  const { getAllEmployees } = useEmployee();
  const { getAllClients } = useClient();

  // Local Data States
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    company: "", client: "", projectCode: "", projectName: "",
    projectType: "Fixed Price", description: "", startDate: "",
    endDate: "", estimatedDurationDays: 0, currency: "BDT",
    estimatedBudget: 0, actualCost: 0, hourlyRate: 0,
    status: "Planned", progressPercentage: 0, priority: "Medium",
    projectManager: "", assignedEmployees: [], billingStatus: "Unbilled",
    paymentStatus: "Pending", risks: "", notes: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // --- FETCHING LOGIC ---
  const loadDependencies = useCallback(async () => {
    const [compData, clientData, empData] = await Promise.all([
      getAllCompanies(), getAllClients(), getAllEmployees()
    ]);
    if (compData) setCompanies(compData);
    if (clientData) setClients(clientData);
    if (empData) setEmployees(empData);
  }, [getAllCompanies, getAllClients, getAllEmployees]);

  const loadProjects = useCallback(async () => {
    const data = await getPaginatedProjects({ page: currentPage, limit: itemsPerPage, search: searchTerm });
    if (data) {
      setProjects(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedProjects, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadDependencies(); }, [loadDependencies]);

  // --- ACTIONS ---
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingId(project._id);
      setFormData({
        ...project,
        company: project.company?._id || project.company || "",
        client: project.client?._id || project.client || "",
        projectManager: project.projectManager?._id || project.projectManager || "",
        assignedEmployees: project.assignedEmployees?.map(e => e._id || e) || [],
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
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
        await updateProject(editingId, formData);
        toast.success("Project updated successfully");
      } else {
        await createProject(formData);
        toast.success("Project created successfully");
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Confirm Delete",
      text: "Permanent removal of project data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#EF4444",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await removeProject(id);
        toast.success("Deleted");
        loadProjects();
      }
    });
  };

  // Helper for status badge colors
  const getStatusBadge = (status) => {
    switch(status) {
        case "Completed": return "badge-success text-white";
        case "In Progress": return "badge-info text-white";
        case "On Hold": return "badge-warning";
        default: return "badge-ghost";
    }
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaProjectDiagram className="text-primary" /> Projects
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium font-sans italic text-sm">Lifecycle & Budget Management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg mt-4 md:mt-0">
          <FaPlus /> New Project
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 transition-colors">
        <div className="p-4 bg-base-50/50 dark:bg-gray-700/30">
            <TableControls 
                itemsPerPage={itemsPerPage} 
                onItemsPerPageChange={(e) => setItemsPerPage(e.target.value)} 
                searchTerm={searchTerm} 
                onSearchChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 dark:bg-gray-700/50 text-secondary dark:text-gray-200 uppercase text-[10px] tracking-widest border-b dark:border-gray-600">
              <tr>
                <th>Project / Code</th>
                <th>Company & Client</th>
                <th>Progress</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectLoading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 opacity-50 font-bold dark:text-gray-400">No projects found.</td></tr>
              ) : projects.map((p) => (
                <tr key={p._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b border-base-200 dark:border-gray-700">
                  <td>
                    <div className="font-bold text-secondary dark:text-white">{p.projectName}</div>
                    <div className="text-[10px] font-mono text-primary">{p.projectCode}</div>
                  </td>
                  <td>
                    <div className="text-xs font-bold text-neutral-600 dark:text-gray-300 truncate max-w-[150px]">{p.company?.companyName}</div>
                    <div className="text-[10px] opacity-60 italic dark:text-gray-400">{p.client?.name}</div>
                  </td>
                  <td className="w-1/4">
                    <div className="flex justify-between text-[10px] mb-1 font-bold dark:text-gray-300"><span>{p.progressPercentage}%</span></div>
                    <progress className="progress progress-primary w-full h-1.5 bg-gray-200 dark:bg-gray-600" value={p.progressPercentage} max="100"></progress>
                  </td>
                  <td>
                    <div className={`badge badge-sm font-bold text-[9px] uppercase ${getStatusBadge(p.status)}`}>{p.status}</div>
                  </td>
                  <td className="text-center">
                    <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(p)} className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 dark:hover:bg-blue-900/30"><FaEdit /></button>
                        <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-ghost text-error hover:bg-error/10 dark:hover:bg-red-900/30"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-base-50 dark:bg-gray-800 border-t dark:border-gray-700 transition-colors">
           <span className="text-xs font-medium opacity-60 dark:text-gray-400 mb-2 md:mb-0">Showing {projects.length} of {totalItems}</span>
           <div className="join">
              <button className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><FaChevronLeft/></button>
              <button className="join-item btn btn-xs bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4">{currentPage}</button>
              <button className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => p+1)} disabled={currentPage >= totalPages}><FaChevronRight/></button>
           </div>
        </div>
      </div>

      {/* FORM MODAL - Expanded with Dates & Details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 dark:bg-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col border-t-8 border-primary transition-colors shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-black text-secondary dark:text-white flex items-center gap-2"> <FaProjectDiagram/> {editingId ? "Update Project" : "New Project"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm dark:text-gray-300 dark:hover:bg-gray-600"><FaTimes/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
              
              {/* Row 1: Basic Info */}
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Project Name *</label>
                <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Project Code *</label>
                <input required className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono" value={formData.projectCode} onChange={e => setFormData({...formData, projectCode: e.target.value})} placeholder="e.g. PRJ-2024-001" />
              </div>

              {/* Row 2: Relationships */}
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Company *</label>
                <select required className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Client *</label>
                <select required className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})}>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Row 3: Management */}
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Project Manager</label>
                <select className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.projectManager} onChange={e => setFormData({...formData, projectManager: e.target.value})}>
                  <option value="">Assign PM</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name || e.firstName + ' ' + e.lastName}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Priority</label>
                <select className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>

              {/* Row 4: Dates & Status */}
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300 flex items-center gap-2"><FaCalendarAlt/> Start Date</label>
                <input type="date" className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300 flex items-center gap-2"><FaCalendarAlt/> End Date</label>
                <input type="date" className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>

              {/* Row 5: Financials */}
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300 flex items-center gap-2"><FaMoneyBillWave/> Budget ({formData.currency})</label>
                <input type="number" className="input input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.estimatedBudget} onChange={e => setFormData({...formData, estimatedBudget: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Status</label>
                <select className="select select-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Planned</option><option>In Progress</option><option>On Hold</option><option>Completed</option>
                </select>
              </div>

              {/* Row 6: Progress Bar Control */}
              <div className="form-control md:col-span-2">
                 <label className="label-text font-bold mb-1 dark:text-gray-300">Progress ({formData.progressPercentage}%)</label>
                 <input type="range" min="0" max="100" value={formData.progressPercentage} onChange={e => setFormData({...formData, progressPercentage: e.target.value})} className="range range-primary range-sm" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" className="btn btn-ghost dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-10 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;