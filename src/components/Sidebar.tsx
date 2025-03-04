import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, Settings, Menu, X, Mic } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="fixed z-20 bottom-4 left-4 md:hidden bg-primary text-text-light p-2 rounded-full shadow-lg"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-10 flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Mic className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-accent dark:text-primary">VoiceHire</span>
          </div>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-text-light'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-text-light'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Calendar className="w-5 h-5 mr-3" />
            <span>Schedule Interview</span>
          </NavLink>

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Integrations
            </h3>
            <a
              href="#team"
              className="flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Google Calender</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;