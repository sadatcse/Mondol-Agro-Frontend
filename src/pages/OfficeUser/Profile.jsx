import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider"; // Your AuthContext
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import ImageUpload from "../../config/ImageUploadcpanel";
import useDistricts from "../../Hook/useDistricts"; 
import { 
  FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, 
  FaFacebook, FaLinkedin, FaIdCard, FaBuilding, FaBriefcase, FaUserShield
} from "react-icons/fa";
import toast from "react-hot-toast";

const Profile = () => {
  // 1. Get User from Context
  const { user } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();
  const { districts } = useDistricts();

  // State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Data State
  const initialForm = {
    name: "",
    employeePhoto: "",
    fatherName: "",
    motherName: "",
    employeePhone: "",
    employeeAddress: "",
    city: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    facebookProfile: "",
    linkedinProfile: "",
    // Read-only fields from DB that we store to display in form
    employeeEmail: "", 
    designation: "",
    department: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- API FETCHING ---
const fetchProfile = useCallback(async () => {
    // Wait until user context is loaded and has an email
    if (!user || !user.email) return;

    setLoading(true);
    try {
      // CHANGE: Explicitly sending email in the URL
      const { data } = await axiosSecure.get(`/employee/my-profile?email=${user.email}`);
      setProfile(data);
    } catch (err) {
      console.error(err);
      if(err.response?.status === 404) {
          toast.error("Employee details not found for this email.");
      } else {
          toast.error("Could not load profile data.");
      }
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- HANDLERS ---
  const handleOpenModal = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        employeePhoto: profile.employeePhoto || "",
        fatherName: profile.fatherName || "",
        motherName: profile.motherName || "",
        employeePhone: profile.employeePhone || "",
        employeeAddress: profile.employeeAddress || "",
        city: profile.city || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactPhone: profile.emergencyContactPhone || "",
        emergencyContactRelation: profile.emergencyContactRelation || "",
        facebookProfile: profile.facebookProfile || "",
        linkedinProfile: profile.linkedinProfile || "",
        // Read only
        employeeEmail: profile.employeeEmail || user.email,
        designation: profile.designation || "",
        department: profile.department || ""
      });
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update using the Employee ID fetched from backend
      await axiosSecure.put(`/employee/update/${profile._id}`, formData);
      toast.success("Profile updated successfully!");
      setIsModalOpen(false);
      fetchProfile(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="p-6 bg-base-200 min-h-screen animate-pulse">
        <div className="h-48 bg-base-300 rounded-2xl mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-96 bg-base-300 rounded-2xl"></div>
           <div className="h-96 bg-base-300 rounded-2xl md:col-span-2"></div>
        </div>
      </div>
    );
  }

  // Fallback if user is logged in but no employee record exists
  if (!profile) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] text-center bg-base-200">
         <div className="bg-white p-10 rounded-3xl shadow-xl">
            <FaUserShield className="text-6xl text-error mb-4 mx-auto"/>
            <h2 className="text-2xl font-black text-secondary">Profile Not Found</h2>
            <p className="py-4 text-neutral-500 max-w-md">
                We found your account (<strong>{user?.email}</strong>), but there is no linked Employee record. 
                Please contact HR or your Administrator.
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-2">
            <FaUserTie className="text-primary" /> My Profile
          </h1>
          <p className="text-neutral-500 font-medium">Manage your personal information</p>
        </div>
        <button 
          onClick={handleOpenModal} 
          className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all mt-4 md:mt-0"
        >
          <FaEdit /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT CARD: IDENTITY */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-base-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            
            <div className="avatar relative z-10 mb-4">
              <div className="w-32 rounded-full ring-4 ring-white shadow-xl">
                {profile.employeePhoto ? (
                  <img src={profile.employeePhoto} alt="Profile" className="object-cover" />
                ) : (
                  <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-4xl font-bold">
                    {profile.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-2xl font-black text-secondary">{profile.name}</h2>
                <div className="badge badge-primary badge-outline mt-2 font-bold">{profile.designation || "Employee"}</div>
                
                <div className="mt-6 flex justify-center gap-3">
                    {profile.facebookProfile && (
                        <a href={profile.facebookProfile} target="_blank" rel="noreferrer" className="btn btn-circle btn-sm btn-ghost text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white"><FaFacebook /></a>
                    )}
                    {profile.linkedinProfile && (
                        <a href={profile.linkedinProfile} target="_blank" rel="noreferrer" className="btn btn-circle btn-sm btn-ghost text-blue-800 bg-blue-50 hover:bg-blue-800 hover:text-white"><FaLinkedin /></a>
                    )}
                </div>
            </div>
          </div>

          {/* COMPANY DETAILS (Read Only) */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-base-300">
             <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm mb-4">
                <FaBriefcase /> Employment Info
             </h3>
             <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-dashed border-base-200 pb-2">
                   <span className="text-neutral-400 font-bold">Company</span>
                   <span className="font-bold text-secondary text-right">{profile.company?.companyName || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-dashed border-base-200 pb-2">
                   <span className="text-neutral-400 font-bold">ID</span>
                   <span className="font-mono bg-base-200 px-2 rounded text-xs py-0.5">{profile.employeeId || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-dashed border-base-200 pb-2">
                   <span className="text-neutral-400 font-bold">Department</span>
                   <span className="font-bold text-secondary text-right">{profile.department || "N/A"}</span>
                </li>
                <li className="flex justify-between pb-1">
                   <span className="text-neutral-400 font-bold">Joining</span>
                   <span className="font-bold text-secondary text-right">
                     {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "N/A"}
                   </span>
                </li>
             </ul>
          </div>
        </div>

        {/* RIGHT CARD: DETAILS */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-base-300">
            <h3 className="font-bold text-secondary flex items-center gap-2 uppercase tracking-wider text-sm border-b pb-4 mb-6">
               <FaIdCard className="text-primary"/> Personal & Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
              <div className="form-control">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Email Address</label>
                <div className="flex items-center gap-3 text-secondary font-bold text-sm bg-base-50 p-3 rounded-lg border border-base-200">
                   <FaEnvelope className="text-primary"/> {profile.employeeEmail}
                </div>
              </div>
              
              <div className="form-control">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Phone Number</label>
                <div className="flex items-center gap-3 text-secondary font-bold text-sm bg-base-50 p-3 rounded-lg border border-base-200">
                   <FaPhone className="text-primary"/> {profile.employeePhone}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Father's Name</label>
                <div className="text-secondary font-bold">{profile.fatherName || "N/A"}</div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Mother's Name</label>
                <div className="text-secondary font-bold">{profile.motherName || "N/A"}</div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Permanent Address</label>
                <div className="flex items-start gap-2 text-secondary font-bold">
                   <FaMapMarkerAlt className="text-primary mt-1"/> 
                   <span>{profile.employeeAddress}, {profile.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-base-300">
            <h3 className="font-bold text-primary flex items-center gap-2 uppercase tracking-wider text-sm border-b pb-4 mb-6">
               <span className="bg-error/10 p-1.5 rounded-full"><FaPhone className="text-xs" /></span> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-base-50 p-4 rounded-xl border border-base-200">
                 <div className="text-[10px] text-neutral-400 font-black uppercase mb-1">Name</div>
                 <div className="font-bold text-secondary text-sm">{profile.emergencyContactName || "N/A"}</div>
               </div>
               <div className="bg-base-50 p-4 rounded-xl border border-base-200">
                 <div className="text-[10px] text-neutral-400 font-black uppercase mb-1">Relation</div>
                 <div className="font-bold text-secondary text-sm">{profile.emergencyContactRelation || "N/A"}</div>
               </div>
               <div className="bg-base-50 p-4 rounded-xl border border-base-200">
                 <div className="text-[10px] text-neutral-400 font-black uppercase mb-1">Phone</div>
                 <div className="font-bold text-secondary text-sm">{profile.emergencyContactPhone || "N/A"}</div>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-base-50">
              <div>
                  <h2 className="text-2xl font-black text-secondary flex items-center gap-2 uppercase tracking-tight">
                    <FaEdit className="text-primary"/> Update Profile
                  </h2>
                  <p className="text-xs text-neutral-500 font-bold mt-1">Updates are applied immediately</p>
              </div>
              <button className="btn btn-circle btn-ghost text-neutral-500 hover:text-error hover:bg-error/10" onClick={() => setIsModalOpen(false)}>
                  <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Photo Upload */}
                <div className="md:col-span-2 bg-base-200/50 p-6 rounded-2xl border border-dashed border-base-300">
                   <ImageUpload 
                     label="Upload Profile Photo" 
                     setImageUrl={(url) => setFormData({...formData, employeePhoto: url})} 
                   />
                </div>

                {/* Left Col */}
                <div className="space-y-4">
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">Full Name</label>
                        <input required className="input input-bordered focus:border-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label-text font-bold mb-1 text-neutral-400">Email (Read Only)</label>
                        <input readOnly className="input input-bordered bg-base-200 cursor-not-allowed font-medium text-neutral-500" value={formData.employeeEmail} />
                    </div>
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">Phone Number</label>
                        <input required className="input input-bordered focus:border-primary" value={formData.employeePhone} onChange={(e) => setFormData({...formData, employeePhone: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">Father's Name</label>
                        <input className="input input-bordered focus:border-primary" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">Mother's Name</label>
                        <input className="input input-bordered focus:border-primary" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
                    </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                     {/* Address */}
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">Address</label>
                        <input className="input input-bordered focus:border-primary" value={formData.employeeAddress} onChange={(e) => setFormData({...formData, employeeAddress: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label-text font-bold mb-1">City/District</label>
                        <select 
                            className="select select-bordered w-full focus:border-primary" 
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

                    {/* Emergency Section Block */}
                    <div className="bg-error/5 p-4 rounded-xl border border-error/10 mt-4">
                        <h4 className="font-bold text-error text-xs uppercase mb-3 flex items-center gap-2"><FaPhone /> Emergency Contact</h4>
                        <div className="space-y-3">
                            <input placeholder="Contact Name" className="input input-sm input-bordered w-full" value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
                            <input placeholder="Relationship" className="input input-sm input-bordered w-full" value={formData.emergencyContactRelation} onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})} />
                            <input placeholder="Phone Number" className="input input-sm input-bordered w-full" value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Social Media - Full Width */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                   <div className="form-control">
                       <label className="label-text font-bold mb-1 flex items-center gap-2"><FaFacebook className="text-blue-600"/> Facebook Profile</label>
                       <input className="input input-bordered focus:border-primary" placeholder="https://facebook.com/..." value={formData.facebookProfile} onChange={(e) => setFormData({...formData, facebookProfile: e.target.value})} />
                   </div>
                   <div className="form-control">
                       <label className="label-text font-bold mb-1 flex items-center gap-2"><FaLinkedin className="text-blue-700"/> LinkedIn Profile</label>
                       <input className="input input-bordered focus:border-primary" placeholder="https://linkedin.com/in/..." value={formData.linkedinProfile} onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})} />
                   </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                <button type="button" className="btn btn-ghost px-8" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-10 text-white shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;