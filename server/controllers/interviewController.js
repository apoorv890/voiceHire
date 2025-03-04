import Interview from '../models/Interview.js';

// Get all interviews for a user
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ interviewDate: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new interview
export const createInterview = async (req, res) => {
  try {
    const { candidateName, candidateEmail, company, interviewDate } = req.body;

    const interview = new Interview({
      candidateName,
      candidateEmail,
      company,
      interviewDate,
      user: req.user.id
    });

    const savedInterview = await interview.save();
    res.status(201).json(savedInterview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an interview
export const updateInterview = async (req, res) => {
  try {
    const { candidateName, candidateEmail, company, interviewDate, status } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Update only provided fields
    if (candidateName) interview.candidateName = candidateName;
    if (candidateEmail) interview.candidateEmail = candidateEmail;
    if (company) interview.company = company;
    if (interviewDate) interview.interviewDate = interviewDate;
    if (status) interview.status = status;

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update interview status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an interview
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
