import React from 'react';

function NavbarHome() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Site Logo" className="h-8 w-8" />
        <span className="text-xl font-bold">UniStats</span>
      </div>
      <ul className="flex space-x-4">
        <li>
          <a href="#simulator" className="hover:underline">Simulator</a>
        </li>
        <li>
          <a href="#colleges" className="hover:underline">Colleges</a>
        </li>
        <li>
          <a href="#contact" className="hover:underline">Contact</a>
        </li>
      </ul>
    </nav>
  );
}

export default NavbarHome
