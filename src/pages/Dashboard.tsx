import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Building, Mail, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Interview } from '../types/interview';
import { getInterviewStats } from '../utils/interviewStats';

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    upcomingInterviews: 0,
    completionRate: 0
  });
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
        setInterviews(response.data);
        setStats(getInterviewStats(response.data));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch interviews');
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

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
          <p className="text-3xl font-bold text-accent">{stats.totalInterviews}</p>
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
            {stats.upcomingInterviews}
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
            {`${stats.completionRate}%`}
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
          {(['scheduled', 'completed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-primary text-text-light'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Interview List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {filteredInterviews.map(interview => (
          <motion.div
            key={interview._id}
            variants={item}
            className="card p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{interview.company}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(interview.interviewDate), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(interview.interviewDate), 'p')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <a
                  href={`/interview/${interview._id}`}
                  className="btn-secondary inline-flex items-center"
                >
                  View Details
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredInterviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No interviews found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;