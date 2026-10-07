import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(null);

  const saveBooking = (bookingData) => {
    setBooking(bookingData);
  };

  const clearBooking = () => {
    setBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        saveBooking,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}