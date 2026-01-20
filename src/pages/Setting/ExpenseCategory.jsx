import React, { useState, useEffect, useCallback } from "react";
import useExpenseCategory from "../../Hook/useExpenseCategory";
import SkeletonLoader from "../../components/SkeletonLoader";
import TableControls from "../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaSave, 
  FaTags, FaListUl, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ExpenseCategory = () => {
  // Use Custom Hook
  const { 
    loading, 
    getPaginatedExpenseCategories, 
    createExpenseCategory, 
    updateExpenseCategory, 
    removeExpenseCategory 
  } = useExpenseCategory();

  // --- State Management ---
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    categoryName: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // --- API Fetching ---
  const fetchCategories = useCallback(async () => {
    const data = await getPaginatedExpenseCategories({
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm 
    });

    if (data) {
      setCategories(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    }
  }, [getPaginatedExpenseCategories, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { 
    fetchCategories(); 
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // --- Handlers ---
  
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        categoryName: category.categoryName,
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeExpenseCategory(id);
          toast.success("Category deleted successfully");
          fetchCategories();
        } catch (err) {
          toast.error(err.response?.data?.message || "Delete failed");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateExpenseCategory(editingId, formData);
        toast.success("Category updated successfully!");
      } else {
        await createExpenseCategory(formData);
        toast.success("Category created successfully!");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaTags className="text-primary" /> Expense Categories
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium font-sans">Manage Expense Classifications</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg hover:scale-105 transition-all">
          <FaPlus /> Add Category
        </button>
      </div>

      {/* DATA TABLE */}
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
            <thead>
              <tr className="text-secondary dark:text-gray-200 uppercase text-xs tracking-widest bg-base-200/50 dark:bg-gray-700/50 border-b dark:border-gray-600">
                <th className="w-16">#</th>
                <th>Category Name</th>
                <th className="text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3"><SkeletonLoader /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-10 opacity-50 font-bold dark:text-gray-400">No categories found.</td></tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b border-base-200 dark:border-gray-700">
                    <td className="font-mono text-xs opacity-50 dark:text-gray-500 pl-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle w-8 h-8 bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <FaListUl className="text-primary text-sm" />
                        </div>
                        <div className="font-bold text-secondary dark:text-gray-200 text-base">{cat.categoryName}</div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(cat)} className="btn btn-sm btn-circle btn-ghost text-info hover:bg-info/10 dark:hover:bg-blue-900/30">
                          <FaEdit className="text-lg" />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/10 dark:hover:bg-red-900/30">
                          <FaTrash className="text-lg" />
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
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-50 dark:bg-gray-800 rounded-b-2xl border-t dark:border-gray-700 transition-colors">
          <div className="text-sm font-medium text-neutral-500 dark:text-gray-400">
            Showing <span className="text-secondary dark:text-white font-bold">{categories.length}</span> of <span className="text-secondary dark:text-white font-bold">{totalItems}</span> records
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
          <div className="bg-base-100 dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border-t-8 border-primary animate-in fade-in zoom-in duration-200 transition-colors">
            
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-2xl font-black text-secondary dark:text-white flex items-center gap-3 uppercase tracking-tight">
                {editingId ? <FaEdit className="text-primary"/> : <FaPlus className="text-primary"/>}
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <button className="btn btn-circle btn-ghost dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="form-control">
                <label className="label-text font-bold mb-1 dark:text-gray-300">Category Name *</label>
                <input 
                  required 
                  className="input input-bordered focus:border-primary w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  placeholder="e.g. Travel, Office Supplies, Meals"
                  value={formData.categoryName} 
                  onChange={(e) => setFormData({...formData, categoryName: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 mt-10 border-t dark:border-gray-700 pt-8">
                <button type="button" className="btn btn-ghost px-8 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-12 text-white shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><FaSave /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategory;