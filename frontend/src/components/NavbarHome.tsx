import { Link } from 'react-router-dom'

function NavbarHome() {
  return (
    <nav className="fixed rounded-b-lg t-0 w-full bg-gradient-to-br from-blue-500 to-green-400 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-xl ml-10 font-bold">College Board</span>
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link to={"/"}><p className="text-xl hover:text-purple-800 hover:translate-y-1">Home</p></Link>
        </li>
        <li>
          <Link to={"/Colleges"}><p className="text-xl hover:text-purple-800 hover:translate-y-1">Colleges</p></Link>
        </li>
        <li>
          <Link to={"/Goals"}><p className="text-xl hover:text-purple-800 hover:translate-y-1">Goals</p></Link>
        </li>
        <li>
          <Link to={"/Simulator"}><p className="text-xl hover:text-purple-800 hover:translate-y-1">Simulator</p></Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavbarHome
