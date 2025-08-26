import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useAIResponse } from '../hooks/useAIResponse';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    HealthIcon, 
    HeartIcon, 
    ActivityIcon, 
    SleepIcon, 
    NutritionIcon,
    MentalHealthIcon,
    ExerciseIcon,
    WaterIcon,
    WeightIcon,
    BloodPressureIcon,
    TemperatureIcon,
    ChartIcon,
    AlertIcon,
    CheckIcon
} from '../assets/icons';

const Health = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();
    const { getConnectorsByType, activateConnector } = useConnector();
    const { sendMessage, conversation, isLoading: aiLoading } = useAIResponse();
    
    const [healthData, setHealthData] = useState({
        vitals: {
            heartRate: 72,
            bloodPressure: { systolic: 120, diastolic: 80 },
            temperature: 98.6,
            weight: 150,
            sleepHours: 7.5,
            waterIntake: 8,
            steps: 8500
        },
        metrics: {
            bmi: 22.5,
            bodyFat: 18,
            muscleMass: 45,
            hydration: 85,
            sleepQuality: 8.2,
            stressLevel: 3
        }
    });
    const [healthConnectors, setHealthConnectors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('overview');

    useEffect(() => {
        const initializeHealth = async () => {
            setIsLoading(true);
            try {
                const connectors = getConnectorsByType('health');
                setHealthConnectors(connectors);
                
                trackEvent('health_page_loaded', {
                    isAuthenticated,
                    connectorCount: connectors.length
                });
            } catch (error) {
                console.error('Failed to initialize health page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeHealth();
    }, [isAuthenticated, getConnectorsByType, trackEvent]);

    const handleHealthQuestion = async (question) => {
        try {
            await sendMessage(`Health question: ${question}`);
            trackEvent('health_question_asked', { question });
        } catch (error) {
            console.error('Failed to send health question:', error);
        }
    };

    const healthMetrics = [
        {
            title: 'Heart Rate',
            value: healthData.vitals.heartRate,
            unit: 'bpm',
            icon: <HeartIcon />,
            status: healthData.vitals.heartRate < 100 ? 'normal' : 'warning',
            trend: 'stable'
        },
        {
            title: 'Blood Pressure',
            value: `${healthData.vitals.bloodPressure.systolic}/${healthData.vitals.bloodPressure.diastolic}`,
            unit: 'mmHg',
            icon: <BloodPressureIcon />,
            status: 'normal',
            trend: 'stable'
        },
        {
            title: 'Temperature',
            value: healthData.vitals.temperature,
            unit: '°F',
            icon: <TemperatureIcon />,
            status: 'normal',
            trend: 'stable'
        },
        {
            title: 'Weight',
            value: healthData.vitals.weight,
            unit: 'lbs',
            icon: <WeightIcon />,
            status: 'normal',
            trend: 'stable'
        },
        {
            title: 'Sleep',
            value: healthData.vitals.sleepHours,
            unit: 'hours',
            icon: <SleepIcon />,
            status: healthData.vitals.sleepHours >= 7 ? 'normal' : 'warning',
            trend: 'improving'
        },
        {
            title: 'Water Intake',
            value: healthData.vitals.waterIntake,
            unit: 'glasses',
            icon: <WaterIcon />,
            status: healthData.vitals.waterIntake >= 8 ? 'normal' : 'warning',
            trend: 'stable'
        },
        {
            title: 'Steps',
            value: healthData.vitals.steps,
            unit: 'steps',
            icon: <ActivityIcon />,
            status: healthData.vitals.steps >= 8000 ? 'normal' : 'warning',
            trend: 'improving'
        }
    ];

    const healthRecommendations = [
        {
            type: 'exercise',
            title: 'Daily Exercise',
            description: 'Aim for 30 minutes of moderate exercise',
            icon: <ExerciseIcon />,
            priority: 'high',
            completed: false
        },
        {
            type: 'nutrition',
            title: 'Balanced Diet',
            description: 'Include more fruits and vegetables',
            icon: <NutritionIcon />,
            priority: 'medium',
            completed: false
        },
        {
            type: 'mental',
            title: 'Stress Management',
            description: 'Practice mindfulness for 10 minutes',
            icon: <MentalHealthIcon />,
            priority: 'medium',
            completed: false
        },
        {
            type: 'sleep',
            title: 'Sleep Hygiene',
            description: 'Maintain consistent sleep schedule',
            icon: <SleepIcon />,
            priority: 'high',
            completed: false
        }
    ];

    const quickQuestions = [
        "How can I improve my sleep quality?",
        "What exercises are best for my fitness level?",
        "How much water should I drink daily?",
        "What's a healthy diet plan for me?",
        "How can I reduce stress?",
        "What are signs of good health?"
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading your health dashboard..." />;
    }

    return (
        <div className="health-page">
            {/* Header */}
            <section className="health-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <HealthIcon /> Health & Wellness
                    </h1>
                    <p className="page-subtitle">
                        Monitor your health metrics and get personalized recommendations
                    </p>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleHealthQuestion("Give me a comprehensive health assessment")}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <LoadingSpinner size="small" /> : 'Get Health Assessment'}
                    </button>
                </div>
            </section>

            {/* Health Metrics Overview */}
            <section className="health-metrics-section">
                <h2 className="section-title">Current Health Metrics</h2>
                <div className="metrics-grid">
                    {healthMetrics.map((metric, index) => (
                        <div key={index} className={`metric-card ${metric.status}`}>
                            <div className="metric-icon">
                                {metric.icon}
                            </div>
                            <div className="metric-content">
                                <h3 className="metric-title">{metric.title}</h3>
                                <div className="metric-value">
                                    {metric.value} <span className="metric-unit">{metric.unit}</span>
                                </div>
                                <div className={`metric-status ${metric.status}`}>
                                    <span className="status-indicator"></span>
                                    {metric.status === 'normal' ? 'Normal' : 'Attention Needed'}
                                </div>
                                <div className="metric-trend">
                                    <span className={`trend-indicator ${metric.trend}`}></span>
                                    {metric.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Health Recommendations */}
            <section className="health-recommendations-section">
                <h2 className="section-title">Health Recommendations</h2>
                <div className="recommendations-grid">
                    {healthRecommendations.map((recommendation, index) => (
                        <div key={index} className={`recommendation-card ${recommendation.priority}`}>
                            <div className="recommendation-icon">
                                {recommendation.icon}
                            </div>
                            <div className="recommendation-content">
                                <h3 className="recommendation-title">{recommendation.title}</h3>
                                <p className="recommendation-description">{recommendation.description}</p>
                                <div className="recommendation-priority">
                                    Priority: <span className={`priority-badge ${recommendation.priority}`}>
                                        {recommendation.priority}
                                    </span>
                                </div>
                            </div>
                            <button 
                                className="recommendation-action"
                                onClick={() => handleHealthQuestion(`Tell me more about ${recommendation.title.toLowerCase()}`)}
                            >
                                Learn More
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Health Questions */}
            <section className="quick-questions-section">
                <h2 className="section-title">Quick Health Questions</h2>
                <div className="questions-grid">
                    {quickQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="question-card"
                            onClick={() => handleHealthQuestion(question)}
                            disabled={aiLoading}
                        >
                            <div className="question-content">
                                <p className="question-text">{question}</p>
                                <div className="question-icon">
                                    <HealthIcon />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Health Connectors */}
            {healthConnectors.length > 0 && (
                <section className="health-connectors-section">
                    <h2 className="section-title">Health Services</h2>
                    <div className="connectors-grid">
                        {healthConnectors.map((connector) => (
                            <DashboardCard
                                key={connector.id}
                                title={connector.name}
                                description={connector.description}
                                icon={connector.icon}
                                status={connector.status}
                                lastUsed={connector.lastUsed}
                                usageCount={connector.usageCount}
                                actions={[
                                    {
                                        label: connector.status === 'active' ? 'Deactivate' : 'Activate',
                                        action: () => activateConnector(connector.id),
                                        variant: connector.status === 'active' ? 'secondary' : 'primary'
                                    }
                                ]}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* AI Health Assistant */}
            <section className="ai-health-assistant-section">
                <h2 className="section-title">AI Health Assistant</h2>
                <div className="ai-assistant-content">
                    <div className="assistant-info">
                        <h3>Your Personal Health Steward</h3>
                        <p>
                            Ask questions about your health, get personalized recommendations, 
                            and track your wellness journey with AI-powered insights.
                        </p>
                    </div>
                    
                    {conversation.length > 0 && (
                        <div className="recent-health-conversation">
                            <h4>Recent Health Discussion</h4>
                            <div className="conversation-preview">
                                {conversation
                                    .filter(msg => msg.content.toLowerCase().includes('health'))
                                    .slice(-2)
                                    .map((message, index) => (
                                        <div key={index} className={`conversation-message ${message.role}`}>
                                            <div className="message-content">
                                                <p>{message.content}</p>
                                            </div>
                                            <time className="message-time">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </time>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Health Tips */}
            <section className="health-tips-section">
                <h2 className="section-title">Daily Health Tips</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">
                            <WaterIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Stay Hydrated</h3>
                            <p>Drink at least 8 glasses of water daily to maintain optimal hydration.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <ExerciseIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Move Regularly</h3>
                            <p>Take short walks every hour to improve circulation and reduce sedentary time.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <SleepIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Quality Sleep</h3>
                            <p>Maintain a consistent sleep schedule and create a relaxing bedtime routine.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Health;
