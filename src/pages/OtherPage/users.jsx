import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { HiOutlineHome, HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';

// Custom Secure Axios hook
import UseAxiosSecure from '../../Hook/UseAxioSecure';

// Components
import SkeletonLoader from '../../components/SkeletonLoader';
import TableControls from '../../components/TableControls';
import Pagination from '../../components/Pagination';
import ImageUpload from '../../utilities/ImageUploadcpanel';

import UserModal from '../../components/Modal/UserModal';

const initialFormState = {
  email: "",
  name: "",
  role: "user",
  status: "active",
  photo: "",
  password: "",
};

const Users = () => {
  const axiosSecure = UseAxiosSecure();

  // State
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal & user edit/add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Image upload
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [imageUploadKey, setImageUploadKey] = useState(Date.now());

  // Updates photo in form after upload
  useEffect(() => {
    if (uploadedPhotoUrl && currentUser) {
      setCurrentUser(prev => ({ ...prev, photo: uploadedPhotoUrl }));
    }
  }, [uploadedPhotoUrl, currentUser]);

  // API: Get users
  const fetchUsers = useCallback(async (page, limit, search) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosSecure.get('/user/', {
        params: { page, limit, search }
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('Failed to fetch users. Please ensure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // Fetch with debounce on search/page change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(currentPage, itemsPerPage, searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, currentPage, itemsPerPage, fetchUsers]);

  // Modal handlers
  const handleOpenModal = (user = null) => {
    setCurrentUser(user ? { ...user } : { ...initialFormState });
    setUploadedPhotoUrl(user?.photo || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setUploadedPhotoUrl('');
    setImageUploadKey(Date.now());
  };

  // Save (add/update)
  const handleSaveUser = async () => {
    if (!currentUser?.name || !currentUser?.email) {
      Swal.fire('Validation Error', 'Name and Email are required.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (currentUser._id) {
        await axiosSecure.put(`/user/update/${currentUser._id}`, currentUser);
      } else {
        await axiosSecure.post('/user/post', currentUser);
      }
      Swal.fire('Success!', `User has been ${currentUser._id ? 'updated' : 'added'}.`, 'success');
      handleCloseModal();
      fetchUsers(currentPage, itemsPerPage, searchTerm);
    } catch (error) {
      console.error('Error saving user:', error);
      Swal.fire('Error!', 'Failed to save user. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDelete = (userId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be reverted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/user/delete/${userId}`);
          Swal.fire('Deleted!', 'User deleted.', 'success');
          fetchUsers(currentPage, itemsPerPage, searchTerm);
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete.', 'error');
        }
      }
    });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // Table controls
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex items-center text-sm text-gray-400 gap-2">
          <HiOutlineHome className="h-5 w-5" />
          <span className="font-medium tracking-wide">Home / User Management</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <TableControls
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 shadow transition duration-150"
          >
            <HiPlus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 rounded px-4 py-3 text-center">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3 hidden md:table-cell">Role</th>
                <th className="px-6 py-3 hidden sm:table-cell">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonLoader columns={4} />
              ) : (
                users.map(user => (
                  <tr key={user._id} className="bg-white border-b hover:bg-blue-50 transition-all">
                    <th className="flex items-center px-6 py-4 gap-3 whitespace-nowrap">
                      <img
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow"
                        src={user.photo || `https://ui-avatars.com/api/?name=${user.name || ''}&background=E2E8F0&color=4A5568&size=40`}
                        alt={`${user.name || 'User'}'s avatar`}
                      />
                      <div>
                        <div className="text-base font-semibold">{user.name}</div>
                        <div className="font-normal text-gray-400">{user.email}</div>
                      </div>
                    </th>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button title="Edit" onClick={() => handleOpenModal(user)} className="p-2 hover:bg-blue-100 rounded transition">
                          <HiPencil className="w-5 h-5 text-blue-600" />
                        </button>
                        <button title="Delete" onClick={() => handleDelete(user._id)} className="p-2 hover:bg-red-100 rounded transition">
                          <HiTrash className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400">No users found.</div>
        )}

        {!loading && pagination && pagination.totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={currentUser}
        setUser={setCurrentUser}
        isLoading={isSaving}
        setImageUrl={setUploadedPhotoUrl}
        imageUploadKey={imageUploadKey}
      />
    </div>
  );
};

export default Users;
