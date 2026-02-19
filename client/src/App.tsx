import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Change to true after login

  return (
    <BrowserRouter>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isLoggedIn={isLoggedIn} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses/:section" element={<AllCoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
