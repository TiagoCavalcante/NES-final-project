import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="fixed w-full bg-gradient-to-br from-blue-500 to-green-400 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="ml-10 text-xl font-bold">College Board</span>
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link to={"/"}><p className="text-xl hover:text-purple-800 hover:translate-y-1">Home</p></Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar
