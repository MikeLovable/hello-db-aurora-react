
import { useState } from "react";

/**
 * Navbar component for the application
 * Displays the app logo and connection status
 */
const Navbar = () => {
  // Connection status simulation
  const [connected, setConnected] = useState(true);
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mr-3">
            DB
          </div>
          <span className="text-xl font-semibold text-slate-900">HelloDB Aurora</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm text-slate-600">{connected ? 'Connected to AWS' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
