export type Interview = {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  company: string;
  interviewDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  user: string;
};
