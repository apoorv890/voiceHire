import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

type InterviewData = {
  candidateName: string;
  candidateEmail: string;
  company: string;
  interviewDate: string;
};

const InterviewScheduler = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLiveKit, setShowLiveKit] = useState(false);

  const handleConfirm = () => {
    // Simulate Google Calendar integration
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const resetInterview = () => {
    setIsRecording(false);
    setProcessingStatus('idle');
    setInterviewData(null);
    setErrorMessage('');
    setShowLiveKit(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">AI Voice Interview Scheduler</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Our AI assistant will ask few questions to collect candidate information and schedule the interview.
        </p>
        
        <div className="card p-8">
          {processingStatus === 'idle' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
                className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-primary'
                }`}
              >
                <Mic className={`h-12 w-12 ${isRecording ? 'text-white' : 'text-accent'}`} />
              </motion.div>
              
              <h2 className="text-xl font-semibold mb-4">
                {isRecording ? 'Listening...' : 'Start AI Voice Call'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isRecording 
                  ? 'The AI assistant is asking questions. Please respond clearly.'
                  : 'Click the button below to start the AI voice call. The assistant will ask for candidate details.'}
              </p>
              
              {isRecording ? (
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Questions being asked:</p>
                  <ul className="text-left max-w-md mx-auto space-y-2">
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      <span>What is the candidate's full name?</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      <span>What is the candidate's email address?</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      <span>Which company is the candidate applying to?</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      <span>When would you like to schedule the interview?</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => setShowLiveKit(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition"
                >
                  Start Voice Call
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={resetInterview}
                  className="btn-outline mt-4"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
          
          {showLiveKit && (
            <div className="w-full flex justify-center mt-5">
              <iframe
                src="https://agents-playground.livekit.io/#cam=1&mic=1&video=1&audio=1&chat=1&theme_color=cyan"
                width="90%"
                height="600px"
                style={{
                  border: "2px solid #ddd",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          )}
          
          {processingStatus === 'processing' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
                <Loader className="h-12 w-12 text-white animate-spin" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Processing Interview Data</h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our AI is analyzing the conversation and extracting relevant information...
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {processingStatus === 'success' && interviewData && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Voice Call Scheduled Successfully</h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The following voice call details have been extracted:
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Candidate Name</p>
                    <p className="font-medium">{interviewData.candidateName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="font-medium">{interviewData.candidateEmail}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium">{interviewData.company}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Interview Date & Time</p>
                    <p className="font-medium">{formatDate(interviewData.interviewDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleConfirm}
                  className="btn-primary flex items-center justify-center"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Google Calendar
                </button>
                
                <button
                  onClick={resetInterview}
                  className="btn-outline"
                >
                  Schedule Another Call
                </button>
              </div>
            </div>
          )}
          
          {processingStatus === 'error' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-500 mx-auto mb-6 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Error Processing Interview</h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage || 'There was an error processing the interview data. Please try again.'}
              </p>
              
              <button
                onClick={resetInterview}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How it works</h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
                1
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Start the voice call</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the button to begin the AI-powered voice call process
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
                2
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Answer the questions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The AI will ask for candidate name, email, company, and preferred interview time
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
                3
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Review and confirm</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verify the extracted information and confirm the interview details
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
                4
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Calendar integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The interview is automatically added to Google Calendar and notifications are sent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;