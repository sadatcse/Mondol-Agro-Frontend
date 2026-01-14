

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { useAttendance } from "../../Hook/useAttendance";
import SkeletonLoader from "../../components/SkeletonLoader";
import { 
  FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, 
  FaExclamationTriangle, FaCalendarAlt, FaCoffee 
} from "react-icons/fa";

const Attendence = () => {
  const { employeeProfile, loading: authLoading } = useContext(AuthContext);
  const { getMyAttendanceHistory, loading } = useAttendance();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [data, setData] = useState({ stats: {}, records: [] });

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have a valid employee profile ID
      if (employeeProfile?._id) {
        const result = await getMyAttendanceHistory(employeeProfile._id, selectedDate);
        if (result) {
          setData(result);
        }
      }
    };
    fetchData();
  }, [employeeProfile, selectedDate, getMyAttendanceHistory]);

  // Helper to get day name
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString("default", { weekday: "short" }),
      full: date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present": return "text-green-600 bg-green-50 border-green-200";
      case "Absent": return "text-red-600 bg-red-50 border-red-200";
      case "Late": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Half Day": return "text-orange-600 bg-orange-50 border-orange-200";
      case "On Leave": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Holiday": return "text-purple-600 bg-purple-50 border-purple-200";
      case "Weekend": return "text-slate-500 bg-slate-100 border-slate-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  if (authLoading) return <div className="p-10"><SkeletonLoader /></div>;

  if (!employeeProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-8 rounded-full mb-4">
          <FaExclamationTriangle className="text-4xl text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">Your user account is not linked to an employee profile.</p>
        <p className="text-sm text-slate-400">Please contact HR to map your account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F0FDF9] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <FaCalendarCheck className="text-green-600" /> My Attendance
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            History for {employeeProfile.name}
          </p>
        </div>
        
        {/* Month Filter */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <input 
            type="month" 
            className="input input-sm focus:outline-none focus:border-transparent font-bold text-slate-600"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard 
          icon={<FaCheckCircle />} 
          title="Present" 
          value={data.stats.present || 0} 
          color="text-green-600 bg-green-100" 
        />
        <StatCard 
          icon={<FaClock />} 
          title="Late" 
          value={data.stats.late || 0} 
          color="text-orange-500 bg-orange-100" 
        />
        <StatCard 
          icon={<FaTimesCircle />} 
          title="Absent" 
          value={data.stats.absent || 0} 
          color="text-red-500 bg-red-100" 
        />
        <StatCard 
          icon={<FaCoffee />} 
          title="Half Day" 
          value={data.stats.halfDay || 0} 
          color="text-yellow-600 bg-yellow-100" 
        />
        <StatCard 
          icon={<FaCalendarAlt />} 
          title="Leaves" 
          value={data.stats.leave || 0} 
          color="text-blue-500 bg-blue-100" 
        />
      </div>

      {/* Timeline / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Detailed Log</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="text-xs text-slate-400 uppercase font-bold bg-slate-50">
              <tr>
                <th className="pl-6 py-4">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="6"><SkeletonLoader /></td></tr>
              ) : data.records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 italic">
                    No attendance records found for this month.
                  </td>
                </tr>
              ) : (
                data.records.map((record) => {
                  const dateInfo = formatDate(record.date);
                  return (
                    <tr key={record._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border font-bold ${
                            ['Weekend', 'Holiday'].includes(record.status) ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-slate-700 border-slate-200'
                          }`}>
                            <span className="text-[10px] uppercase leading-none">{dateInfo.weekday}</span>
                            <span className="text-lg leading-none">{dateInfo.day}</span>
                          </div>
                          <span className="text-slate-500 font-medium hidden md:inline-block">{dateInfo.full}</span>
                        </div>
                      </td>
                      
                      <td className="font-mono text-slate-600">
                        {record.checkIn ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{record.checkIn}</span>
                        ) : "--:--"}
                      </td>
                      
                      <td className="font-mono text-slate-600">
                        {record.checkOut ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{record.checkOut}</span>
                        ) : "--:--"}
                      </td>

                      <td className="font-bold text-slate-400 text-xs">
                        {record.overtimeHours ? <span className="text-blue-600">+{record.overtimeHours} hrs OT</span> : "-"}
                      </td>

                      <td>
                        <div className={`badge badge-lg border ${getStatusColor(record.status)} font-bold text-xs`}>
                          {record.status}
                        </div>
                      </td>

                      <td className="max-w-[200px] truncate text-slate-400 italic text-xs">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Mini Component for Stats
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full text-lg ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-black text-slate-700">{value}</div>
      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{title}</div>
    </div>
  </div>
);

export default Attendence;