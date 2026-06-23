import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

import logo from "../../assets/landingpageimages/common/logo.png";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-top">

        {/* Logo Section */}
        <Link to="/" className="footer-logo-section">

          <img
            src={logo}
            alt="Vihavi Events"
            className="footer-logo"
          />

          <div className="footer-brand">
            <h2>VIHAVI EVENTS</h2>
            <p>Unforgettable Moments, Crafted by Vihavi</p>
          </div>

        </Link>

        {/* Contact Section */}
        <div className="footer-contact">

          {/* Phone */}
          <a
            href="tel:+18001234567"
            className="contact-item"
            aria-label="Call Us"
          >
            <FaPhoneAlt />
            <span>+1 (800) 123-4567</span>
          </a>

          {/* Email */}
          <a
            href="mailto:info@vihavievents.com"
            className="contact-item"
            aria-label="Email Us"
          >
            <FaEnvelope />
            <span>info@vihavievents.com</span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/vihavievents"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
            aria-label="Visit Instagram"
          >
            <FaInstagram />
            <span>@VihaviEvents</span>
          </a>

        </div>

      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© 2024 Vihavi Events. All Rights Reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;