import UserLogin from "./pages/UserLogin"
import UserRegister from "./pages/UserRegister"
import ProtectedRoutes from "./routes/ProtectedRoutes"
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ProfilePage from "./pages/ProfilePage";

import AdminProtectedRoutes from "./routes/AdminProtectedRoutes";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminCourses from "./pages/admin/AdminCourses";

import { useLocation } from "react-router-dom";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn] = useState<boolean>(false); // Change to true after login
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar onMenuClick={() => setSidebarOpen(true)} />}
      {!isAdminRoute && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isLoggedIn={isLoggedIn} />}

      <main>
        <Routes>
          <Route path="/userLogin" element={<UserLogin />} />
          <Route path="/userRegister" element={<UserRegister />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/user/profile/:id" element={<ProfilePage />} />
          </Route>

          <Route path="/courses/:section" element={<AllCoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />

          <Route path="/admin" element={<AdminProtectedRoutes />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="courses" element={<AdminCourses />} />
            </Route>
          </Route>

          <Route path="*" element={<UserLogin />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
