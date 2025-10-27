import React, { createContext, useContext, useState } from 'react';

const ActivityContext = createContext();

export const useActivity = () => {
  return useContext(ActivityContext);
};

// Helper function to get relative time
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    // Load activities from localStorage on initialization
    const savedActivities = localStorage.getItem('hrActivities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        // Convert timestamp strings back to Date objects
        return parsed.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved activities:', error);
        return [];
      }
    }
    return [];
  });

  const addActivity = (title, type = 'general') => {
    const timestamp = new Date();
    const newActivity = {
      id: Date.now(),
      title,
      timestamp,
      time: getRelativeTime(timestamp),
      type
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev.slice(0, 4)]; // Keep last 5 activities
      // Save to localStorage
      localStorage.setItem('hrActivities', JSON.stringify(updated));
      return updated;
    });
  };

  // Update relative times periodically (every minute)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const updated = prev.map(activity => ({
          ...activity,
          time: getRelativeTime(activity.timestamp)
        }));
        // Update localStorage with new times
        localStorage.setItem('hrActivities', JSON.stringify(updated));
        return updated;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <ActivityContext.Provider value={{
      activities,
      addActivity
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
