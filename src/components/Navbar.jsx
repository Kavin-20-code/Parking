import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Car, LayoutDashboard, CalendarPlus, History, Ban, Home } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Parking Slots', path: '/slots', icon: Car },
    { name: 'Book Parking', path: '/book', icon: CalendarPlus },
    { name: 'Booking History', path: '/history', icon: History },
    { name: 'Cancel Reservation', path: '/cancel', icon: Ban },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Group */}
        <NavLink to="/" onClick={closeMenu} className="navbar-brand">
          <div className="navbar-brand-icon">
            <Car size={18} />
          </div>
          <span className="navbar-brand-text">
            ParkEasy
          </span>
        </NavLink>

        {/* Desktop Links */}
        <div className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'navbar-link active' : 'navbar-link'
                }
              >
                <Icon size={15} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          id="navbar-toggle-btn"
          onClick={toggleMenu}
          className="navbar-burger"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer panel */}
      <div className={`navbar-mobile ${isOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                id={`mobile-nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.name}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'navbar-mobile-link active' : 'navbar-mobile-link'
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
