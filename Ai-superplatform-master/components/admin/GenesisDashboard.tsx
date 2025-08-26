"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemHealthLog {
  id: string;
  metric: string;
  value: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  notes?: string;
  createdAt: string;
}

interface SecurityAuditLog {
  id: string;
  auditType: string;
  result: "PASSED" | "FAILED" | "VULNERABILITY_FOUND";
  details?: string;
  remediationAction?: string;
  createdAt: string;
}

interface PerformanceTrace {
  id: string;
  operation: string;
  durationMs: number;
  isSlow: boolean;
  details?: string;
  createdAt: string;
}

interface GenesisTask {
  id: string;
  type: "HEALTH_CHECK" | "SECURITY_AUDIT" | "PERFORMANCE_ANALYSIS" | "AI_ANALYSIS";
  status: "RUNNING" | "COMPLETED" | "FAILED";
  description: string;
  timestamp: string;
  result?: string;
}

const GenesisDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealthLog[]>([]);
  const [securityAudits, setSecurityAudits] = useState<SecurityAuditLog[]>([]);
  const [performanceTraces, setPerformanceTraces] = useState<PerformanceTrace[]>([]);
  const [genesisTasks, setGenesisTasks] = useState<GenesisTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async() => {
    setIsLoading(true);
    try {
      // Load system health data
      const healthResponse = await fetch("/api/admin/system-health");
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.logs || []);
      }

      // Load security audit data
      const securityResponse = await fetch("/api/admin/security-audits");
      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        setSecurityAudits(securityData.logs || []);
      }

      // Load performance data
      const performanceResponse = await fetch("/api/admin/performance-traces");
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceTraces(performanceData.traces || []);
      }

      // Load Genesis Engine tasks
      const tasksResponse = await fetch("/api/admin/genesis-tasks");
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setGenesisTasks(tasksData.tasks || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSystemHealthCheck = async() => {
    try {
      await fetch("/api/cron/system-health");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to trigger health check:", error);
    }
  };

  const triggerSecurityAudit = async() => {
    try {
      await fetch("/api/cron/security-audit");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to trigger security audit:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NORMAL":
      case "PASSED":
        return "bg-green-500";
      case "WARNING":
        return "bg-yellow-500";
      case "CRITICAL":
      case "FAILED":
      case "VULNERABILITY_FOUND":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "NORMAL":
        return "Normal";
      case "WARNING":
        return "Warning";
      case "CRITICAL":
        return "Critical";
      case "PASSED":
        return "Passed";
      case "FAILED":
        return "Failed";
      case "VULNERABILITY_FOUND":
        return "Vulnerability Found";
      default:
        return status;
    }
  };

  const getMetricDisplayValue = (metric: string, value: number) => {
    switch (metric) {
      case "DB_LATENCY":
        return `${value.toFixed(0)}ms`;
      case "API_ERROR_RATE":
        return `${(value * 100).toFixed(2)}%`;
      case "MEMORY_USAGE":
      case "CPU_LOAD":
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const recentSystemHealth = systemHealth.slice(0, 10);
  const recentSecurityAudits = securityAudits.slice(0, 10);
  const recentPerformanceTraces = performanceTraces.filter(t => t.isSlow).slice(0, 10);
  const recentTasks = genesisTasks.slice(0, 10);

  const criticalIssues = systemHealth.filter(h => h.status === "CRITICAL").length;
  const securityIssues = securityAudits.filter(s => s.result !== "PASSED").length;
  const slowOperations = performanceTraces.filter(p => p.isSlow).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Genesis Engine Control Panel
            </h1>
            <p className="text-gray-400 mt-2">
              Autonomous Sustenance & Security Engine v2.0
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last Update</p>
            <p className="text-sm">{lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gray-900 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Health</p>
              <p className="text-2xl font-bold text-green-400">{systemHealth.length}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${criticalIssues > 0 ? "bg-red-500" : "bg-green-500"}`} />
          </div>
          {criticalIssues > 0 && (
            <p className="text-red-400 text-sm mt-2">{criticalIssues} critical issues</p>
          )}
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Security Status</p>
              <p className="text-2xl font-bold text-blue-400">{securityAudits.length}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${securityIssues > 0 ? "bg-red-500" : "bg-green-500"}`} />
          </div>
          {securityIssues > 0 && (
            <p className="text-red-400 text-sm mt-2">{securityIssues} issues found</p>
          )}
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Performance</p>
              <p className="text-2xl font-bold text-yellow-400">{performanceTraces.length}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${slowOperations > 0 ? "bg-yellow-500" : "bg-green-500"}`} />
          </div>
          {slowOperations > 0 && (
            <p className="text-yellow-400 text-sm mt-2">{slowOperations} slow operations</p>
          )}
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tasks</p>
              <p className="text-2xl font-bold text-purple-400">{genesisTasks.length}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <p className="text-purple-400 text-sm mt-2">Genesis Engine active</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <Button
          onClick={triggerSystemHealthCheck}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          🔍 Run Health Check
        </Button>
        <Button
          onClick={triggerSecurityAudit}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          🛡️ Run Security Audit
        </Button>
        <Button
          onClick={loadDashboardData}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          🔄 Refresh Data
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tasks">Genesis Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-700">
            <h3 className="text-xl font-semibold mb-4">System Health Metrics</h3>
            <div className="space-y-4">
              {recentSystemHealth.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(log.status)}`} />
                    <div>
                      <p className="font-medium">{log.metric}</p>
                      <p className="text-sm text-gray-400">{log.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{getMetricDisplayValue(log.metric, log.value)}</p>
                    <Badge className={getStatusColor(log.status)}>
                      {getStatusText(log.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Security Audit Results</h3>
            <div className="space-y-4">
              {recentSecurityAudits.map((audit) => (
                <div key={audit.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(audit.result)}`} />
                      <p className="font-medium">{audit.auditType}</p>
                    </div>
                    <Badge className={getStatusColor(audit.result)}>
                      {getStatusText(audit.result)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {new Date(audit.createdAt).toLocaleString()}
                  </p>
                  {audit.remediationAction && (
                    <div className="mt-2 p-3 bg-gray-700 rounded">
                      <p className="text-sm font-medium text-yellow-400">AI Remediation Plan:</p>
                      <p className="text-sm text-gray-300 mt-1">{audit.remediationAction}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Performance Traces</h3>
            <div className="space-y-4">
              {recentPerformanceTraces.map((trace) => (
                <div key={trace.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{trace.operation}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{trace.durationMs}ms</span>
                      {trace.isSlow && (
                        <Badge className="bg-yellow-500">Slow</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(trace.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="p-6 bg-gray-900 border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Genesis Engine Tasks</h3>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                      <div>
                        <p className="font-medium">{task.type}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(task.timestamp).toLocaleString()}
                  </p>
                  {task.result && (
                    <div className="mt-2 p-3 bg-gray-700 rounded">
                      <p className="text-sm text-purple-400">AI Analysis Result:</p>
                      <p className="text-sm text-gray-300 mt-1">{task.result}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenesisDashboard;
