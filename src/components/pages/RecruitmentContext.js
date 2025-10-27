import React, { createContext, useContext, useState, useEffect } from 'react';
import { useActivity } from './ActivityContext';

const RecruitmentContext = createContext();

export const useRecruitment = () => {
  return useContext(RecruitmentContext);
};

export const RecruitmentProvider = ({ children }) => {
  const { addActivity } = useActivity();
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE = 'http://localhost:5000/api';

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes, interviewsRes, offersRes, candidatesRes] = await Promise.all([
          fetch(`${API_BASE}/jobs`),
          fetch(`${API_BASE}/applications`),
          fetch(`${API_BASE}/interviews`),
          fetch(`${API_BASE}/offers`),
          fetch(`${API_BASE}/candidates`)
        ]);

        if (!jobsRes.ok || !appsRes.ok || !interviewsRes.ok || !offersRes.ok || !candidatesRes.ok) {
          throw new Error('Failed to fetch data from one or more APIs');
        }

        const jobs = await jobsRes.json();
        const apps = await appsRes.json();
        const ints = await interviewsRes.json();
        const offs = await offersRes.json();
        const cands = await candidatesRes.json();

        setJobPostings(jobs);
        setApplications(apps);
        setInterviews(ints);
        setOffers(offs);
        setCandidates(cands);
      } catch (err) {
        console.error('Error fetching recruitment data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // API helper functions
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Job Posting functions
  const createJobPosting = async (jobData) => {
    try {
      const newJob = await apiRequest(`${API_BASE}/jobs`, {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      setJobPostings(prev => [...prev, newJob]);
      // Add activity
      addActivity(`New job posting created: ${jobData.title}`, 'recruitment');
      setActivities(prev => [{
        id: Date.now(),
        title: `New job posting created: ${jobData.title}`,
        time: new Date().toLocaleString(),
        type: 'job'
      }, ...prev.slice(0, 4)]); // Keep last 5 activities
      return newJob;
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  };

  const updateJobPosting = async (id, jobData) => {
    try {
      const updatedJob = await apiRequest(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
      setJobPostings(prev => prev.map(job => job._id === id ? updatedJob : job));
      // Add activity
      const action = jobData.status === 'Active' ? 'Published' : jobData.status === 'Closed' ? 'Closed' : 'Updated';
      addActivity(`${action} job posting: ${updatedJob.title}`, 'recruitment');
      return updatedJob;
    } catch (error) {
      console.error('Error updating job posting:', error);
      throw error;
    }
  };

  const deleteJobPosting = async (id) => {
    try {
      const jobToDelete = jobPostings.find(job => job._id === id);
      await apiRequest(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
      });
      setJobPostings(prev => prev.filter(job => job._id !== id));
      // Add activity
      if (jobToDelete) {
        addActivity(`Deleted job posting: ${jobToDelete.title}`, 'recruitment');
      }
    } catch (error) {
      console.error('Error deleting job posting:', error);
      throw error;
    }
  };

  // Application functions
  const createApplication = async (appData) => {
    try {
      const newApp = await apiRequest(`${API_BASE}/applications`, {
        method: 'POST',
        body: JSON.stringify(appData),
      });
      setApplications(prev => [...prev, newApp]);
      // Add activity
      addActivity(`New application submitted for ${newApp.position || 'position'}`, 'recruitment');
      setActivities(prev => [{
        id: Date.now(),
        title: `New application submitted for ${newApp.position || 'position'}`,
        time: new Date().toLocaleString(),
        type: 'application'
      }, ...prev.slice(0, 4)]); // Keep last 5 activities
      return newApp;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  };

  const updateApplication = async (candidateId, applicationIndex, appData) => {
    try {
      const updatedApp = await apiRequest(`${API_BASE}/applications/${candidateId}/${applicationIndex}`, {
        method: 'PUT',
        body: JSON.stringify(appData),
      });
      setApplications(prev => prev.map(app => app.candidateId === candidateId && app.applicationIndex === applicationIndex ? updatedApp : app));
      // Add activity
      addActivity(`Application updated for ${updatedApp.position || 'position'}`, 'recruitment');
      setActivities(prev => [{
        id: Date.now(),
        title: `Application updated for ${updatedApp.position || 'position'}`,
        time: new Date().toLocaleString(),
        type: 'application'
      }, ...prev.slice(0, 4)]); // Keep last 5 activities
      return updatedApp;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  };

  // Interview functions
  const createInterview = async (interviewData) => {
    try {
      const newInterview = await apiRequest(`${API_BASE}/interviews`, {
        method: 'POST',
        body: JSON.stringify(interviewData),
      });
      setInterviews(prev => [...prev, newInterview]);
      // Add activity
      addActivity(`New interview scheduled for ${newInterview.candidateName || 'candidate'}`, 'recruitment');
      return newInterview;
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  };

  const updateInterview = async (id, interviewData) => {
    try {
      const updatedInterview = await apiRequest(`${API_BASE}/interviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(interviewData),
      });
      setInterviews(prev => prev.map(int => int._id === id ? updatedInterview : int));
      // Add activity
      addActivity(`Interview updated for ${updatedInterview.candidateName || 'candidate'}`, 'recruitment');
      return updatedInterview;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  };

  // Offer functions
  const createOffer = async (offerData) => {
    try {
      const newOffer = await apiRequest(`${API_BASE}/offers`, {
        method: 'POST',
        body: JSON.stringify(offerData),
      });
      setOffers(prev => [...prev, newOffer]);
      // Add activity
      addActivity(`New job offer sent to ${newOffer.candidateName || 'candidate'}`, 'recruitment');
      return newOffer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  };

  const updateOffer = async (id, offerData) => {
    try {
      const updatedOffer = await apiRequest(`${API_BASE}/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(offerData),
      });
      setOffers(prev => prev.map(offer => offer._id === id ? updatedOffer : offer));
      // Add activity
      addActivity(`Job offer updated for ${updatedOffer.candidateName || 'candidate'}`, 'recruitment');
      return updatedOffer;
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  };

  return (
    <RecruitmentContext.Provider value={{
      jobPostings, setJobPostings,
      applications, setApplications,
      interviews, setInterviews,
      offers, setOffers,
      candidates, setCandidates,
      activities, setActivities,
      loading,
      error,
      // API functions
      createJobPosting,
      updateJobPosting,
      deleteJobPosting,
      createApplication,
      updateApplication,
      createInterview,
      updateInterview,
      createOffer,
      updateOffer
    }}>
      {children}
    </RecruitmentContext.Provider>
  );
};
