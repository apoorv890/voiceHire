import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Mic, ArrowRight } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setRegisterError('');
      await registerUser(data.name, data.email, data.password);
      navigate('/');
    } catch (error: any) {
      setRegisterError(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-bold text-accent">VoiceHire</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Create an account</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join VoiceHire to streamline your interview process
          </p>
          
          {registerError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {registerError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
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
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#terms" className="text-accent hover:text-accent-dark">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-accent hover:text-accent-dark">
                  Privacy Policy
                </a>
              </label>
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
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Background */}
      <div className="hidden md:block md:w-1/2 bg-accent">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-lg text-white">
            <h2 className="text-4xl font-bold mb-6">Revolutionize Your Hiring Process</h2>
            <p className="text-xl mb-8">
              VoiceHire uses AI to automate interview scheduling, saving you time and resources.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
                  1
                </div>
                <p className="ml-3 text-lg">AI voice bot conducts initial candidate screening</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
                  2
                </div>
                <p className="ml-3 text-lg">Automatically extracts and stores candidate information</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
                  3
                </div>
                <p className="ml-3 text-lg">Schedules interviews directly on Google Calendar</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
                  4
                </div>
                <p className="ml-3 text-lg">Provides a comprehensive dashboard to track all interviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;