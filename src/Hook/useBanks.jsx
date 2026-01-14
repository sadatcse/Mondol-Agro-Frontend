import { useState, useEffect } from "react";
import bankData from "../assets/Banks.json";

/**
 * Custom hook to manage Bangladesh bank data
 */
const useBanks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!Array.isArray(bankData)) {
        throw new Error("Bank data is not an array");
      }
      setBanks(bankData);
    } catch (err) {
      console.error("Failed to load bank data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Get unique bank categories (e.g., State-Owned, Private, Foreign)
  // Assuming your JSON objects have a "category" field
  const categories = [...new Set(banks.map(b => b.category))];

  // 🔹 Get banks by category
  const getBanksByCategory = (categoryName) => {
    return banks.filter(b => b.category === categoryName);
  };

  // 🔹 Search bank by name
  const searchBank = (query) => {
    return banks.filter(b => 
      b.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    banks,
    categories,
    getBanksByCategory,
    searchBank,
    loading,
    error,
  };
};

export default useBanks;