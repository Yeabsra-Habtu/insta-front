import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Profile } from "./components/Profile";
import "./App.css";
import React from "react";

const MainContent = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <nav className="bg-white shadow-md backdrop-blur-sm bg-opacity-90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Instagram Integration
                </h1>
              </div>
            </div>
            {isAuthenticated && (
              <div className="flex items-center">
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-10">
        {isAuthenticated ? (
          <Profile />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-10 border border-gray-100">
              <div className="mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-pink-500 mb-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
                  Welcome to Instagram Integration
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Connect your Instagram account to manage your media and engage
                  with your audience
                </p>
              </div>
              <button
                onClick={login}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-lg font-medium px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 flex items-center mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Login with Instagram
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
