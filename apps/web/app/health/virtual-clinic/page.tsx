'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Activity,
  Thermometer,
  Stethoscope,
  Brain,
  Calendar,
  Clock,
  MessageSquare,
  Video,
  Phone,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Users,
  Star,
  Shield,
  Lock,
  Eye,
  Mic,
  Camera,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
}

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: Date;
  duration: number;
  type: 'video' | 'phone' | 'in-person' | 'ai-consultation';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  symptoms: string[];
  notes?: string;
}

interface MedicalRecord {
  id: string;
  date: Date;
  type: 'consultation' | 'lab-result' | 'prescription' | 'imaging';
  title: string;
  description: string;
  provider: string;
  attachments: string[];
  isPrivate: boolean;
}

interface AITherapySession {
  id: string;
  type: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'general';
  duration: number;
  date: Date;
  moodBefore: number;
  moodAfter: number;
  techniques: string[];
  insights: string[];
  nextSession?: Date;
}

const VirtualClinic: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'appointments' | 'records' | 'ai-therapy' | 'vitals'>('dashboard');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [aiSessions, setAiSessions] = useState<AITherapySession[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isInConsultation, setIsInConsultation] = useState(false);

  // Mock data
  const mockHealthMetrics: HealthMetric[] = [
    {
      id: '1',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'normal',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
      trend: 'stable'
    },
    {
      id: '2',
      name: 'Blood Pressure',
      value: 120,
      unit: 'mmHg',
      status: 'normal',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      trend: 'down'
    },
    {
      id: '3',
      name: 'Temperature',
      value: 98.6,
      unit: '°F',
      status: 'normal',
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      trend: 'stable'
    },
    {
      id: '4',
      name: 'Oxygen Saturation',
      value: 98,
      unit: '%',
      status: 'normal',
      lastUpdated: new Date(Date.now() - 45 * 60 * 1000),
      trend: 'up'
    },
    {
      id: '5',
      name: 'Sleep Quality',
      value: 7.5,
      unit: '/10',
      status: 'normal',
      lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000),
      trend: 'up'
    },
    {
      id: '6',
      name: 'Stress Level',
      value: 4,
      unit: '/10',
      status: 'warning',
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      trend: 'up'
    }
  ];

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'You',
      doctorName: 'Dr. Sarah Wilson',
      specialty: 'General Practice',
      date: new Date(Date.now() + 2 * 60 * 60 * 1000),
      duration: 30,
      type: 'video',
      status: 'scheduled',
      symptoms: ['headache', 'fatigue'],
      notes: 'Follow-up on recent symptoms'
    },
    {
      id: '2',
      patientName: 'You',
      doctorName: 'AI Therapist Maya',
      specialty: 'Mental Health',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 45,
      type: 'ai-consultation',
      status: 'scheduled',
      symptoms: ['anxiety', 'stress'],
      notes: 'Weekly therapy session'
    },
    {
      id: '3',
      patientName: 'You',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 45,
      type: 'video',
      status: 'completed',
      symptoms: ['chest pain', 'palpitations'],
      notes: 'Cardiac evaluation completed'
    }
  ];

  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: '1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'consultation',
      title: 'Cardiology Consultation',
      description: 'Routine cardiac evaluation. EKG normal, blood pressure stable.',
      provider: 'Dr. Michael Chen',
      attachments: ['ekg-results.pdf', 'blood-pressure-log.csv'],
      isPrivate: false
    },
    {
      id: '2',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      type: 'lab-result',
      title: 'Blood Work Results',
      description: 'Complete blood count and metabolic panel. All values within normal range.',
      provider: 'LabCorp',
      attachments: ['blood-work.pdf'],
      isPrivate: false
    },
    {
      id: '3',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      type: 'prescription',
      title: 'Medication Prescription',
      description: 'Prescribed medication for anxiety management.',
      provider: 'Dr. Sarah Wilson',
      attachments: ['prescription.pdf'],
      isPrivate: true
    }
  ];

  const mockAISessions: AITherapySession[] = [
    {
      id: '1',
      type: 'anxiety',
      duration: 45,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      moodBefore: 3,
      moodAfter: 6,
      techniques: ['Deep breathing', 'Progressive muscle relaxation', 'Cognitive reframing'],
      insights: ['Identified work stress as primary trigger', 'Improved coping strategies'],
      nextSession: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'stress',
      duration: 30,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      moodBefore: 4,
      moodAfter: 7,
      techniques: ['Mindfulness meditation', 'Stress visualization'],
      insights: ['Better stress management techniques learned', 'Improved self-awareness'],
    }
  ];

  useEffect(() => {
    setHealthMetrics(mockHealthMetrics);
    setAppointments(mockAppointments);
    setMedicalRecords(mockMedicalRecords);
    setAiSessions(mockAISessions);
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'scheduled': return 'text-blue-600';
      case 'in-progress': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      case 'scheduled': return Calendar;
      case 'in-progress': return Activity;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab-result': return 'bg-green-100 text-green-800';
      case 'prescription': return 'bg-purple-100 text-purple-800';
      case 'imaging': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsInConsultation(true);
    // Update appointment status
    setAppointments(prev => prev.map(apt => 
      apt.id === appointment.id ? { ...apt, status: 'in-progress' } : apt
    ));
  };

  const handleEndConsultation = () => {
    if (selectedAppointment) {
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id ? { ...apt, status: 'completed' } : apt
      ));
    }
    setIsInConsultation(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Clinic</h1>
          <p className="text-gray-600">AI-powered telehealth with symptom triage and empathy modeling</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: Activity },
            { key: 'appointments', label: 'Appointments', icon: Calendar },
            { key: 'records', label: 'Medical Records', icon: FileText },
            { key: 'ai-therapy', label: 'AI Therapy', icon: Brain },
            { key: 'vitals', label: 'Vitals Monitoring', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dashboard */}
            {view === 'dashboard' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Appointment</p>
                        <p className="text-2xl font-bold text-gray-900">2 hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="text-2xl font-bold text-gray-900">85/100</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">AI Sessions</p>
                        <p className="text-2xl font-bold text-gray-900">{aiSessions.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Monitors</p>
                        <p className="text-2xl font-bold text-gray-900">6</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Metrics Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Health Metrics Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthMetrics.slice(0, 6).map((metric) => {
                      const StatusIcon = getStatusIcon(metric.status);
                      return (
                        <motion.div
                          key={metric.id}
                          whileHover={{ scale: 1.02 }}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{metric.name}</h4>
                            <StatusIcon className={`w-5 h-5 ${getStatusColor(metric.status)}`} />
                          </div>
                          
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-sm text-gray-600">{metric.unit}</span>
                            <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Updated {formatTime(metric.lastUpdated)}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Schedule New
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments.filter(apt => apt.status === 'scheduled').slice(0, 3).map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              {appointment.type === 'video' ? <Video className="w-6 h-6 text-blue-600" /> :
                               appointment.type === 'phone' ? <Phone className="w-6 h-6 text-blue-600" /> :
                               appointment.type === 'ai-consultation' ? <Brain className="w-6 h-6 text-blue-600" /> :
                               <Stethoscope className="w-6 h-6 text-blue-600" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.doctorName}</h4>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(appointment.date)} at {formatTime(appointment.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <button
                              onClick={() => handleStartConsultation(appointment)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Start Consultation
                            </button>
                            <p className="text-sm text-gray-500 mt-1">{appointment.duration} min</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appointments */}
            {view === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">All Appointments</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Schedule Appointment
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              {appointment.type === 'video' ? <Video className="w-6 h-6 text-blue-600" /> :
                               appointment.type === 'phone' ? <Phone className="w-6 h-6 text-blue-600" /> :
                               appointment.type === 'ai-consultation' ? <Brain className="w-6 h-6 text-blue-600" /> :
                               <Stethoscope className="w-6 h-6 text-blue-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{appointment.doctorName}</h4>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(appointment.date)} at {formatTime(appointment.date)} • {appointment.duration} min
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status.replace('-', ' ')}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStartConsultation(appointment)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Start Consultation
                              </button>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                Reschedule
                              </button>
                              <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                Cancel
                              </button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                              View Summary
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Records */}
            {view === 'records' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Medical Records</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Record
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <motion.div
                        key={record.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{record.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                                {record.type.replace('-', ' ')}
                              </span>
                              {record.isPrivate && (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(record.date)}</span>
                              <span>•</span>
                              <span>{record.provider}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {record.attachments.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-700 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {record.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{attachment}</span>
                                  <button className="text-gray-500 hover:text-gray-700">
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Therapy */}
            {view === 'ai-therapy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">AI Therapy Sessions</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Start New Session
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 capitalize">{session.type} Session</h4>
                              <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{session.duration} min</span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Mood Before:</span>
                            <span className="text-sm font-medium">{session.moodBefore}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Mood After:</span>
                            <span className="text-sm font-medium">{session.moodAfter}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Improvement:</span>
                            <span className={`text-sm font-medium ${
                              session.moodAfter > session.moodBefore ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              +{session.moodAfter - session.moodBefore}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 mb-2">Techniques Used:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.techniques.map((technique, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {technique}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 mb-2">Key Insights:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {session.insights.map((insight, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {session.nextSession && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              Next session: {formatDate(session.nextSession)} at {formatTime(session.nextSession)}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Monitoring */}
            {view === 'vitals' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Real-time Vitals Monitoring</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthMetrics.map((metric) => {
                      const StatusIcon = getStatusIcon(metric.status);
                      return (
                        <motion.div
                          key={metric.id}
                          whileHover={{ scale: 1.02 }}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                            <StatusIcon className={`w-6 h-6 ${getStatusColor(metric.status)}`} />
                          </div>
                          
                          <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {metric.value}
                            </div>
                            <div className="text-sm text-gray-600">
                              {metric.unit}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Trend:</span>
                            <span className="flex items-center space-x-1">
                              <span>{getTrendIcon(metric.trend)}</span>
                              <span className={`font-medium ${getStatusColor(metric.status)}`}>
                                {metric.status}
                              </span>
                            </span>
                          </div>
                          
                          <div className="mt-4 text-xs text-gray-500">
                            Last updated: {formatTime(metric.lastUpdated)}
                          </div>
                          
                          <div className="mt-4">
                            <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                              View History
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Consultation Modal */}
        {isInConsultation && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Consultation with {selectedAppointment.doctorName}
                  </h2>
                  <button
                    onClick={handleEndConsultation}
                    className="text-red-600 hover:text-red-700"
                  >
                    End Consultation
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Video consultation in progress</p>
                        <p className="text-sm opacity-75">Duration: 15:32</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <Mic className="w-6 h-6 text-gray-600" />
                      </button>
                      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <Camera className="w-6 h-6 text-gray-600" />
                      </button>
                      <button className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                        <Phone className="w-6 h-6 text-white" />
                      </button>
                      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <Settings className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Consultation Notes</h4>
                      <textarea
                        placeholder="Enter consultation notes..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                      />
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Symptoms:</span>
                          <span>{selectedAppointment.symptoms.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedAppointment.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{selectedAppointment.type.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Share Screen
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Send Prescription
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Schedule Follow-up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualClinic;
