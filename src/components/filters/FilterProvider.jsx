import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children, initialFilters = {} }) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterProvider;
