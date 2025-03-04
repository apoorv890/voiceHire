import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Mic, ArrowRight } from 'lucide-react';
import { COMPANY_NAMES, DEMO_EMAIL, DEMO_PASSWORD } from '../config';
import { motion } from 'framer-motion';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setLoginError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (error: any) {
      setLoginError(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setValue('email', DEMO_EMAIL);
    setValue('password', DEMO_PASSWORD);
  };

  // Duplicate company names to create a seamless loop
  const duplicatedCompanies = [...COMPANY_NAMES, ...COMPANY_NAMES];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-bold text-accent">VoiceHire</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Welcome back</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to your account to continue
          </p>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <a href="#forgot-password" className="text-sm font-medium text-accent hover:text-accent-dark">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              className="btn-outline w-full"
            >
              Use demo account
            </button>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:text-accent-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Background */}
      <div className="hidden md:flex md:w-1/2 bg-accent items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
        
        <div className="relative z-20 text-white p-8 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">AI-Powered Interview Scheduling</h2>
          <p className="text-xl mb-8">
            Streamline your hiring process with our automated voice interview system
          </p>
          
          <div className="mt-12">
            <p className="text-lg font-semibold mb-4">Trusted by companies like:</p>
            
            <div className="overflow-hidden whitespace-nowrap">
              <motion.div
                className="inline-block animate-carousel"
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                {duplicatedCompanies.map((company, index) => (
                  <span 
                    key={index} 
                    className="inline-block mx-4 text-xl font-bold"
                  >
                    {company}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;