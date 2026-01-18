import { useState, useEffect, useContext } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { AuthContext } from '../providers/AuthProvider';

const useGetRoles = () => {
    const [roles, setRoles] = useState([]);
    const { user } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        const fetchRoles = async () => {
            if (user) { 
                try {

                    const response = await axiosSecure.get(`/user/roles`);
                    setRoles(response.data); 
                } catch (error) {
                    console.error("Failed to fetch roles", error);
                    // Fallback roles
                    setRoles(['admin', 'manager', 'user']);
                }
            }
        };
        fetchRoles();
    }, [user, axiosSecure]);

    return roles;
};

export default useGetRoles;