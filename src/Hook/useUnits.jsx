import { useState, useEffect } from "react";
// Make sure the path matches where you saved the JSON file
import unitData from "../assets/measurementUnits.json"; 

/**
 * Custom hook to manage measurement unit data for the ecommerce platform
 */
const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // simulate async loading if needed, or just set data directly
      if (!Array.isArray(unitData)) {
        throw new Error("Unit data is not an array");
      }
      setUnits(unitData);
    } catch (err) {
      console.error("Failed to load unit data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Get unique unit types (e.g., "Weight", "Volume", "Count")
  // Using Set to remove duplicates
  const unitTypes = [...new Set(units.map((u) => u.type))];

  // 🔹 Get units filtered by a specific type
  const getUnitsByType = (typeName) => {
    return units.filter((u) => u.type === typeName);
  };

  // 🔹 Helper: Get specific unit details by abbreviation (useful for display)
  const getUnitByAbbreviation = (abbr) => {
    return units.find((u) => u.abbreviation === abbr);
  };

  return {
    units,             // All units
    unitTypes,         // List of categories (Weight, Volume, etc.)
    getUnitsByType,    // Function to filter by category
    getUnitByAbbreviation, // Function to find a specific unit
    loading,
    error,
  };
};

export default useUnits;