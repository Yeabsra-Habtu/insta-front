import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Profile } from "./components/Profile";
import "./App.css";

const MainContent = () => {
  const { isAuthenticated, login } = useAuth();

  console.log(isAuthenticated, "isAuthenticated"); // Log the isAuthenticated value to the console

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Instagram Integration
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        {isAuthenticated ? (
          <Profile />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Welcome to Instagram Integration
            </h2>
            <button
              onClick={login}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login with Instagram
            </button>
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
