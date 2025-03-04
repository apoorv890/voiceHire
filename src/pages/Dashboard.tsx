import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Building, Mail, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

type Interview = {
  _id: string;
  company: string;
  interviewDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/interviews`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // For demo purposes, generate some sample data if none exists
        if (response.data.length === 0) {
          setInterviews(generateSampleInterviews());
        } else {
          setInterviews(response.data);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch interviews');
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const generateSampleInterviews = (): Interview[] => {
    const statuses: ('scheduled' | 'completed' | 'cancelled')[] = ['scheduled', 'completed', 'cancelled'];
    const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'];
    
    return Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 14) - 7);
      
      return {
        _id: `sample-${i}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        interviewDate: date.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
      };
    });
  };

  const filteredInterviews = filter === 'all' 
    ? interviews 
    : interviews.filter(interview => interview.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Interview Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all your scheduled interviews
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <a 
            href="/schedule" 
            className="btn-primary inline-flex items-center"
          >
            Schedule New Interview
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold text-accent">{interviews.length}</p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Last 30 days
          </div>
        </motion.div>
        
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2">Upcoming Interviews</h3>
          <p className="text-3xl font-bold text-accent">
            {interviews.filter(i => i.status === 'scheduled').length}
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Next 7 days
          </div>
        </motion.div>
        
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-accent">
            {interviews.length > 0 
              ? `${Math.round((interviews.filter(i => i.status === 'completed').length / interviews.length) * 100)}%` 
              : '0%'}
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Overall
          </div>
        </motion.div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-text-light' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'scheduled' 
                ? 'bg-primary text-text-light' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-primary text-text-light' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'cancelled' 
                ? 'bg-primary text-text-light' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">No interviews found</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredInterviews.map((interview) => (
            <motion.div 
              key={interview._id} 
              className="card overflow-visible"
              variants={item}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold truncate">{user?.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm truncate">{user?.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">{interview.company}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(interview.interviewDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(interview.interviewDate), 'h:mm a')}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {format(new Date(interview.createdAt), 'MMM dd, yyyy')}
                  </span>
                  
                  <button className="text-accent hover:text-accent-dark text-sm font-medium">
                    View details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;