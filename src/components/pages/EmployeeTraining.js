import React, { useState, useEffect } from 'react';
import { useEmployeeAuth } from './EmployeeAuthContext';
import '../../Stylesheets/EmployeeTraining.css';

const EmployeeTraining = () => {
    const { employee } = useEmployeeAuth();
    const [trainingData, setTrainingData] = useState(null);

    useEffect(() => {
        // Mock training data - in real app, this would come from API
        if (employee) {
            setTrainingData({
                onboardingStatus: employee.onboardingStatus || 'completed',
                progress: employee.progress || 100,
                trainer: employee.trainer || null,
                timeslot: employee.timeslot || 'Not assigned',
                trainingModules: [
                    { id: 1, name: 'Company Overview', completed: true, score: 95 },
                    { id: 2, name: 'Product Knowledge', completed: true, score: 88 },
                    { id: 3, name: 'Sales Training', completed: false, score: null },
                    { id: 4, name: 'Customer Service', completed: false, score: null },
                    { id: 5, name: 'Compliance & Ethics', completed: false, score: null }
                ]
            });
        }
    }, [employee]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'green';
            case 'training': return 'blue';
            case 'onboarding': return 'orange';
            default: return 'gray';
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'green';
        if (progress >= 60) return 'orange';
        return 'red';
    };

    if (!trainingData) {
        return <div>Loading training data...</div>;
    }

    return (
        <div className="employee-training">
            <h2>Training & Development</h2>

            <div className="training-overview">
                <div className="overview-card">
                    <h3>Training Status</h3>
                    <span className={`status-badge ${getStatusColor(trainingData.onboardingStatus)}`}>
                        {trainingData.onboardingStatus.toUpperCase()}
                    </span>
                </div>
                <div className="overview-card">
                    <h3>Overall Progress</h3>
                    <div className="progress-container">
                        <div
                            className={`progress-bar ${getProgressColor(trainingData.progress)}`}
                            style={{ width: `${trainingData.progress}%` }}
                        >
                            {trainingData.progress}%
                        </div>
                    </div>
                </div>
                <div className="overview-card">
                    <h3>Assigned Trainer</h3>
                    <p>{trainingData.trainer ? trainingData.trainer.fullName : 'Not assigned'}</p>
                </div>
                <div className="overview-card">
                    <h3>Training Timeslot</h3>
                    <p>{trainingData.timeslot}</p>
                </div>
            </div>

            <div className="training-modules">
                <h3>Training Modules</h3>
                <div className="modules-grid">
                    {trainingData.trainingModules.map((module) => (
                        <div key={module.id} className={`module-card ${module.completed ? 'completed' : 'pending'}`}>
                            <div className="module-header">
                                <h4>{module.name}</h4>
                                <span className={`module-status ${module.completed ? 'completed' : 'pending'}`}>
                                    {module.completed ? '✓ Completed' : '○ Pending'}
                                </span>
                            </div>
                            {module.completed && module.score && (
                                <div className="module-score">
                                    <span>Score: {module.score}%</span>
                                </div>
                            )}
                            {!module.completed && (
                                <div className="module-action">
                                    <button className="start-module-btn">
                                        Start Module
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="training-resources">
                <h3>Training Resources</h3>
                <div className="resources-grid">
                    <div className="resource-card">
                        <h4>📚 Training Manual</h4>
                        <p>Complete guide for new employees</p>
                        <button className="resource-btn">Download</button>
                    </div>
                    <div className="resource-card">
                        <h4>🎥 Video Tutorials</h4>
                        <p>Step-by-step video guides</p>
                        <button className="resource-btn">Watch</button>
                    </div>
                    <div className="resource-card">
                        <h4>📋 Quick Reference</h4>
                        <p>Essential information at a glance</p>
                        <button className="resource-btn">View</button>
                    </div>
                    <div className="resource-card">
                        <h4>❓ FAQ</h4>
                        <p>Common questions and answers</p>
                        <button className="resource-btn">Browse</button>
                    </div>
                </div>
            </div>

            <div className="training-feedback">
                <h3>Training Feedback</h3>
                <div className="feedback-form">
                    <p>How would you rate your training experience so far?</p>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="star">★</span>
                        ))}
                    </div>
                    <textarea
                        placeholder="Share your feedback about the training program..."
                        rows="4"
                    />
                    <button className="submit-feedback-btn">Submit Feedback</button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeTraining;
