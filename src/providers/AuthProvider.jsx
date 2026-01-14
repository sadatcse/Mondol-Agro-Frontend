import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../Hook/useAxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // 1. User State (Login Credentials)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 2. Employee Profile State (Detailed Info)
  const [employeeProfile, setEmployeeProfile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  
  // Note: ideally this should be a secure instance for profile fetching, 
  // but using your provided variable name.
  const axiosSecure = useAxiosPublic(); 

  // --- NEW: Helper to fetch Employee Profile ---
  const fetchEmployeeProfile = async (email) => {
    if (!email) return;
    try {
      // Using the email query param as established in previous steps
      const { data } = await axiosSecure.get(`/employee/my-profile?email=${email}`);
      setEmployeeProfile(data);
    } catch (error) {
      console.error("Employee profile not found or error fetching:", error);
      setEmployeeProfile(null); // Reset if not found
    }
  };

  // --- Effect: Fetch Profile on Page Reload ---
  useEffect(() => {
    if (user?.email) {
      fetchEmployeeProfile(user.email);
    }
  }, [user]); // Runs whenever 'user' is set (login or refresh)

  const registerUser = async (email, password, name, branch) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/post", {
        email,
        password,
        name,
        branch,
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosSecure.post("/user/login", { email, password });
      const data = response.data;

      // 1. Set User
      setUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authToken", data.token);

      // 2. NEW: Immediately Fetch Employee Profile
      await fetchEmployeeProfile(data.user.email);
      
      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        await axiosSecure.post("/user/logout", { email: user.email });
      }
      
      // Clear all states
      setUser(null);
      setEmployeeProfile(null); // Clear profile

      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken"); // Ensure token is removed too
      localStorage.removeItem("authBranch");

    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    employeeProfile, // <--- Now available globally
    loading,
    registerUser,
    loginUser,
    logoutUser,
    fetchEmployeeProfile, // Exposed in case you need to manually refresh profile after an edit
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;