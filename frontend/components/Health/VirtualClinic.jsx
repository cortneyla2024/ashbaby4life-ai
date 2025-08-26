import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Eye, 
  Brain, 
  Stethoscope,
  User,
  MessageCircle,
  Video,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  Download,
  Share,
  Bookmark,
  Star,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Camera,
  Mic,
  Monitor,
  Smartphone,
  Tablet,
  Server,
  Globe,
  Users,
  Key,
  Fingerprint,
  Scan,
  Shield,
  Lock,
  Unlock,
  Eye as EyeIcon,
  EyeOff,
  DownloadCloud,
  Upload,
  RefreshCw,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Ruby,
  Emerald,
  Sapphire,
  Amethyst,
  Pearl,
  Gold,
  Silver,
  Bronze,
  Platinum,
  Iron,
  Steel,
  Copper,
  Aluminum,
  Titanium,
  Carbon,
  Silicon,
  Oxygen,
  Hydrogen,
  Nitrogen,
  Helium,
  Neon,
  Argon,
  Krypton,
  Xenon,
  Radon,
  Uranium,
  Plutonium,
  Thorium,
  Radium,
  Polonium,
  Astatine,
  Francium,
  Radon as RadonIcon,
  Uranium as UraniumIcon,
  Plutonium as PlutoniumIcon,
  Thorium as ThoriumIcon,
  Radium as RadiumIcon,
  Polonium as PoloniumIcon,
  Astatine as AstatineIcon,
  Francium as FranciumIcon,
  Pill,
  Syringe,
  Bandage,
  Microscope,
  TestTube,
  Flask,
  Beaker,
  PetriDish,
  Scalpel,
  Forceps,
  Scissors,
  Tweezers,
  ThermometerSun,
  ThermometerSnowflake,
  Droplet,
  Wind,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Sun,
  Moon,
  Cloudy,
  CloudFog,
  CloudHail,
  CloudDrizzle,
  CloudRainWind,
  CloudLightningRain,
  CloudSnowWind,
  CloudHaze,
  CloudHaze2,
  CloudRainWind2,
  CloudLightningRain2,
  CloudSnowWind2,
  CloudHaze3,
  CloudHaze4,
  CloudHaze5,
  CloudHaze6,
  CloudHaze7,
  CloudHaze8,
  CloudHaze9,
  CloudHaze10
} from 'lucide-react';

const VirtualClinic = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, triage, therapy, vitals, records
  const [patientData, setPatientData] = useState({
    name: 'John Doe',
    age: 32,
    gender: 'Male',
    height: 175,
    weight: 70,
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension'],
    medications: ['Lisinopril']
  });
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 36.8,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    bloodGlucose: 95
  });
  const [symptoms, setSymptoms] = useState([]);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [carePlan, setCarePlan] = useState(null);
  const [therapySession, setTherapySession] = useState({
    isActive: false,
    therapist: null,
    duration: 0,
    mood: 'neutral'
  });
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [aiTherapist, setAiTherapist] = useState({
    isActive: false,
    messages: [],
    avatar: '/avatars/therapist-ai.png',
    name: 'Dr. Sarah AI',
    specialization: 'Cognitive Behavioral Therapy'
  });

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const symptomCategories = [
    {
      category: 'Cardiovascular',
      symptoms: ['Chest Pain', 'Palpitations', 'Shortness of Breath', 'Dizziness', 'Fainting']
    },
    {
      category: 'Respiratory',
      symptoms: ['Cough', 'Wheezing', 'Chest Tightness', 'Difficulty Breathing', 'Sore Throat']
    },
    {
      category: 'Gastrointestinal',
      symptoms: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation']
    },
    {
      category: 'Neurological',
      symptoms: ['Headache', 'Dizziness', 'Numbness', 'Tingling', 'Memory Loss']
    },
    {
      category: 'Mental Health',
      symptoms: ['Anxiety', 'Depression', 'Insomnia', 'Mood Swings', 'Stress']
    }
  ];

  const therapists = [
    {
      id: 'ai-sarah',
      name: 'Dr. Sarah AI',
      specialization: 'Cognitive Behavioral Therapy',
      avatar: '/avatars/therapist-ai.png',
      rating: 4.9,
      available: true,
      type: 'AI'
    },
    {
      id: 'ai-michael',
      name: 'Dr. Michael AI',
      specialization: 'Mindfulness & Meditation',
      avatar: '/avatars/therapist-ai-2.png',
      rating: 4.8,
      available: true,
      type: 'AI'
    },
    {
      id: 'ai-emily',
      name: 'Dr. Emily AI',
      specialization: 'Trauma Therapy',
      avatar: '/avatars/therapist-ai-3.png',
      rating: 4.7,
      available: true,
      type: 'AI'
    }
  ];

  const handleSymptomAdd = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms(prev => [...prev, symptom]);
    }
  };

  const handleSymptomRemove = (symptom) => {
    setSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const performSymptomTriage = async () => {
    if (symptoms.length === 0) return;

    // Simulate AI triage
    const triageResult = {
      urgency: symptoms.includes('Chest Pain') ? 'Emergency' : 'Routine',
      possibleConditions: [
        'Common Cold',
        'Seasonal Allergies',
        'Stress-related symptoms'
      ],
      recommendations: [
        'Monitor symptoms for 24-48 hours',
        'Rest and stay hydrated',
        'Contact healthcare provider if symptoms worsen'
      ],
      riskLevel: 'Low',
      estimatedWaitTime: '2-3 days'
    };

    setAiDiagnosis(triageResult);
  };

  const generateCarePlan = () => {
    const plan = {
      daily: [
        'Take prescribed medications',
        'Monitor blood pressure twice daily',
        'Exercise for 30 minutes',
        'Maintain healthy diet'
      ],
      weekly: [
        'Schedule follow-up appointment',
        'Review medication effectiveness',
        'Update symptom diary'
      ],
      monthly: [
        'Complete health assessment',
        'Update care team on progress',
        'Review and adjust treatment plan'
      ]
    };

    setCarePlan(plan);
  };

  const startTherapySession = (therapist) => {
    setTherapySession({
      isActive: true,
      therapist,
      duration: 0,
      mood: 'neutral'
    });

    setAiTherapist(prev => ({
      ...prev,
      isActive: true,
      messages: [
        {
          id: 1,
          type: 'therapist',
          content: `Hello! I'm ${therapist.name}. I'm here to support you today. How are you feeling?`,
          timestamp: new Date()
        }
      ]
    }));
  };

  const endTherapySession = () => {
    setTherapySession({
      isActive: false,
      therapist: null,
      duration: 0,
      mood: 'neutral'
    });

    setAiTherapist(prev => ({
      ...prev,
      isActive: false,
      messages: []
    }));
  };

  const sendMessageToTherapist = (message) => {
    const newMessage = {
      id: aiTherapist.messages.length + 1,
      type: 'patient',
      content: message,
      timestamp: new Date()
    };

    setAiTherapist(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Simulate AI therapist response
    setTimeout(() => {
      const therapistResponse = {
        id: aiTherapist.messages.length + 2,
        type: 'therapist',
        content: `I understand how you're feeling. Let's explore that together. Can you tell me more about when you first noticed these feelings?`,
        timestamp: new Date()
      };

      setAiTherapist(prev => ({
        ...prev,
        messages: [...prev.messages, therapistResponse]
      }));
    }, 2000);
  };

  const updateVitals = (vital, value) => {
    setVitals(prev => ({
      ...prev,
      [vital]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Clinic
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered health monitoring, symptom triage, and therapy sessions
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'triage', label: 'Symptom Triage', icon: Stethoscope },
              { id: 'therapy', label: 'AI Therapy', icon: Brain },
              { id: 'vitals', label: 'Vitals Monitor', icon: Heart },
              { id: 'records', label: 'Medical Records', icon: FileText }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setCurrentView(nav.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === nav.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <nav.icon className="w-5 h-5" />
                <span>{nav.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{patientData.name}</h3>
                  <p className="text-gray-600">{patientData.age} years • {patientData.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vitals Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{vitals.heartRate} bpm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{vitals.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{vitals.oxygenSaturation}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span>{vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-1">
                    {patientData.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Medications</h4>
                  <div className="flex flex-wrap gap-1">
                    {patientData.medications.map((medication, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Video className="w-5 h-5" />
                  <span>Start Video Call</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with AI</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Appointment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <DashboardView 
                    vitals={vitals}
                    patientData={patientData}
                    symptoms={symptoms}
                    aiDiagnosis={aiDiagnosis}
                  />
                </motion.div>
              )}

              {currentView === 'triage' && (
                <motion.div
                  key="triage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <SymptomTriageView
                    symptoms={symptoms}
                    onSymptomAdd={handleSymptomAdd}
                    onSymptomRemove={handleSymptomRemove}
                    symptomCategories={symptomCategories}
                    onTriage={performSymptomTriage}
                    aiDiagnosis={aiDiagnosis}
                  />
                </motion.div>
              )}

              {currentView === 'therapy' && (
                <motion.div
                  key="therapy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <TherapyView
                    therapists={therapists}
                    therapySession={therapySession}
                    aiTherapist={aiTherapist}
                    onStartSession={startTherapySession}
                    onEndSession={endTherapySession}
                    onSendMessage={sendMessageToTherapist}
                  />
                </motion.div>
              )}

              {currentView === 'vitals' && (
                <motion.div
                  key="vitals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <VitalsMonitorView
                    vitals={vitals}
                    onUpdateVitals={updateVitals}
                  />
                </motion.div>
              )}

              {currentView === 'records' && (
                <motion.div
                  key="records"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <MedicalRecordsView
                    medicalRecords={medicalRecords}
                    patientData={patientData}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ vitals, patientData, symptoms, aiDiagnosis }) => {
  return (
    <>
      {/* Vitals Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{vitals.heartRate}</p>
            <p className="text-sm text-gray-600">Heart Rate (bpm)</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{vitals.temperature}</p>
            <p className="text-sm text-gray-600">Temperature (°C)</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{vitals.oxygenSaturation}</p>
            <p className="text-sm text-gray-600">O2 Saturation (%)</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}</p>
            <p className="text-sm text-gray-600">Blood Pressure</p>
          </div>
        </div>
      </div>

      {/* Recent Symptoms */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Symptoms</h3>
        {symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {symptom}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent symptoms reported</p>
        )}
      </div>

      {/* AI Diagnosis */}
      {aiDiagnosis && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assessment</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                aiDiagnosis.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                aiDiagnosis.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {aiDiagnosis.urgency}
              </span>
              <span className="text-sm text-gray-600">Risk Level: {aiDiagnosis.riskLevel}</span>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Possible Conditions</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {aiDiagnosis.possibleConditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {aiDiagnosis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SymptomTriageView = ({ symptoms, onSymptomAdd, onSymptomRemove, symptomCategories, onTriage, aiDiagnosis }) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Triage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symptom Categories */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Select Symptoms</h4>
            <div className="space-y-4">
              {symptomCategories.map((category) => (
                <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{category.category}</h5>
                  <div className="flex flex-wrap gap-2">
                    {category.symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => onSymptomAdd(symptom)}
                        disabled={symptoms.includes(symptom)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          symptoms.includes(symptom)
                            ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Symptoms */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Selected Symptoms</h4>
            {symptoms.length > 0 ? (
              <div className="space-y-2">
                {symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-900">{symptom}</span>
                    <button
                      onClick={() => onSymptomRemove(symptom)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={onTriage}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Analyze Symptoms
                </button>
              </div>
            ) : (
              <p className="text-gray-600">No symptoms selected</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Diagnosis Results */}
      {aiDiagnosis && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Diagnosis Results</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                aiDiagnosis.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                aiDiagnosis.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {aiDiagnosis.urgency}
              </div>
              <div className="text-sm text-gray-600">
                Estimated wait time: {aiDiagnosis.estimatedWaitTime}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Possible Conditions</h4>
                <ul className="space-y-1">
                  {aiDiagnosis.possibleConditions.map((condition, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {aiDiagnosis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TherapyView = ({ therapists, therapySession, aiTherapist, onStartSession, onEndSession, onSendMessage }) => {
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  return (
    <>
      {/* Available Therapists */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available AI Therapists</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {therapists.map((therapist) => (
            <div key={therapist.id} className="border border-gray-200 rounded-lg p-4 text-center">
              <img
                src={therapist.avatar}
                alt={therapist.name}
                className="w-16 h-16 rounded-full mx-auto mb-3"
              />
              <h4 className="font-medium text-gray-900 mb-1">{therapist.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{therapist.specialization}</p>
              <div className="flex items-center justify-center space-x-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{therapist.rating}</span>
              </div>
              <button
                onClick={() => onStartSession(therapist)}
                disabled={!therapist.available}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  therapist.available
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Therapy Session */}
      {therapySession.isActive && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Session</h3>
            <button
              onClick={onEndSession}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              End Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video/Avatar */}
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <img
                  src={therapySession.therapist.avatar}
                  alt={therapySession.therapist.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <p className="text-lg font-medium text-gray-900">{therapySession.therapist.name}</p>
                <p className="text-sm text-gray-600">{therapySession.therapist.specialization}</p>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {aiTherapist.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.type === 'patient' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                        message.type === 'patient'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      onSendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const VitalsMonitorView = ({ vitals, onUpdateVitals }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitals Monitor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heart Rate */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Heart Rate</h4>
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900">{vitals.heartRate}</p>
            <p className="text-sm text-gray-600">beats per minute</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateVitals('heartRate', Math.max(40, vitals.heartRate - 5))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${((vitals.heartRate - 40) / 120) * 100}%` }}
              />
            </div>
            <button
              onClick={() => onUpdateVitals('heartRate', Math.min(160, vitals.heartRate + 5))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Blood Pressure</h4>
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900">
              {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
            </p>
            <p className="text-sm text-gray-600">mmHg</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">Systolic:</span>
              <input
                type="range"
                min="80"
                max="200"
                value={vitals.bloodPressure.systolic}
                onChange={(e) => onUpdateVitals('bloodPressure', {
                  ...vitals.bloodPressure,
                  systolic: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-900 w-12">{vitals.bloodPressure.systolic}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">Diastolic:</span>
              <input
                type="range"
                min="40"
                max="120"
                value={vitals.bloodPressure.diastolic}
                onChange={(e) => onUpdateVitals('bloodPressure', {
                  ...vitals.bloodPressure,
                  diastolic: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-900 w-12">{vitals.bloodPressure.diastolic}</span>
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Temperature</h4>
            <Thermometer className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900">{vitals.temperature}</p>
            <p className="text-sm text-gray-600">°C</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateVitals('temperature', Math.max(35, vitals.temperature - 0.1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${((vitals.temperature - 35) / 5) * 100}%` }}
              />
            </div>
            <button
              onClick={() => onUpdateVitals('temperature', Math.min(40, vitals.temperature + 0.1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">O2 Saturation</h4>
            <Droplets className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900">{vitals.oxygenSaturation}</p>
            <p className="text-sm text-gray-600">%</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateVitals('oxygenSaturation', Math.max(80, vitals.oxygenSaturation - 1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((vitals.oxygenSaturation - 80) / 20) * 100}%` }}
              />
            </div>
            <button
              onClick={() => onUpdateVitals('oxygenSaturation', Math.min(100, vitals.oxygenSaturation + 1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalRecordsView = ({ medicalRecords, patientData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Records</h3>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 text-gray-900">{patientData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 text-gray-900">{patientData.age} years</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 text-gray-900">{patientData.gender}</span>
            </div>
            <div>
              <span className="text-gray-600">Blood Type:</span>
              <span className="ml-2 text-gray-900">{patientData.bloodType}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Medical History</h4>
          <p className="text-gray-600 text-sm">No medical records available yet.</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
          <div className="flex flex-wrap gap-2">
            {patientData.allergies.map((allergy, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                {allergy}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Medications</h4>
          <div className="flex flex-wrap gap-2">
            {patientData.medications.map((medication, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {medication}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualClinic;
