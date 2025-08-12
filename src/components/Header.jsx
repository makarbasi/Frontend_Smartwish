import React from 'react';
import '../styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';

const Header = ({title}) => {
  const menuItems = ["Title"];

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo">
              <FontAwesomeIcon icon={faEnvelopeOpenText} size="2x" />
            </span>
          </div>
          <ul className="navbar-menu">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a href="#">{title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
