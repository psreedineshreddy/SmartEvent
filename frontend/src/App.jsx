import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import PaymentCheckout from "./pages/PaymentCheckout";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingHistory from "./pages/BookingHistory";
import Tickets from "./pages/Tickets";
import Notifications from "./pages/Notifications";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEvent from "./pages/CreateEvent";
import ManageEvents from "./pages/ManageEvents";
import EventBookings from "./pages/EventBookings";
import EditEvent from "./pages/EditEvent";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminEvents from "./pages/AdminEvents";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import Payments from "./pages/Payments";
import PaymentMethods from "./pages/PaymentMethods";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import ChatbotWidget from "./components/ChatbotWidget";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* EVENT DETAILS — USER, ORGANIZER, ADMIN */}
<Route
  element={
    <ProtectedRoute allowedRoles={["USER", "ORGANIZER", "ADMIN"]} />
  }
>
  <Route path="/events/:eventId" element={<EventDetails />} />
</Route>

        {/* USER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route path="/" element={<Home />} />
          <Route path="/payment-checkout" element={<PaymentCheckout />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />
          <Route path="/payments" element={<Payments />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* ORGANIZER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/create-event" element={<CreateEvent />} />
          <Route path="/organizer/events" element={<ManageEvents />} />
          <Route path="/organizer/bookings" element={<EventBookings />} />
          <Route
            path="/organizer/events/edit/:eventId"
            element={<EditEvent />}
          />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
       <ChatbotWidget />
    </>
  );
}

export default App;