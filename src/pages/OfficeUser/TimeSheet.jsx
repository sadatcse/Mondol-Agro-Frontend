import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { 
  FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaCheckCircle, 
  FaRegSave, FaClipboardList, FaCommentDots, FaLock, FaPaperPlane, FaTimes 
} from "react-icons/fa";

const TimeSheet = () => {
  // 1. GET DATA FROM GLOBAL CONTEXT
  const { user, employeeProfile, loading: authLoading } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  // --- STATES ---
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    date: new Date().toISOString().slice(0, 10),
    description: "",
    status: "Draft"
  };
  const [formData, setFormData] = useState(initialForm);

  // --- 2. FETCH TIMESHEETS ---
  const fetchTimesheets = useCallback(async () => {
    // Only fetch if we have the Employee ID from context
    if (!employeeProfile?._id) return;

    setLoading(true);
    try {
      // Calculate Start and End of selected Month
      const [year, month] = selectedMonth.split("-");
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      const { data } = await axiosSecure.get("/timesheet", {
        params: {
          employeeId: employeeProfile._id, // Filter by My ID
          startDate,
          endDate,
          limit: 100 // Get all entries for the month
        }
      });
      setTimesheets(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load timesheets");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, employeeProfile, selectedMonth]);

  // Trigger fetch when Profile is ready or Month changes
  useEffect(() => {
    if (employeeProfile) {
      fetchTimesheets();
    }
  }, [employeeProfile, fetchTimesheets]);

  // --- HANDLERS ---

  const handleOpenModal = (item = null) => {
    if (item) {
      // EDIT MODE VALIDATION
      if (item.remarksDescription) {
        toast.error("Locked: Manager has already reviewed this entry.");
        return;
      }
      setEditingId(item._id);
      setFormData({
        date: new Date(item.date).toISOString().slice(0, 10),
        description: item.description,
        status: item.status
      });
    } else {
      // CREATE MODE
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id, remarks) => {
    // DELETE MODE VALIDATION
    if (remarks) {
      toast.error("Locked: Cannot delete reviewed entries.");
      return;
    }

    Swal.fire({
      title: "Delete Entry?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/timesheet/delete/${id}`);
          toast.success("Entry deleted");
          fetchTimesheets();
        } catch (err) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleSubmit = async (e, submissionStatus) => {
    e.preventDefault();
    if (!employeeProfile) return toast.error("Employee profile missing.");

    setIsSubmitting(true);

    const payload = {
      ...formData,
      status: submissionStatus, // 'Draft' or 'Submit'
      employee: employeeProfile._id,
      employeeName: employeeProfile.name,
      employeeEmail: employeeProfile.employeeEmail
    };

    try {
      if (editingId) {
        await axiosSecure.put(`/timesheet/update/${editingId}`, payload);
        toast.success(submissionStatus === 'Draft' ? "Draft Updated" : "Timesheet Submitted");
      } else {
        await axiosSecure.post("/timesheet/post", payload);
        toast.success(submissionStatus === 'Draft' ? "Saved to Drafts" : "Timesheet Submitted");
      }
      setIsModalOpen(false);
      fetchTimesheets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HELPER FOR UI ---
  const getStatusBadge = (status, remarks) => {
    if (remarks) return <span className="badge badge-success gap-1 p-3 text-white font-bold"><FaCheckCircle/> Reviewed</span>;
    if (status === "Submit") return <span className="badge badge-info gap-1 p-3 text-white font-bold"><FaPaperPlane/> Submitted</span>;
    return <span className="badge badge-ghost gap-1 p-3 bg-base-300 font-bold"><FaRegSave/> Draft</span>;
  };

  // --- RENDER ---
  
  // 1. Loading State (Waiting for AuthContext)
  if (authLoading) return <div className="p-10 text-center"><span className="loading loading-bars loading-lg text-primary"></span></div>;

  // 2. Error State (User logged in but no Employee Profile)
  if (!employeeProfile) {
      return (
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <FaLock className="text-4xl text-neutral-300 mb-4"/>
            <h3 className="text-xl font-bold text-neutral-500">Access Restricted</h3>
            <p className="text-neutral-400">No linked employee profile found for {user?.email}.</p>
        </div>
      );
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaClipboardList className="text-primary" /> Daily Timesheet
          </h1>
          <p className="text-neutral-500 font-medium text-sm mt-1">
             Employee: <span className="font-bold text-secondary">{employeeProfile.name}</span> ({employeeProfile.designation})
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Month Filter */}
          <div className="form-control">
            <label className="label-text text-[10px] font-black uppercase mb-1 text-neutral-400">Filter Month</label>
            <input 
              type="month" 
              className="input input-bordered input-sm font-bold text-secondary"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all h-auto py-3 px-6"
          >
            <FaPlus /> Log Time
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-100 text-secondary uppercase text-[11px] tracking-wider border-b border-base-300">
                <th className="py-4 pl-6 w-32">Date</th>
                <th className="py-4">Activity Description</th>
                <th className="py-4 w-32">Status</th>
                <th className="py-4 w-64">Remarks</th>
                <th className="py-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-10"><span className="loading loading-dots loading-lg text-primary"></span></td></tr>
              ) : timesheets.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="text-center py-12 flex flex-col items-center opacity-50">
                     <FaCalendarAlt className="text-4xl mb-2"/>
                     <span className="font-bold">No timesheets found for {selectedMonth}</span>
                   </td>
                 </tr>
              ) : (
                timesheets.map((item) => (
                  <tr key={item._id} className="hover:bg-base-50 transition-colors border-b border-base-100 last:border-none">
                    <td className="pl-6 font-bold text-secondary align-top pt-4">
                      <div className="flex flex-col">
                        <span className="text-2xl leading-none">{new Date(item.date).getDate()}</span>
                        <span className="text-[10px] text-neutral-400 uppercase font-black tracking-wider">
                            {new Date(item.date).toLocaleString('default', { month: 'short', weekday: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="pt-4 align-top">
                      <p className="whitespace-pre-wrap text-sm text-neutral-600 leading-relaxed font-medium">{item.description}</p>
                    </td>
                    <td className="pt-4 align-top">
                      {getStatusBadge(item.status, item.remarksDescription)}
                    </td>
                    <td className="pt-4 align-top">
                      {item.remarksDescription ? (
                        <div className="bg-warning/10 p-3 rounded-lg border border-warning/20 text-xs text-neutral-700 relative">
                           <div className="flex items-center gap-1 font-bold text-warning mb-1 text-[10px] uppercase">
                               <FaCommentDots/> Manager
                           </div>
                           {item.remarksDescription}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300 italic flex items-center gap-1"><FaTimes className="text-[10px]"/> No remarks</span>
                      )}
                    </td>
                    <td className="text-center pt-4 align-top">
                      {/* Logic: If Remarks exist, LOCKED. Else, Editable. */}
                      {!item.remarksDescription ? (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)} 
                            className="btn btn-sm btn-square btn-ghost text-info hover:bg-info/10 tooltip tooltip-left"
                            data-tip="Edit"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id, item.remarksDescription)} 
                            className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10 tooltip tooltip-left"
                            data-tip="Delete"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      ) : (
                        <div className="tooltip tooltip-left" data-tip="Locked by Manager">
                          <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-base-200 text-neutral-400">
                             <FaLock />
                          </div>
                        </div>
                      )}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col border-t-8 border-primary animate-in fade-in zoom-in duration-200">
            
            <div className="p-6 border-b flex justify-between items-center bg-base-50 rounded-t-2xl">
              <h2 className="text-xl font-black text-secondary flex items-center gap-2 uppercase tracking-tight">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>} 
                {editingId ? "Update Activity" : "New Daily Entry"}
              </h2>
              <button className="btn btn-circle btn-sm btn-ghost text-neutral-500 hover:text-error" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form className="p-8 space-y-6">
              
              <div className="form-control">
                <label className="label-text font-bold mb-1 text-secondary">Date</label>
                <input 
                  type="date" 
                  required 
                  className="input input-bordered w-full focus:border-primary font-bold text-secondary" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>

              <div className="form-control">
                <label className="label-text font-bold mb-1 text-secondary">Work Description</label>
                <textarea 
                  required
                  className="textarea textarea-bordered h-40 focus:border-primary text-base leading-relaxed custom-scrollbar" 
                  placeholder="- Worked on Login module&#10;- Fixed bug in CSS&#10;- Meeting with client"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                ></textarea>
              </div>

              <div className="alert bg-blue-50 text-blue-800 text-xs border border-blue-100 flex items-start gap-2 rounded-xl">
                <FaLock className="mt-0.5"/>
                <span><strong>Policy:</strong> If a manager adds remarks to this entry later, it will become permanently locked and you will not be able to edit or delete it.</span>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                
                {/* BUTTON: SAVE DRAFT */}
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, "Draft")} 
                  className="btn btn-neutral text-white px-6" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaRegSave/> Save Draft</>}
                </button>

                {/* BUTTON: SUBMIT */}
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, "Submit")} 
                  className="btn btn-primary text-white shadow-lg px-6" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaPaperPlane/> Submit Now</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSheet;