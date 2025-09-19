import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  //const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowDropdown(false);
    navigate('/'); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/home')}>
        <img src={logo} alt="EcoAi Logo" className="logo" />
        <h1 className="site-title">EcoAi</h1>
      </div>

      <div className="navbar-center">
        <NavLink
          to="/home"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink to="/create-project" className="nav-item">Dashboard</NavLink>
      </div>

      <div className="navbar-right">
        {username ? (
          <div className="user-dropdown-container">
            <span
              className="user-display"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              {username}
            </span>
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate('/')}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

