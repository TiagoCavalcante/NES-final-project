import React from "react"
import { useNavigate } from "react-router-dom"
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated"
import useSignOut from "react-auth-kit/hooks/useSignOut"
import NavbarHome from "../components/NavbarHome"

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut() // Clears token from storage
    navigate("/login") // Redirect to login page, if desired
  }

  const handleSignIn = () => {
    navigate("/login") // Navigate user to your login page
  }

  return (
    <div className="bg-gray-100 text-gray-800 font-sans">
      {/* Navbar */}
      <NavbarHome />

      {/* Main Content */}
      <div className="p-8 bg-gray-900 bg-cover h-screen">

        {/* Hero Section */}
        <section className="mt-16 text-center py-12 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to College Board</h1>
          <p className="text-lg">Your one-stop platform for university statistics and insights.</p>
        </section>

        {/* About Us Section */}
        <section id="about" className="mt-12 text-center text-gray-400">
          <h2 className="text-2xl font-bold mb-4">🧑‍💻About Us💡</h2>
          <p className="leading-relaxed">
            College Board is dedicated to providing accurate and up-to-date statistics<br></br>
            about universities worldwide. We aim to empower students, educators,<br></br>
            and policymakers with reliable data.
          </p>
        </section>

        {/* Our Goals Section */}
        <section id="goals" className="mt-12 text-gray-400 text-center">
          <h2 className="text-2xl font-bold mb-4">🚀Our Goals🎯</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Help students make informed decisions about their education.</li>
            <li>Provide transparency in higher education statistics.</li>
            <li>Support educational research and development.</li>
          </ul>
        </section>
      </div>
      <div className=" p-8 bg-gray-900">

        {/* Contact Section */}
        <section id="contact" className="mt-12 bg-gradient-to-br from-blue-500 to-green-400 p-6 rounded-lg">
          <h2 className="text-4xl font-bold text-center mb-12" data-aos="fade-up" data-aos-duration="1000">
            Fale conosco!
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <a href="#" target="_blank"
              className="flex shadow-md items-center bg-[#0BBF41] text-white py-3 px-6 rounded-full transition duration-300 transform hover:shadow-yellow-500"
              data-aos="zoom-in" data-aos-duration="1000">
              <i className="fab text-3xl mr-3"></i>
              <span className="text-xl font-semibold">Whatsapp</span>
            </a>
            <a href="#" target="_blank"
              className="flex shadow-md items-center bg-purple-500 hover:bg-purple-800 py-3 px-6 rounded-full transition duration-300 transform hover:shadow-yellow-500"
              data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="100">
              <i className="fab text-3xl mr-3"></i>
              <span className="text-xl font-semibold">Telefone</span>
            </a>
            <a href="#" target="_blank"
              className="flex shadow-md items-center bg-gradient-to-br from-pink-600 via-[#943b85] to-purple-700 py-3 px-6 rounded-full transition duration-300 transform hover:shadow-yellow-500"
              data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="300">
              <i className="fab fa-instagram text-3xl mr-3"></i>
              <span className="text-xl font-semibold">Instagram</span>
            </a>
            <a href="#"
              className="flex shadow-md items-center bg-yellow-500 hover:bg-yellow-600 py-3 px-6 rounded-full transition duration-300 transform hover:shadow-yellow-500"
              data-aos="zoom-in" data-aos-delay="400">
              <i className="fas fa-envelope text-3xl mr-3"></i>
              <span className="text-xl font-semibold">E-mail</span>
            </a>
          </div>
          <div className="mt-12 text-center" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            <p className="text-xl">
              Entre em contato conosco e veja sua vida mudar.
            </p>
          </div>
        </section>
      </div>


      {/* Footer */}
      <footer className="bg-gray-700 text-white p-4 text-center">
        <p>&copy; 2024 UniStats. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;