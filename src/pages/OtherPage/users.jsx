import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../Hook/useUser";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEdit, FaUserShield, FaSave, FaTimes,
  FaUserTag, FaEnvelope, FaShieldAlt, FaKey,
  FaChevronLeft, FaChevronRight, FaCircle, FaLock
} from "react-icons/fa";
import toast from "react-hot-toast";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";

const Users = () => {
  const { getPaginatedUsers, updateUser, loading: userLoading } = useUser();

  // --- DATA STATES ---
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); 
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { email: "", role: "user", status: "active" };
  const initialPwForm = { newPassword: "", confirmPassword: "" };

  const [formData, setFormData] = useState(initialForm);
  const [pwData, setPwData] = useState(initialPwForm);

  // --- PASSWORD STRENGTH LOGIC ---
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-error", "bg-warning", "bg-info", "bg-success"];

  // --- FETCHING LOGIC ---
  const loadUsers = useCallback(async () => {
    const data = await getPaginatedUsers({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm 
    });
    if (data) {
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    }
  }, [getPaginatedUsers, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // --- ACTIONS ---
  const handleOpenEdit = (user) => {
    setModalMode("edit");
    setEditingId(user._id);
    setFormData({ email: user.email, role: user.role, status: user.status });
    setIsModalOpen(true);
  };

  const handleOpenPassword = (user) => {
    setModalMode("password");
    setEditingId(user._id);
    setPwData(initialPwForm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "edit") {
        await updateUser(editingId, formData);
        toast.success("User profile updated");
      } else {
        if (pwData.newPassword !== pwData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        // Admin override: sending new password directly to update route
        await updateUser(editingId, { password: pwData.newPassword });
        toast.success("Password reset successfully");
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaUserShield className="text-primary" /> Admin Panel
          </h1>
          <p className="text-neutral-500 font-medium text-sm">User Management & Password Overrides</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-4 border-b">
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
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Manage</th>
              </tr>
            </thead>
            <tbody>
              {userLoading ? (
                <tr><td colSpan="5"><SkeletonLoader /></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-primary/5 transition-colors border-b last:border-0">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8 text-xs font-bold">
                            <span>{u.email.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-secondary text-sm">{u.email}</div>
                          <div className="text-[10px] font-mono text-primary flex items-center gap-1 uppercase">
                             ID: {u._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-sm badge-outline uppercase text-[10px] font-bold">{u.role}</span></td>
                    <td>
                      <div className={`badge badge-sm gap-1 font-bold text-[10px] ${u.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                        <FaCircle size={6} /> {u.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="text-xs opacity-70">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenEdit(u)} className="btn btn-sm btn-ghost text-primary" title="Edit Profile">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleOpenPassword(u)} className="btn btn-sm btn-ghost text-orange-500" title="Reset Password">
                          <FaKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 flex justify-between items-center bg-base-50/50 border-t">
           <span className="text-xs font-medium opacity-60">Results: {totalItems}</span>
           <div className="join">
              <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
                <FaChevronLeft/>
              </button>
              <button className="join-item btn btn-xs bg-white pointer-events-none px-4">Page {currentPage}</button>
              <button className="join-item btn btn-xs" onClick={() => setCurrentPage(p => p+1)} disabled={currentPage >= totalPages}>
                <FaChevronRight/>
              </button>
           </div>
        </div>
      </div>

      {/* ANIMATED MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-base-100 rounded-3xl w-full max-w-md overflow-hidden flex flex-col border-t-8 border-primary shadow-2xl"
            >
              <div className="p-6 border-b flex justify-between items-center bg-base-50">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2"> 
                  {modalMode === "edit" ? <FaUserShield className="text-primary"/> : <FaLock className="text-orange-500"/>}
                  {modalMode === "edit" ? "Edit Permissions" : "Reset User Password"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm"><FaTimes/></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                {modalMode === "edit" ? (
                  <>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1">Target Account</label>
                      <input type="email" disabled className="input input-bordered bg-base-200" value={formData.email} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label-text font-bold mb-1">Access Role</label>
                        <select className="select select-bordered" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label-text font-bold mb-1">Account Status</label>
                        <select className="select select-bordered" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-2">
                        <p className="text-[11px] text-orange-700 font-medium">
                            As an admin, you are performing a forced password reset. The user will be required to use this new password immediately.
                        </p>
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1">Set New Password</label>
                      <input 
                        type="text" // Admin can see what they are typing for clarity, or change to "password"
                        required 
                        className="input input-bordered" 
                        placeholder="Enter secure password"
                        value={pwData.newPassword} 
                        onChange={e => setPwData({...pwData, newPassword: e.target.value})}
                      />
                      <div className="mt-3">
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div 
                              key={step} 
                              className={`flex-1 rounded-full transition-all ${step <= calculateStrength(pwData.newPassword) ? strengthColors[calculateStrength(pwData.newPassword)-1] : "bg-base-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold mb-1">Confirm New Password</label>
                      <input 
                        type="text" 
                        required 
                        className={`input input-bordered ${pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword ? "input-error" : ""}`} 
                        value={pwData.confirmPassword} 
                        onChange={e => setPwData({...pwData, confirmPassword: e.target.value})}
                      />
                      {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
                        <span className="text-error text-[10px] mt-1 font-bold">Passwords do not match!</span>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-6 flex justify-end gap-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>Discard</button>
                  <button type="submit" className="btn btn-primary px-10 text-white btn-sm gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : <FaSave />}
                    {modalMode === "edit" ? "Save Changes" : "Apply Reset"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;