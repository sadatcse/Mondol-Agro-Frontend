import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEmployee } from "../../Hook/useEmployee";
import { useDepartment } from "../../Hook/useDepartment";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { FaPrint, FaEye, FaTimes, FaFilter, FaUsers, FaFileExcel } from "react-icons/fa";

// 1. IMPORTS FOR PRINT & EXCEL
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

// --- PRINTABLE COMPONENT (Forced White Background) ---
const PrintableDirectory = React.forwardRef(({ employees, companyMap }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black print-container w-full">
      <div className="mb-6 border-b border-black pb-4">
        <h1 className="text-3xl font-bold text-black">Employee Directory Report</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {Object.keys(companyMap).length > 0 ? (
        Object.keys(companyMap).map((companyName) => {
          const companyEmployees = employees.filter(e => (e.company?.companyName || "Unknown") === companyName);
          if (companyEmployees.length === 0) return null;

          return (
            <div key={companyName} className="mb-8 break-inside-avoid">
              <h2 className="text-xl font-bold bg-gray-100 text-black p-2 mb-2 border-l-4 border-black uppercase">
                {companyName} <span className="text-sm font-normal text-gray-600">({companyEmployees.length} Staff)</span>
              </h2>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="py-2 text-black font-bold">ID</th>
                    <th className="text-black font-bold">Name</th>
                    <th className="text-black font-bold">Department</th>
                    <th className="text-black font-bold">Designation</th>
                    <th className="text-black font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companyEmployees.map(emp => (
                    <tr key={emp._id} className="border-b border-gray-300">
                      <td className="py-2 text-xs text-gray-700">{emp.employeeId}</td>
                      <td className="font-semibold text-black">{emp.name}</td>
                      <td className="text-black">{emp.department}</td>
                      <td className="text-black">{emp.designation}</td>
                      <td className="text-black">{emp.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <p className="text-black">No data to display.</p>
      )}
      
      {/* Print Footer */}
      <div className="fixed bottom-0 w-full text-center text-xs text-gray-500">
        Confidential Employee Report - Internal Use Only
      </div>
    </div>
  );
});

// --- STAT CARD COMPONENT ---
const StatCard = ({ label, value, colorClass, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
    <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text', 'bg')}`}>
      <Icon className={`${colorClass} text-xl`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold text-slate-800 dark:text-white`}>{value}</p>
    </div>
  </div>
);

// --- DETAILS MODAL COMPONENT ---
const EmployeeDetailsModal = ({ employee, onClose }) => {
  return (
    <dialog id="view_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-800">
        {!employee ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
            <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
            <p>Loading Profile...</p>
          </div>
        ) : (
          <>
            <div className="bg-primary p-6 text-white flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="avatar placeholder">
                  <div className="bg-white/20 text-white rounded-full w-16 backdrop-blur-md">
                    <span className="text-xl font-bold">{employee.name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-2xl">{employee.name}</h3>
                  <p className="opacity-90 text-sm">{employee.designation} • {employee.employeeId}</p>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"><FaTimes /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 transition-colors">
              <DetailItem label="Email Address" value={employee.employeeEmail} />
              <DetailItem label="Phone Number" value={employee.employeePhone} />
              <DetailItem label="Department" value={employee.department} />
              <DetailItem label="Joining Date" value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'} />
              <DetailItem label="Location" value={employee.city} />
              <DetailItem label="Full Address" value={employee.employeeAddress} isFullWidth />
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

const DetailItem = ({ label, value, isFullWidth }) => (
  <div className={`${isFullWidth ? "col-span-full" : ""}`}>
    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block mb-1">{label}</span>
    <span className="text-sm text-slate-700 dark:text-gray-200 font-semibold">{value || "Not Provided"}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const Employeedirectory = () => {
  const { getDirectoryEmployees, loading } = useEmployee();
  const { getAllDepartments } = useDepartment();
  const axiosSecure = UseAxiosSecure();
  const componentRef = useRef();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [filterDept, setFilterDept] = useState("All Employees");
  const [filterStatus, setFilterStatus] = useState("Active");
  const [filterCompany, setFilterCompany] = useState("All Companies");
  const [todaysLeaves, setTodaysLeaves] = useState([]);

  // Fetch Data
  const loadData = useCallback(async () => {
    const [empData, deptData] = await Promise.all([
      getDirectoryEmployees({ status: filterStatus, department: filterDept }),
      getAllDepartments()
    ]);
    
    if (empData) setEmployees(empData);
    if (deptData) setDepartments(deptData);

    // Extract unique companies for filter
    const extractedCompanies = [];
    const map = new Map();
    empData.forEach(item => {
        if(item.company && !map.has(item.company._id)){
            map.set(item.company._id, true);
            extractedCompanies.push(item.company);
        }
    });
    setCompanies(extractedCompanies);

    try {
      const { data } = await axiosSecure.get('/attendance/todays-leaves');
      setTodaysLeaves(data.map(l => l.employee));
    } catch (err) { console.error("Leave fetch error", err); }
  }, [getDirectoryEmployees, getAllDepartments, filterStatus, filterDept, axiosSecure]);

  useEffect(() => { loadData(); }, [loadData]);

  // Calculations
  const stats = useMemo(() => {
    const deptMap = {};
    const companyMap = {};
    employees.forEach(emp => {
      const d = emp.department || "Unassigned";
      deptMap[d] = (deptMap[d] || 0) + 1;
      const c = emp.company?.companyName || "Unknown";
      companyMap[c] = (companyMap[c] || 0) + 1;
    });

    return {
      total: employees.length,
      active: employees.filter(e => e.status === "Active").length,
      onLeave: employees.filter(emp => todaysLeaves.includes(emp._id)).length,
      deptCount: departments.length,
      deptMap,
      companyMap
    };
  }, [employees, departments, todaysLeaves]);

  // Handlers
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Employee_Report_${new Date().toISOString().slice(0,10)}`,
  });

  const handleExportExcel = () => {
    const dataToExport = employees.map(emp => ({
        "ID": emp.employeeId,
        "Full Name": emp.name,
        "Company": emp.company?.companyName || "N/A",
        "Department": emp.department,
        "Designation": emp.designation,
        "Status": emp.status,
        "Email": emp.employeeEmail,
        "Phone": emp.employeePhone,
        "Joining Date": emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '',
        "City": emp.city
    }));

    dataToExport.sort((a, b) => (a.Company > b.Company) ? 1 : -1);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [{wch: 10}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 20}, {wch: 10}, {wch: 25}];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Employees");
    XLSX.writeFile(workbook, `Employee_Directory_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleViewDetails = async (id) => {
    setSelectedEmployee(null); 
    document.getElementById('view_modal').showModal(); 
    try {
      const { data } = await axiosSecure.get(`/employee/view-details/${id}`);
      setSelectedEmployee(data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-gray-900 min-h-screen font-sans text-slate-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* --- HIDDEN PRINT COMPONENT --- */}
      <div className="hidden">
        <PrintableDirectory 
            ref={componentRef} 
            employees={employees} 
            companyMap={stats.companyMap} 
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium">Manage and monitor your global workforce</p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
            <button 
                onClick={handleExportExcel}
                className="btn bg-green-600 hover:bg-green-700 text-white border-none shadow-lg gap-2"
            >
                <FaFileExcel /> Export Excel
            </button>
            <button 
                onClick={handlePrint}
                className="btn bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
                <FaPrint /> Print Report
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Staff" value={stats.total} colorClass="text-primary" icon={FaUsers} />
        <StatCard label="Active Now" value={stats.active} colorClass="text-secondary" icon={FaUsers} />
        <StatCard label="On Leave" value={stats.onLeave} colorClass="text-orange-500" icon={FaUsers} />
        <StatCard label="Departments" value={stats.deptCount} colorClass="text-blue-500" icon={FaUsers} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Filters & Table */}
        <div className="xl:col-span-2 space-y-6">
          {/* Enhanced Filter Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-wrap gap-4 items-end transition-colors">
            <div className="flex-1 min-w-[200px]">
              <label className="label-text text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Company</label>
              <select className="select select-bordered select-sm w-full mt-1 bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                <option>All Companies</option>
                {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label-text text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Department</label>
              <select className="select select-bordered select-sm w-full mt-1 bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option>All Employees</option>
                {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="w-40">
              <label className="label-text text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Status</label>
              <select className="select select-bordered select-sm w-full mt-1 bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Resigned</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden transition-colors">
            <table className="table w-full">
              <thead className="bg-slate-50/80 dark:bg-gray-700/50">
                <tr className="text-slate-500 dark:text-gray-300 text-[11px] uppercase tracking-wider">
                  <th className="py-4">Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-gray-700 rounded"></div></td>
                      <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-gray-700 rounded-full"></div></td>
                      <td className="p-4 text-right"><div className="h-8 w-16 bg-slate-200 dark:bg-gray-700 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 dark:bg-primary/20 text-primary rounded-lg w-10">
                              <span className="text-xs font-bold">{emp.name.substring(0,2).toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-gray-200">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm font-medium text-slate-600 dark:text-gray-400">{emp.department}</td>
                      <td>
                        <span className={`badge badge-sm font-bold border-none py-3 px-3 ${
                          emp.status === 'Active' 
                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-content' 
                            : 'bg-slate-100 text-slate-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button onClick={() => handleViewDetails(emp._id)} className="btn btn-ghost btn-sm text-primary hover:bg-primary/5 capitalize dark:hover:bg-gray-700">
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Breakdowns */}
        <div className="space-y-6">
          <BreakdownCard title="Department Distribution" data={stats.deptMap} />
          <BreakdownCard title="Company Distribution" data={stats.companyMap} />
        </div>
      </div>

      <EmployeeDetailsModal 
        employee={selectedEmployee} 
        onClose={() => document.getElementById('view_modal').close()} 
      />
    </div>
  );
};

// --- BREAKDOWN CARD ---
const BreakdownCard = ({ title, data }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm transition-colors">
    <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-5 tracking-widest flex justify-between items-center">
      {title}
      <FaFilter className="text-slate-300 dark:text-gray-600" />
    </h3>
    <div className="space-y-4">
      {Object.entries(data).map(([key, count]) => (
        <div key={key} className="group">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-600 dark:text-gray-300 font-semibold group-hover:text-primary transition-colors">{key}</span>
            <span className="text-xs font-black bg-slate-100 dark:bg-gray-700 px-2 py-1 rounded text-slate-500 dark:text-gray-400">{count}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((count / 10) * 100, 100)}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Employeedirectory;