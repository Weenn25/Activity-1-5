import React from "react";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const FaStickyNote = FaIcons.FaStickyNote as React.ElementType;
  const FaSignOutAlt = FaIcons.FaSignOutAlt as React.ElementType;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <FaStickyNote className="me-2" size={24} />
          NotesApp
        </a>
        <button className="btn btn-light text-primary" onClick={handleLogout}>
          <FaSignOutAlt className="me-1" /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
