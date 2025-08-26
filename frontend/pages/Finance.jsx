import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useAIResponse } from '../hooks/useAIResponse';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    FinanceIcon, 
    BudgetIcon, 
    InvestmentIcon, 
    SavingsIcon, 
    ExpenseIcon,
    IncomeIcon,
    DebtIcon,
    TaxIcon,
    RetirementIcon,
    InsuranceIcon,
    ChartIcon,
    CalculatorIcon,
    GoalIcon,
    AlertIcon
} from '../assets/icons';

const Finance = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();
    const { getConnectorsByType, activateConnector } = useConnector();
    const { sendMessage, conversation, isLoading: aiLoading } = useAIResponse();
    
    const [financeData, setFinanceData] = useState({
        overview: {
            totalAssets: 125000,
            totalLiabilities: 25000,
            netWorth: 100000,
            monthlyIncome: 5000,
            monthlyExpenses: 3500,
            savingsRate: 30
        },
        accounts: [
            {
                id: 1,
                name: 'Checking Account',
                type: 'checking',
                balance: 8500,
                lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
                id: 2,
                name: 'Savings Account',
                type: 'savings',
                balance: 25000,
                lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
            },
            {
                id: 3,
                name: 'Investment Portfolio',
                type: 'investment',
                balance: 91500,
                lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
            }
        ],
        goals: [
            {
                id: 1,
                name: 'Emergency Fund',
                target: 15000,
                current: 12000,
                deadline: '2024-12-31',
                priority: 'high'
            },
            {
                id: 2,
                name: 'Vacation Fund',
                target: 5000,
                current: 3000,
                deadline: '2024-06-30',
                priority: 'medium'
            },
            {
                id: 3,
                name: 'Retirement Savings',
                target: 1000000,
                current: 91500,
                deadline: '2040-12-31',
                priority: 'high'
            }
        ]
    });
    const [financeConnectors, setFinanceConnectors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedView, setSelectedView] = useState('overview');

    useEffect(() => {
        const initializeFinance = async () => {
            setIsLoading(true);
            try {
                const connectors = getConnectorsByType('finance');
                setFinanceConnectors(connectors);
                
                trackEvent('finance_page_loaded', {
                    isAuthenticated,
                    connectorCount: connectors.length
                });
            } catch (error) {
                console.error('Failed to initialize finance page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeFinance();
    }, [isAuthenticated, getConnectorsByType, trackEvent]);

    const handleFinanceQuestion = async (question) => {
        try {
            await sendMessage(`Finance question: ${question}`);
            trackEvent('finance_question_asked', { question });
        } catch (error) {
            console.error('Failed to send finance question:', error);
        }
    };

    const financialMetrics = [
        {
            title: 'Net Worth',
            value: financeData.overview.netWorth,
            unit: '$',
            icon: <ChartIcon />,
            status: financeData.overview.netWorth > 0 ? 'positive' : 'negative',
            trend: 'increasing'
        },
        {
            title: 'Monthly Income',
            value: financeData.overview.monthlyIncome,
            unit: '$',
            icon: <IncomeIcon />,
            status: 'positive',
            trend: 'stable'
        },
        {
            title: 'Monthly Expenses',
            value: financeData.overview.monthlyExpenses,
            unit: '$',
            icon: <ExpenseIcon />,
            status: 'neutral',
            trend: 'stable'
        },
        {
            title: 'Savings Rate',
            value: financeData.overview.savingsRate,
            unit: '%',
            icon: <SavingsIcon />,
            status: financeData.overview.savingsRate >= 20 ? 'positive' : 'warning',
            trend: 'improving'
        }
    ];

    const financialGoals = [
        {
            title: 'Emergency Fund',
            description: 'Build 6 months of expenses',
            icon: <SavingsIcon />,
            progress: 80,
            priority: 'high'
        },
        {
            title: 'Debt Reduction',
            description: 'Pay off high-interest debt',
            icon: <DebtIcon />,
            progress: 45,
            priority: 'high'
        },
        {
            title: 'Investment Growth',
            description: 'Increase portfolio diversification',
            icon: <InvestmentIcon />,
            progress: 60,
            priority: 'medium'
        },
        {
            title: 'Retirement Planning',
            description: 'Maximize retirement contributions',
            icon: <RetirementIcon />,
            progress: 30,
            priority: 'high'
        }
    ];

    const quickFinanceQuestions = [
        "How can I improve my savings rate?",
        "What's the best way to invest my money?",
        "How much should I save for retirement?",
        "What's a good emergency fund amount?",
        "How can I reduce my monthly expenses?",
        "What's the best strategy for paying off debt?"
    ];

    const financialTools = [
        {
            title: 'Budget Calculator',
            description: 'Create and track your monthly budget',
            icon: <CalculatorIcon />,
            action: () => handleFinanceQuestion("Help me create a budget")
        },
        {
            title: 'Investment Analyzer',
            description: 'Analyze investment opportunities',
            icon: <InvestmentIcon />,
            action: () => handleFinanceQuestion("Help me analyze investment options")
        },
        {
            title: 'Debt Payoff Planner',
            description: 'Create a debt payoff strategy',
            icon: <DebtIcon />,
            action: () => handleFinanceQuestion("Help me create a debt payoff plan")
        },
        {
            title: 'Retirement Calculator',
            description: 'Plan for your retirement',
            icon: <RetirementIcon />,
            action: () => handleFinanceQuestion("Help me plan for retirement")
        }
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading your financial dashboard..." />;
    }

    return (
        <div className="finance-page">
            {/* Header */}
            <section className="finance-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <FinanceIcon /> Financial Planning
                    </h1>
                    <p className="page-subtitle">
                        Manage your finances, track goals, and plan for your financial future
                    </p>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleFinanceQuestion("Give me a comprehensive financial assessment")}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <LoadingSpinner size="small" /> : 'Get Financial Assessment'}
                    </button>
                </div>
            </section>

            {/* Financial Overview */}
            <section className="financial-overview-section">
                <h2 className="section-title">Financial Overview</h2>
                <div className="overview-grid">
                    {financialMetrics.map((metric, index) => (
                        <div key={index} className={`metric-card ${metric.status}`}>
                            <div className="metric-icon">
                                {metric.icon}
                            </div>
                            <div className="metric-content">
                                <h3 className="metric-title">{metric.title}</h3>
                                <div className="metric-value">
                                    {metric.unit}{metric.value.toLocaleString()}
                                </div>
                                <div className={`metric-status ${metric.status}`}>
                                    <span className="status-indicator"></span>
                                    {metric.status === 'positive' ? 'Good' : 
                                     metric.status === 'negative' ? 'Needs Attention' : 'Neutral'}
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

            {/* Account Balances */}
            <section className="accounts-section">
                <h2 className="section-title">Account Balances</h2>
                <div className="accounts-grid">
                    {financeData.accounts.map((account) => (
                        <div key={account.id} className="account-card">
                            <div className="account-header">
                                <div className="account-icon">
                                    {account.type === 'checking' && <BudgetIcon />}
                                    {account.type === 'savings' && <SavingsIcon />}
                                    {account.type === 'investment' && <InvestmentIcon />}
                                </div>
                                <div className="account-type">{account.type}</div>
                            </div>
                            <div className="account-content">
                                <h3 className="account-name">{account.name}</h3>
                                <div className="account-balance">
                                    ${account.balance.toLocaleString()}
                                </div>
                                <time className="account-date">
                                    Updated: {new Date(account.lastUpdated).toLocaleDateString()}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Financial Goals */}
            <section className="financial-goals-section">
                <h2 className="section-title">Financial Goals</h2>
                <div className="goals-grid">
                    {financialGoals.map((goal, index) => (
                        <div key={index} className={`goal-card ${goal.priority}`}>
                            <div className="goal-icon">
                                {goal.icon}
                            </div>
                            <div className="goal-content">
                                <h3 className="goal-title">{goal.title}</h3>
                                <p className="goal-description">{goal.description}</p>
                                <div className="goal-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{goal.progress}%</span>
                                </div>
                                <div className="goal-priority">
                                    Priority: <span className={`priority-badge ${goal.priority}`}>
                                        {goal.priority}
                                    </span>
                                </div>
                            </div>
                            <button 
                                className="goal-action"
                                onClick={() => handleFinanceQuestion(`Help me with my ${goal.title.toLowerCase()} goal`)}
                            >
                                Get Advice
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Financial Tools */}
            <section className="financial-tools-section">
                <h2 className="section-title">Financial Tools</h2>
                <div className="tools-grid">
                    {financialTools.map((tool, index) => (
                        <div key={index} className="tool-card">
                            <div className="tool-icon">
                                {tool.icon}
                            </div>
                            <div className="tool-content">
                                <h3 className="tool-title">{tool.title}</h3>
                                <p className="tool-description">{tool.description}</p>
                            </div>
                            <button 
                                className="tool-action"
                                onClick={tool.action}
                                disabled={aiLoading}
                            >
                                Use Tool
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Finance Questions */}
            <section className="quick-questions-section">
                <h2 className="section-title">Quick Financial Questions</h2>
                <div className="questions-grid">
                    {quickFinanceQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="question-card"
                            onClick={() => handleFinanceQuestion(question)}
                            disabled={aiLoading}
                        >
                            <div className="question-content">
                                <p className="question-text">{question}</p>
                                <div className="question-icon">
                                    <FinanceIcon />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Finance Connectors */}
            {financeConnectors.length > 0 && (
                <section className="finance-connectors-section">
                    <h2 className="section-title">Financial Services</h2>
                    <div className="connectors-grid">
                        {financeConnectors.map((connector) => (
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

            {/* AI Financial Assistant */}
            <section className="ai-financial-assistant-section">
                <h2 className="section-title">AI Financial Assistant</h2>
                <div className="ai-assistant-content">
                    <div className="assistant-info">
                        <h3>Your Financial Advisor</h3>
                        <p>
                            Get personalized financial advice, create budgets, analyze investments, 
                            and plan for your financial future with AI-powered insights.
                        </p>
                    </div>
                    
                    {conversation.length > 0 && (
                        <div className="recent-finance-conversation">
                            <h4>Recent Financial Discussion</h4>
                            <div className="conversation-preview">
                                {conversation
                                    .filter(msg => msg.content.toLowerCase().includes('finance') || 
                                                   msg.content.toLowerCase().includes('money') ||
                                                   msg.content.toLowerCase().includes('budget'))
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

            {/* Financial Tips */}
            <section className="financial-tips-section">
                <h2 className="section-title">Financial Tips & Best Practices</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">
                            <SavingsIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Pay Yourself First</h3>
                            <p>Automate savings by setting aside money before paying other expenses.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <BudgetIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Track Your Spending</h3>
                            <p>Monitor your expenses to identify areas where you can cut back and save more.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <InvestmentIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Diversify Investments</h3>
                            <p>Spread your investments across different asset classes to reduce risk.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Finance;
