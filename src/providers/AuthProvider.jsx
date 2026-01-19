import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../Hook/useAxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const axiosSecure = useAxiosPublic();


  const fetchEmployeeProfile = useCallback(
    async (email) => {
      if (!email) return;
      try {
        const { data } = await axiosSecure.get(
          `/employee/my-profile?email=${email}`
        );
        setEmployeeProfile(data);
      } catch (error) {
        console.error("Employee profile not found or error fetching:", error);
        setEmployeeProfile(null);
      }
    },
    [axiosSecure]
  );

  // ✅ Dependency warning resolved
  useEffect(() => {
    if (user?.email) {
      fetchEmployeeProfile(user.email);
    }
  }, [user, fetchEmployeeProfile]);

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
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/login", {
        email,
        password,
      });

      setUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authToken", data.token);

      await fetchEmployeeProfile(data.user.email);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        // await axiosSecure.post("/user/logout", { email: user.email });
      }

      setUser(null);
      setEmployeeProfile(null);

      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authBranch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employeeProfile,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        fetchEmployeeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
