import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { userData, isLoggedIn } = useContext(AppContext);
  const [activeLink, setActiveLink] = useState("home");

  return (
    <nav className="flex justify-between items-center w-full h-[80px] px-10">
      {/* Logo */}
      <div className="text-2xl font-monts font-semibold text-[#2A4674] mr-20">
        Vidyarya
      </div>

      {/* Links */}
      <ul className="flex justify-center items-center gap-8 font-chakra text-[#2A4674]">
        {["home", "services", "about", "contact"].map((link) => (
          <li
            key={link}
            onClick={() => setActiveLink(link)}
            className={`text-lg font-semibold cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
              activeLink === link
                ? "bg-[#2A4674] text-[#F5F5EF] px-4 py-2 rounded-full"
                : "text-[#2A4674]"
            }`}
          >
            {link.charAt(0).toUpperCase() + link.slice(1)}
          </li>
        ))}
      </ul>

      {/* Auth Section */}
      <div className="cursor-pointer">
        {!isLoggedIn ? (
          <Link to="/login">
            <button className="bg-[#2A4674] text-white px-4 py-2 font-chakra rounded-full text-lg font-semibold hover:opacity-80">
              Login/Register
            </button>
          </Link>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2A4674] text-white font-chakra text-xl font-semibold">
            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
