import React from 'react';
import ImageUpload from '../../utilities/ImageUploadcpanel';

const UserModal = ({ isOpen, onClose, onSave, user, setUser, isLoading, setImageUrl, imageUploadKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100">
        <h2 className="text-2xl font-semibold mb-7 text-gray-900 tracking-tight">
          {user && user._id ? 'Edit User' : 'Add New User'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={user.name || ''}
            onChange={e => setUser({ ...user, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
            placeholder="Full Name"
            autoFocus
          />
          <input
            type="email"
            value={user.email || ''}
            onChange={e => setUser({ ...user, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Email Address"
          />
          {!user._id && (
            <input
              type="password"
              value={user.password || ''}
              onChange={e => setUser({ ...user, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Password"
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User Photo</label>
            <div className="flex items-center gap-4">
              {user.photo && <img src={user.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm" />}
              <ImageUpload setImageUrl={setImageUrl} key={imageUploadKey} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={user.role || 'user'}
              onChange={e => setUser({ ...user, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <select
              value={user.status || 'active'}
              onChange={e => setUser({ ...user, status: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-200 px-6 py-2 bg-gray-50 hover:bg-gray-200 text-gray-600 rounded-lg font-medium"
          >Cancel</button>
          <button
            type="button"
            onClick={onSave}
            className={`px-7 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
