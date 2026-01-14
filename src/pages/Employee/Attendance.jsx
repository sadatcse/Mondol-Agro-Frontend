import React, { useState, useEffect, useCallback } from "react";
import { useAttendance } from "../../Hook/useAttendance";
import { useEmployee } from "../../Hook/useEmployee";
import { useDepartment } from "../../Hook/useDepartment";
import SkeletonLoader from "../../components/SkeletonLoader";
import { 
  FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaUserFriends, FaArrowLeft, FaClock
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Attendance = () => {
  const { 
    getPaginatedAttendances, 
    removeAttendance, 
    bulkCreateAttendance, 
    createAttendance, 
    updateAttendance, 
    loading: attendanceLoading 
  } = useAttendance();
  
  const { getAllEmployees } = useEmployee();
  const { getAllDepartments } = useDepartment();

  // View state: 'dashboard', 'add', 'bulk', 'edit'
  const [view, setView] = useState("dashboard");
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState("All Departments");

  // --- Load Data ---
  const loadDashboard = useCallback(async () => {
    const params = { date: selectedDate };
    if (deptFilter !== "All Departments") params.department = deptFilter;

    const [data, empData, deptData] = await Promise.all([
      getPaginatedAttendances(params),
      getAllEmployees(),
      getAllDepartments()
    ]);

    if (data) {
      setAttendances(data.data);
      setStats({
        present: data.data.filter(a => a.status === "Present").length,
        absent: data.data.filter(a => a.status === "Absent").length,
        late: data.data.filter(a => a.status === "Late").length,
        total: empData?.length || 0
      });
    }
    if (empData) setEmployees(empData);
    if (deptData) setDepartments(deptData);
  }, [getPaginatedAttendances, getAllEmployees, getAllDepartments, selectedDate, deptFilter]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // --- Helpers ---
  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "0h";
    const start = new Date(`2000/01/01 ${inTime}`);
    const end = new Date(`2000/01/01 ${outTime}`);
    const diff = (end - start) / 1000 / 60 / 60;
    return diff > 0 ? `${diff.toFixed(2)}h` : "0h";
  };

  const handleEditClick = (attendance) => {
    setSelectedAttendance(attendance);
    setView("edit");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await removeAttendance(id);
        toast.success("Record deleted");
        loadDashboard();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- Dashboard View Component ---
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 text-blue-600" },
          { label: "Present", value: stats.present, color: "bg-green-50 text-green-600" },
          { label: "Absent", value: stats.absent, color: "bg-red-50 text-red-600" },
          { label: "Late", value: stats.late, color: "bg-orange-50 text-orange-600" },
          { label: "Half Day", value: 0, color: "bg-cyan-50 text-cyan-600" },
          { label: "On Leave", value: 0, color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border border-base-300 ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="flex gap-2 items-center border rounded-lg px-3 py-2 bg-white">
          <FaCalendarAlt className="text-neutral-400" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="select select-bordered select-sm" 
            value={deptFilter} 
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option>All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <button onClick={() => setView("bulk")} className="btn btn-sm btn-outline gap-2">
            <FaUserFriends /> Bulk Entry
          </button>
          <button onClick={() => setView("add")} className="btn btn-sm btn-primary text-white gap-2">
            <FaPlus /> Add Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        {attendanceLoading ? <SkeletonLoader /> : (
          <table className="table w-full">
            <thead className="bg-base-100">
              <tr className="text-xs uppercase">
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => (
                <tr key={att._id} className="hover:bg-base-50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-white rounded-full w-8">
                          <span>{att.employee?.name?.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{att.employee?.name}</div>
                        <div className="text-[10px] opacity-50">{att.employee?.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{att.department}</td>
                  <td className="text-sm font-mono">{att.checkIn || '--:--'}</td>
                  <td className="text-sm font-mono">{att.checkOut || '--:--'}</td>
                  <td className="text-sm font-mono">{calculateHours(att.checkIn, att.checkOut)}</td>
                  <td>
                    <span className={`badge badge-sm font-bold ${att.status === 'Present' ? 'badge-success' : att.status === 'Late' ? 'badge-warning' : 'badge-error'} badge-outline`}>
                      {att.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(att)} className="btn btn-ghost btn-xs text-info">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(att._id)} className="btn btn-ghost btn-xs text-error">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {attendances.length === 0 && (
                <tr><td colSpan="7" className="text-center py-10 opacity-50">No records found for this date.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // --- Bulk View Component ---
  const BulkEntryView = () => {
    const [bulkData, setBulkData] = useState(employees.map(emp => ({
      employee: emp._id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department || "General",
      checkIn: "09:00",
      checkOut: "17:00",
      status: "Present",
      overtimeHours: 0
    })));

    const applyToAll = (field, value) => {
      setBulkData(prev => prev.map(item => ({ ...item, [field]: value })));
      toast.success(`Set all ${field} to ${value}`);
    };

    const updateRow = (idx, field, value) => {
      const newData = [...bulkData];
      newData[idx][field] = value;
      setBulkData(newData);
    };

    const handleBulkSave = async () => {
      try {
        const payload = bulkData.map(item => ({ ...item, date: selectedDate }));
        await bulkCreateAttendance(payload);
        toast.success("Bulk records saved!");
        setView("dashboard");
        loadDashboard();
      } catch (err) { toast.error("Failed to save data"); }
    };

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("dashboard")} className="btn btn-circle btn-ghost btn-sm"><FaArrowLeft /></button>
            <h2 className="text-2xl font-bold">Bulk Attendance Entry</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[10px] font-black uppercase text-blue-500 mr-2">Bulk Apply:</span>
            <input type="time" className="input input-bordered input-sm" onChange={(e) => applyToAll('checkIn', e.target.value)} />
            <input type="time" className="input input-bordered input-sm" onChange={(e) => applyToAll('checkOut', e.target.value)} />
            <select className="select select-bordered select-sm font-bold" onChange={(e) => applyToAll('status', e.target.value)}>
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
              <option>Half Day</option>
              <option>On Leave</option>
              <option>Holiday</option>
              <option>Weekend</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr className="text-neutral-500">
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>OT</th>
              </tr>
            </thead>
            <tbody>
              {bulkData.map((row, idx) => (
                <tr key={idx} className="border-b border-base-100 hover:bg-base-50">
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{row.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold leading-none">{row.name}</p>
                        <span className="text-[10px] opacity-50">{row.employeeId}</span>
                      </div>
                    </div>
                  </td>
                  <td><input type="time" className="input input-bordered input-sm w-32" value={row.checkIn} onChange={(e) => updateRow(idx, 'checkIn', e.target.value)} /></td>
                  <td><input type="time" className="input input-bordered input-sm w-32" value={row.checkOut} onChange={(e) => updateRow(idx, 'checkOut', e.target.value)} /></td>
                  <td>
                    <select className="select select-bordered select-sm" value={row.status} onChange={(e) => updateRow(idx, 'status', e.target.value)}>
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Late</option>
                      <option>Half Day</option>
                      <option>On Leave</option>
                      <option>Holiday</option>
                      <option>Weekend</option>
                    </select>
                  </td>
                  <td><input type="number" className="input input-bordered input-sm w-16" value={row.overtimeHours} onChange={(e) => updateRow(idx, 'overtimeHours', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={handleBulkSave} className="btn btn-primary px-8">Save All {bulkData.length} Records</button>
          <button onClick={() => setView("dashboard")} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    );
  };

  // --- Add Entry View Component ---
  const AddEntryView = () => {
    const [formData, setFormData] = useState({
        employee: "",
        date: selectedDate,
        status: "Present",
        checkIn: "09:00",
        checkOut: "17:00",
        notes: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee) return toast.error("Select an employee");
        try {
            const emp = employees.find(ex => ex._id === formData.employee);
            await createAttendance({ ...formData, department: emp.department });
            toast.success("Record added");
            setView("dashboard");
            loadDashboard();
        } catch (err) { toast.error("Error saving record"); }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border mt-10">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView("dashboard")} className="btn btn-circle btn-ghost btn-sm"><FaArrowLeft /></button>
            <h2 className="text-2xl font-bold">Add Single Entry</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label-text font-bold mb-2">Employee *</label>
              <select className="select select-bordered w-full" required value={formData.employee} onChange={(e) => setFormData({...formData, employee: e.target.value})}>
                <option value="">— Select Employee —</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label-text font-bold mb-2">Date</label>
                <input type="date" className="input input-bordered" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-2">Status</label>
                <select className="select select-bordered" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Late</option>
                  <option>Half Day</option>
                  <option>On Leave</option>
                  <option>Holiday</option>
                  <option>Weekend</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label-text font-bold mb-2">Check In</label>
                <input type="time" className="input input-bordered" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label-text font-bold mb-2">Check Out</label>
                <input type="time" className="input input-bordered" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
              </div>
            </div>
            <div className="form-control">
              <label className="label-text font-bold mb-2">Notes</label>
              <textarea className="textarea textarea-bordered h-24" placeholder="Optional notes..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary px-10">Save Entry</button>
              <button type="button" onClick={() => setView("dashboard")} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
    );
  };

  // --- Edit Entry View Component ---
  const EditEntryView = () => {
    const [formData, setFormData] = useState({
      status: selectedAttendance?.status || "Present",
      checkIn: selectedAttendance?.checkIn || "09:00",
      checkOut: selectedAttendance?.checkOut || "17:00",
      notes: selectedAttendance?.notes || ""
    });

    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        await updateAttendance(selectedAttendance._id, formData);
        toast.success("Attendance updated successfully");
        setView("dashboard");
        loadDashboard();
      } catch (err) {
        toast.error("Failed to update record");
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border mt-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("dashboard")} className="btn btn-circle btn-ghost btn-sm">
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Edit Attendance</h2>
            <p className="text-sm text-neutral-500">
              Editing record for: <span className="font-bold">{selectedAttendance?.employee?.name}</span>
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleUpdate}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label-text font-bold mb-2">Status</label>
              <select 
                className="select select-bordered" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
                <option>Half Day</option>
                <option>On Leave</option>
                <option>Holiday</option>
                <option>Weekend</option>
              </select>
            </div>
            <div className="form-control">
               <label className="label-text font-bold mb-2">Date (Read Only)</label>
               <input type="text" className="input input-bordered bg-base-200" value={selectedAttendance?.date?.split('T')[0]} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label-text font-bold mb-2">Check In</label>
              <input 
                type="time" 
                className="input input-bordered" 
                value={formData.checkIn} 
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})} 
              />
            </div>
            <div className="form-control">
              <label className="label-text font-bold mb-2">Check Out</label>
              <input 
                type="time" 
                className="input input-bordered" 
                value={formData.checkOut} 
                onChange={(e) => setFormData({...formData, checkOut: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label-text font-bold mb-2">Notes</label>
            <textarea 
              className="textarea textarea-bordered h-24" 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary px-10">Update Changes</button>
            <button type="button" onClick={() => setView("dashboard")} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-secondary">Attendance</h1>
        <p className="text-sm text-neutral-400">Manage daily logs and bulk entries</p>
      </div>
      
      {view === "dashboard" && <DashboardView />}
      {view === "bulk" && <BulkEntryView />}
      {view === "add" && <AddEntryView />}
      {view === "edit" && <EditEntryView />}
    </div>
  );
};

export default Attendance;