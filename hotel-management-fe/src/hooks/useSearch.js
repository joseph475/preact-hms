import { h, createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('');

  const updateSearch = (term) => {
    setSearchTerm(term);
  };

  const updateCurrentPage = (page) => {
    setCurrentPage(page);
  };

  const getPlaceholder = () => {
    switch (currentPage) {
      case '/rooms':
        return 'Search rooms by number, type, status, description, or amenities...';
      case '/guests':
        return 'Search guests by name, email, phone, or ID number...';
      case '/bookings':
        return 'Search bookings by guest name, room number, or booking ID...';
      case '/users':
        return 'Search users by name, email, or role...';
      case '/reports':
        return 'Search reports...';
      default:
        return 'Search guests, rooms, bookings...';
    }
  };

  return (
    <SearchContext.Provider value={{
      searchTerm,
      currentPage,
      updateSearch,
      updateCurrentPage,
      getPlaceholder
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
