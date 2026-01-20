import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useAttendance } from "../../Hook/useAttendance";
import { useDepartment } from "../../Hook/useDepartment";
import { useEmployee } from "../../Hook/useEmployee";
import { useCompany } from "../../Hook/useCompany";
import SkeletonLoader from "../../components/SkeletonLoader";
import { FaPrint, FaFileExcel } from "react-icons/fa";

const Attendancereport = () => {
  const { getAttendanceReport, loading } = useAttendance();
  const { getAllDepartments } = useDepartment();
  const { getAllEmployees } = useEmployee();
  const { getAllCompanies } = useCompany();

  // State
  const [reportData, setReportData] = useState({
    summary: {
      totalEmployees: 0,
      workingDays: 0,
      attendanceRate: 0,
      present: 0,
      absent: 0,
      late: 0,
    },
    tableData: [],
  });

  // Filters
  const [selectedDate, setSelectedDate] = useState("2026-01");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedEmp, setSelectedEmp] = useState("All Employees");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");

  // Dropdown Data
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Fetch Filters
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const deptRes = await getAllDepartments();
        if (deptRes) setDepartments(deptRes);

        const empRes = await getAllEmployees();
        setEmployees(Array.isArray(empRes) ? empRes : empRes.data || []);

        const compRes = await getAllCompanies();
        setCompanies(Array.isArray(compRes) ? compRes : compRes.data || []);
      } catch (error) {
        console.error("Error fetching filters", error);
      }
    };
    fetchOptions();
  }, [getAllDepartments, getAllEmployees, getAllCompanies]);

  // Fetch Report Data
  useEffect(() => {
    const fetchReport = async () => {
      const [year, month] = selectedDate.split("-");
      const data = await getAttendanceReport({
        month,
        year,
        department: selectedDept === "All Departments" ? "" : selectedDept,
        employee: selectedEmp === "All Employees" ? "" : selectedEmp,
        company: selectedCompany === "All Companies" ? "" : selectedCompany,
      });

      if (data) {
        setReportData(data);
      }
    };
    fetchReport();
  }, [selectedDate, selectedDept, selectedEmp, selectedCompany, getAttendanceReport]);

  const getMonthName = (dateStr) => {
    const date = new Date(dateStr + "-01");
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // --- PRINT FUNCTION ---
  const handlePrint = () => {
    window.print();
  };

  // --- EXPORT TO EXCEL FUNCTION ---
  const handleExport = () => {
    if (!reportData.tableData.length) return;

    // 1. Format the data for Excel
    const excelData = reportData.tableData.map((row) => ({
      "Employee Name": row.name,
      "Employee ID": row.employeeId,
      Department: row.department,
      Present: row.present,
      Absent: row.absent,
      Late: row.late,
      "Half Day": row.halfDay,
      "Leave Records": row.leave,
      "Attendance Rate (%)": `${row.attendanceRate}%`,
    }));

    // 2. Add Summary Row at the bottom
    excelData.push({
      "Employee Name": "TOTAL",
      "Employee ID": "",
      Department: "",
      Present: reportData.summary.present,
      Absent: reportData.summary.absent,
      Late: reportData.summary.late,
      "Half Day": reportData.tableData.reduce((acc, curr) => acc + curr.halfDay, 0),
      "Leave Records": reportData.tableData.reduce((acc, curr) => acc + curr.leave, 0),
      "Attendance Rate (%)": `${reportData.summary.attendanceRate}%`,
    });

    // 3. Create Worksheet and Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    // 4. Trigger Download
    XLSX.writeFile(workbook, `Attendance_Report_${selectedDate}.xlsx`);
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-300 print:bg-white print:p-0">
      
      {/* PRINT STYLES: 
          Forces white background and black text even if Dark Mode is active 
      */}
      <style>{`
        @media print {
          @page { margin: 10mm; size: landscape; }
          body, .print-container { 
            background-color: white !important; 
            color: black !important; 
            -webkit-print-color-adjust: exact; 
          }
          .dark { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          .card-print { 
            border: 1px solid #ddd !important; 
            box-shadow: none !important; 
            break-inside: avoid; 
            background-color: white !important;
            color: black !important;
          }
          table { width: 100% !important; border-collapse: collapse; }
          th, td { border: 1px solid #ddd !important; color: black !important; }
          /* Override dark mode text colors for print */
          .text-slate-500, .text-slate-400, .dark\\:text-gray-400, .dark\\:text-white { color: black !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Report</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Daily and monthly attendance summary - {getMonthName(selectedDate)}
          </p>
        </div>
        
        {/* Actions - Hidden when printing */}
        <div className="flex gap-2 no-print">
          <button
            onClick={handleExport}
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none normal-case font-medium flex items-center gap-2 shadow-sm"
          >
            <FaFileExcel /> Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm normal-case font-medium flex items-center gap-2"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard title="Total Employees" value={reportData.summary.totalEmployees} />
        <SummaryCard title="Working Days" value={reportData.summary.workingDays} color="text-blue-600 dark:text-blue-400" />
        <SummaryCard title="Attendance Rate" value={`${reportData.summary.attendanceRate}%`} color="text-green-600 dark:text-green-400" />
        <SummaryCard title="Present" value={reportData.summary.present} color="text-green-600 dark:text-green-400" />
        <SummaryCard title="Absent" value={reportData.summary.absent} color="text-red-500 dark:text-red-400" />
        <SummaryCard title="Late" value={reportData.summary.late} color="text-orange-500 dark:text-orange-400" />
      </div>

      {/* Filters - Hidden when printing */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 mb-6 no-print transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label text-xs font-semibold text-slate-500 dark:text-gray-400">Select Month</label>
            <input
              type="month"
              className="input input-bordered input-sm w-full bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label text-xs font-semibold text-slate-500 dark:text-gray-400">Company</label>
            <select
              className="select select-bordered select-sm w-full bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option>All Companies</option>
              {companies.map((comp) => (
                <option key={comp._id} value={comp._id}>{comp.companyName}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label text-xs font-semibold text-slate-500 dark:text-gray-400">Department</label>
            <select
              className="select select-bordered select-sm w-full bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option>All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label text-xs font-semibold text-slate-500 dark:text-gray-400">Employee</label>
            <select
              className="select select-bordered select-sm w-full bg-slate-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <option>All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden transition-colors print:shadow-none print:border">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="table w-full">
            <thead className="bg-slate-50/50 dark:bg-gray-700/50 text-slate-500 dark:text-gray-300 text-xs uppercase font-semibold">
              <tr>
                <th className="py-4 pl-6">Employee</th>
                <th>Department</th>
                <th className="text-center text-green-600 dark:text-green-400">Present</th>
                <th className="text-center text-red-500 dark:text-red-400">Absent</th>
                <th className="text-center text-orange-400">Late</th>
                <th className="text-center text-orange-600 dark:text-orange-500">Half Day</th>
                <th className="text-center text-blue-500 dark:text-blue-400">Leave Records</th>
                <th className="text-center">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="8"><SkeletonLoader /></td></tr>
              ) : reportData.tableData.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-400 dark:text-gray-500">No records found matching filters</td></tr>
              ) : (
                reportData.tableData.map((row) => (
                  <tr key={row._id} className="border-b border-slate-50 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors print:break-inside-avoid">
                    <td className="pl-6 py-4">
                      <div className="font-semibold text-slate-700 dark:text-white">{row.name}</div>
                      <div className="text-xs text-slate-400 dark:text-gray-500 font-mono mt-0.5">{row.employeeId}</div>
                    </td>
                    <td className="text-slate-500 dark:text-gray-400">{row.department}</td>
                    <td className="text-center font-bold text-green-600 dark:text-green-400">{row.present}</td>
                    <td className="text-center font-bold text-red-500 dark:text-red-400">{row.absent}</td>
                    <td className="text-center font-bold text-orange-400">{row.late}</td>
                    <td className="text-center font-bold text-orange-600 dark:text-orange-500">{row.halfDay}</td>
                    <td className="text-center font-bold text-blue-500 dark:text-blue-400">{row.leave}</td>
                    <td className="text-center">
                      <span className="badge badge-error badge-outline bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-500 dark:text-red-300 font-bold text-xs py-3 px-3">
                        {row.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && reportData.tableData.length > 0 && (
              <tfoot className="bg-white dark:bg-gray-800 text-slate-800 dark:text-white font-bold border-t dark:border-gray-700 print:bg-gray-100">
                <tr>
                  <td className="pl-6 py-4">Total</td>
                  <td></td>
                  <td className="text-center text-green-600 dark:text-green-400">{reportData.summary.present}</td>
                  <td className="text-center text-red-500 dark:text-red-400">{reportData.summary.absent}</td>
                  <td className="text-center text-orange-400">{reportData.summary.late}</td>
                  <td className="text-center text-orange-600 dark:text-orange-500">
                    {reportData.tableData.reduce((acc, curr) => acc + curr.halfDay, 0)}
                  </td>
                  <td className="text-center text-blue-500 dark:text-blue-400">
                    {reportData.tableData.reduce((acc, curr) => acc + curr.leave, 0)}
                  </td>
                  <td className="text-center text-slate-800 dark:text-white">{reportData.summary.attendanceRate}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUMMARY CARD COMPONENT ---
const SummaryCard = ({ title, value, color = "text-slate-800 dark:text-white" }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 card-print transition-colors">
    <div className="text-xs text-slate-400 dark:text-gray-400 font-medium mb-1 uppercase tracking-wide">{title}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

export default Attendancereport;