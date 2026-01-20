import React, { useState, useEffect, useCallback, useMemo } from "react";
import menuItems from "../../routes/Root/MenuItems"; 
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import toast from "react-hot-toast";
import useGetRoles from "../../Hook/useGetRoles";
import MtableLoading from "../../components/SkeletonLoader"; 
import { 
    FaUserShield, FaKey,  FaCheckCircle, 
    FaLock, FaLayerGroup, FaLink 
} from "react-icons/fa";

// --- CHILD COMPONENT: Permission Item ---
const PermissionItem = ({ item, groupName, role, initialChecked, onPermissionChange }) => {
    const [isChecked, setIsChecked] = useState(initialChecked);
    const [isUpdating, setIsUpdating] = useState(false);
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        setIsChecked(initialChecked);
    }, [initialChecked]);

    const handleCheckboxChange = async (e) => {
        const checked = e.target.checked;
        setIsChecked(checked); 
        setIsUpdating(true);

        const permissionPayload = {
            title: item.title, 
            isAllowed: checked, 
            role,
            group_name: groupName || null, 
            path: item.path, 
        };
        
        try {
            await axiosSecure.put(`/permissions`, permissionPayload);
            toast.success(`${checked ? 'Enabled' : 'Disabled'}: ${item.title}`);
        } catch (error) {
            console.error("Error updating permission:", error);
            toast.error("Update failed. Reverting.");
            setIsChecked(!checked); 
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`form-control p-3 rounded-xl border transition-all duration-200 
            ${isChecked 
                ? 'bg-primary/5 border-primary/30 dark:bg-primary/10 dark:border-primary/30' 
                : 'bg-white border-base-200 hover:border-primary/20 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:border-gray-500'
            }`}>
            <label className={`cursor-pointer label justify-between py-0 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className={`label-text font-semibold text-sm flex items-center gap-2 transition-colors
                    ${isChecked ? 'text-secondary dark:text-white' : 'text-neutral-600 dark:text-gray-300'}`}>
                    {isChecked ? <FaCheckCircle className="text-primary text-xs"/> : <FaLock className="text-neutral-300 dark:text-gray-500 text-xs"/>}
                    {item.title}
                </span>
                
                <input 
                    type="checkbox" 
                    className="toggle toggle-sm toggle-primary" 
                    checked={isChecked} 
                    onChange={handleCheckboxChange} 
                />
            </label>
        </div>
    );
};

// --- PARENT COMPONENT: User Permission Screen ---
const UserPermission = () => {
    const [role, setRole] = useState("admin");
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const axiosSecure = UseAxiosSecure();
    const availableRoles = useGetRoles();

    const fetchPermissions = useCallback(async () => {
        if (!role) return;
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/permissions/${role}`);
            setPermissions(response.data.routesData || []);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            setPermissions([]);
            toast.error("Could not fetch permissions.");
        } finally {
            setLoading(false);
        }
    }, [role, axiosSecure]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const isRouteAllowed = (path) => {
        if (!path) return false;
        const permission = permissions.find(p => p.path === path);
        return permission ? permission.isAllowed : false;
    };

    // Optimization: Memoize menu items to prevent calculation on every render
    const allMenuItems = useMemo(() => {
        return typeof menuItems === 'function' ? menuItems() : menuItems;
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
                <div>
                    <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
                        <FaUserShield className="text-primary" /> Access Control
                    </h1>
                    <p className="text-neutral-500 dark:text-gray-400 font-medium font-sans">Manage Role-Based Access</p>
                </div>
            </div>

            <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 overflow-hidden transition-colors">
                {/* ROLE SELECTOR */}
                <div className="p-6 bg-base-50 dark:bg-gray-700/30 border-b border-base-200 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
                     <div className="form-control w-full max-w-sm">
                        <label className="label py-1">
                            <span className="label-text font-bold text-secondary dark:text-gray-200 flex items-center gap-2">
                                <FaKey className="text-primary" /> Select Role
                            </span>
                        </label>
                        <select
                            className="select select-bordered focus:border-primary w-full shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {Array.isArray(availableRoles) && availableRoles.map((r, i) => (
                                <option key={i} value={r}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* PERMISSIONS GRID */}
                <div className="p-6">
                    {loading ? (
                        <div className="py-10"><MtableLoading data={null} /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allMenuItems.map((menuItem, index) => {
                                // Check if this item is a Group (has children) or Single
                                const subItems = menuItem.children || menuItem.list || [];
                                const isGroup = subItems.length > 0;

                                if (isGroup) {
                                    // 🟢 RENDER 1: IT IS A GROUP (Folder)
                                    return (
                                        <div key={index} className="flex flex-col h-auto bg-white dark:bg-gray-800 rounded-2xl border border-base-200 dark:border-gray-700 shadow-sm transition-colors">
                                            {/* Group Header */}
                                            <div className="p-4 border-b border-base-100 dark:border-gray-700 bg-base-50/50 dark:bg-gray-700/50 rounded-t-2xl flex items-center gap-3">
                                                <div className="text-primary text-lg">
                                                    {menuItem.icon || <FaLayerGroup />}
                                                </div>
                                                <h3 className="font-bold text-secondary dark:text-gray-200 uppercase tracking-wide text-sm">
                                                    {menuItem.title}
                                                </h3>
                                            </div>
                                            {/* Group Items */}
                                            <div className="p-4 space-y-3">
                                                {subItems.map((sub, subIndex) => (
                                                    <PermissionItem
                                                        key={sub.path || subIndex} 
                                                        item={sub} 
                                                        groupName={menuItem.title} 
                                                        role={role} 
                                                        initialChecked={isRouteAllowed(sub.path)}
                                                        onPermissionChange={fetchPermissions}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // 🟢 RENDER 2: IT IS A STANDALONE ITEM (Individual)
                                    return (
                                        <div key={index} className="flex flex-col h-auto bg-white dark:bg-gray-800 rounded-2xl border border-base-200 dark:border-gray-700 shadow-sm hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
                                             <div className="p-4 border-b border-base-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl flex items-center gap-3">
                                                <div className="text-secondary dark:text-gray-300 text-lg">
                                                    {menuItem.icon || <FaLink />}
                                                </div>
                                                <h3 className="font-bold text-neutral-600 dark:text-gray-400 uppercase tracking-wide text-xs">
                                                    Individual Access
                                                </h3>
                                            </div>
                                            <div className="p-4">
                                                <PermissionItem
                                                    key={menuItem.path || index} 
                                                    item={menuItem} 
                                                    groupName={null} 
                                                    role={role} 
                                                    initialChecked={isRouteAllowed(menuItem.path)}
                                                    onPermissionChange={fetchPermissions}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPermission;