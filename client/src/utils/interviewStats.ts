import { Interview } from '../types/interview';

export const getInterviewStats = (interviews: Interview[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Filter interviews within the last 30 days
  const recentInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.interviewDate);
    return interviewDate >= thirtyDaysAgo && interviewDate <= now;
  });

  // Get upcoming scheduled interviews in next 7 days
  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.interviewDate);
    return (
      interview.status === 'scheduled' &&
      interviewDate >= now &&
      interviewDate <= sevenDaysFromNow
    );
  });

  // Calculate completion rate
  const completedInterviews = interviews.filter(
    interview => interview.status === 'completed'
  );
  const completionRate = interviews.length > 0
    ? Math.round((completedInterviews.length / interviews.length) * 100)
    : 0;

  return {
    totalInterviews: recentInterviews.length,
    upcomingInterviews: upcomingInterviews.length,
    completionRate
  };
};
