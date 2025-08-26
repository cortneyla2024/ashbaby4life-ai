'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'in-person' | 'telehealth';
}

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description: string;
}

export default function MedicalPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      status: 'scheduled',
      type: 'telehealth'
    },
    {
      id: '2',
      date: '2024-01-20',
      time: '2:30 PM',
      doctor: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      status: 'scheduled',
      type: 'in-person'
    }
  ]);

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  const [selectedTab, setSelectedTab] = useState('appointments');

  const addSymptom = () => {
    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: '',
      severity: 'mild',
      duration: '',
      description: ''
    };
    setSymptoms([...symptoms, newSymptom]);
  };

  const updateSymptom = (id: string, field: keyof Symptom, value: string) => {
    setSymptoms(symptoms.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const analyzeSymptoms = async () => {
    setIsAIAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAiDiagnosis('Based on your symptoms, I recommend consulting with a healthcare provider. The combination of symptoms suggests a potential respiratory condition that requires professional evaluation.');
      setIsAIAnalyzing(false);
    }, 3000);
  };

  const scheduleAppointment = () => {
    // Implementation for scheduling
    console.log('Scheduling appointment...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                CareConnect v5.0
              </Link>
              <Badge variant="secondary" className="ml-3">
                Medical Hub
              </Badge>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/ai-assistant">
                <Button>AI Assistant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Hub
          </h1>
          <p className="text-gray-600">
            AI-powered healthcare management with telehealth, diagnostics, and appointment scheduling.
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            <TabsTrigger value="diagnostics">AI Diagnostics</TabsTrigger>
            <TabsTrigger value="empathy">Empathy Interface</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Appointments</h2>
                <Button onClick={scheduleAppointment}>
                  Schedule New Appointment
                </Button>
              </div>
              
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{appointment.doctor}</h3>
                        <p className="text-gray-600">{appointment.specialty}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={appointment.type === 'telehealth' ? 'default' : 'secondary'}>
                          {appointment.type}
                        </Badge>
                        <Badge variant={appointment.status === 'scheduled' ? 'default' : 'outline'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Telehealth Tab */}
          <TabsContent value="telehealth" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Telehealth Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Start Video Consultation</h3>
                  <p className="text-gray-600">
                    Connect with healthcare providers through secure video calls.
                  </p>
                  <Button className="w-full">
                    Start Video Call
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">AI Health Assistant</h3>
                  <p className="text-gray-600">
                    Get preliminary health guidance from our AI assistant.
                  </p>
                  <Button variant="outline" className="w-full">
                    Chat with AI
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Diagnostics Tab */}
          <TabsContent value="diagnostics" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI-Powered Symptom Analysis</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Report Your Symptoms</h3>
                  <div className="space-y-4">
                    {symptoms.map((symptom) => (
                      <div key={symptom.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Symptom name"
                            value={symptom.name}
                            onChange={(e) => updateSymptom(symptom.id, 'name', e.target.value)}
                          />
                          <Select
                            value={symptom.severity}
                            onValueChange={(value) => updateSymptom(symptom.id, 'severity', value)}
                            options={[
                              { value: 'mild', label: 'Mild' },
                              { value: 'moderate', label: 'Moderate' },
                              { value: 'severe', label: 'Severe' }
                            ]}
                          />
                          <Input
                            placeholder="Duration (e.g., 2 days)"
                            value={symptom.duration}
                            onChange={(e) => updateSymptom(symptom.id, 'duration', e.target.value)}
                          />
                          <Button
                            variant="outline"
                            onClick={() => removeSymptom(symptom.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Describe your symptoms in detail..."
                          value={symptom.description}
                          onChange={(e) => updateSymptom(symptom.id, 'description', e.target.value)}
                          className="mt-4"
                        />
                      </div>
                    ))}
                    <Button variant="outline" onClick={addSymptom}>
                      Add Symptom
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={analyzeSymptoms}
                    disabled={symptoms.length === 0 || isAIAnalyzing}
                    className="flex-1"
                  >
                    {isAIAnalyzing ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Symptoms with AI'
                    )}
                  </Button>
                </div>

                {aiDiagnosis && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2">AI Analysis Results</h3>
                    <p className="text-gray-700">{aiDiagnosis}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Schedule Follow-up
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Empathy Interface Tab */}
          <TabsContent value="empathy" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Empathy Interface</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl mb-4">
                    🤖
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Health Companion</h3>
                  <p className="text-gray-600 mb-4">
                    Your empathetic AI companion for health guidance and emotional support.
                  </p>
                  <Button className="w-full max-w-md">
                    Start Empathy Session
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">💙</div>
                    <h4 className="font-semibold">Emotional Support</h4>
                    <p className="text-sm text-gray-600">24/7 compassionate listening</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🧠</div>
                    <h4 className="font-semibold">Mental Health</h4>
                    <p className="text-sm text-gray-600">Anxiety and stress management</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold">Goal Setting</h4>
                    <p className="text-sm text-gray-600">Health and wellness tracking</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
