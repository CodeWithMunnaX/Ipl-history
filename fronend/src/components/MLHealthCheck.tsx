"use client"

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MLHealthCheckProps {
  className?: string;
}

export default function MLHealthCheck({ className = "" }: MLHealthCheckProps) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/health`);
      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check error:', error);
      setHealth({
        status: 'unhealthy',
        services: {},
        error: 'Failed to connect to ML services'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  // Prepare chart data for overall status
  const getOverallStatusData = () => {
    if (!health) return [];
    
    const services = health.services || {};
    const totalServices = Object.keys(services).length;
    const healthyServices = Object.values(services).filter(status => 
      status === 'healthy' || status === 'operational'
    ).length;
    const unhealthyServices = totalServices - healthyServices;
    
    return [
      { name: 'Healthy', value: healthyServices, color: '#10B981' },
      { name: 'Unhealthy', value: unhealthyServices, color: '#EF4444' }
    ];
  };

  // Prepare radial chart data for service health
  const getServiceHealthData = () => {
    if (!health?.services) return [];
    
    const services = health.services;
    return Object.entries(services).map(([service, status]) => ({
      name: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: status === 'healthy' || status === 'operational' ? 100 : 0,
      fill: status === 'healthy' || status === 'operational' ? '#10B981' : '#EF4444'
    }));
  };

  // Prepare bar chart data for services
  const getServicesBarData = () => {
    if (!health?.services) return [];
    
    return Object.entries(health.services).map(([service, status]) => ({
      name: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).substring(0, 12),
      fullName: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: status,
      value: status === 'healthy' || status === 'operational' ? 100 : 0,
      fill: status === 'healthy' || status === 'operational' ? '#10B981' : '#EF4444'
    }));
  };

  // Prepare individual service status data
  const getIndividualServiceData = () => {
    if (!health?.services) return [];
    
    return Object.entries(health.services).map(([service, status]) => ({
      name: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: status,
      healthy: status === 'healthy' || status === 'operational' ? 1 : 0,
      unhealthy: status === 'healthy' || status === 'operational' ? 0 : 1,
      fill: status === 'healthy' || status === 'operational' ? '#10B981' : '#EF4444'
    }));
  };

  return (
    <Card className={`shadow-lg border-2 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-5 h-5" />
            ML Services Health
          </CardTitle>
          <Button
            onClick={checkHealth}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {!health ? (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Checking ML services...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dynamic Overall Status with Charts */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800 text-lg">Overall Status</span>
                </div>
                <span className="font-bold text-green-800 text-xl capitalize">
                  {health.status || 'Unknown'}
                </span>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart - Service Distribution */}
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Service Distribution</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={getOverallStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getOverallStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [`${value} services`, name]}
                        labelStyle={{ color: '#374151' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Radial Chart - Individual Service Health */}
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Service Health</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={getServiceHealthData()}>
                      <RadialBar dataKey="value" cornerRadius={4} fill="#10B981" />
                      <Tooltip 
                        formatter={(value: any) => [`${value}%`, 'Health']}
                        labelStyle={{ color: '#374151' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(health.services || {}).filter(status => 
                      status === 'healthy' || status === 'operational'
                    ).length}
                  </div>
                  <div className="text-xs text-gray-600">Healthy Services</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(health.services || {}).length}
                  </div>
                  <div className="text-xs text-gray-600">Total Services</div>
                </div>
              </div>
            </div>

            {/* Individual Services with Dynamic Charts */}
            {health.services && Object.keys(health.services).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">Services Status:</p>
                </div>
                
                {/* Services Bar Chart */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Service Health Overview</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getServicesBarData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        fontSize={10}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value}%`, 
                          props.payload.fullName,
                          `Status: ${props.payload.status}`
                        ]}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #d1d5db',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        fill="#3B82F6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Individual Service Status Chart */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Service Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={getIndividualServiceData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="healthy"
                        label={({ name, status }) => `${name}: ${status}`}
                        labelLine={false}
                      >
                        {getIndividualServiceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${props.payload.status}`, 
                          props.payload.name
                        ]}
                        labelStyle={{ color: '#374151' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Individual Services List with Enhanced Design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(health.services).map(([service, status]) => (
                    <div key={service} className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      status === 'healthy' || status === 'operational' 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status as string)}
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {service.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className={`text-xs font-bold capitalize px-2 py-1 rounded-full ${
                          status === 'healthy' || status === 'operational'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status as string}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full ${
                          status === 'healthy' || status === 'operational' ? 'bg-green-200' : 'bg-red-200'
                        }`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              status === 'healthy' || status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: status === 'healthy' || status === 'operational' ? '100%' : '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {health.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-red-700 font-semibold">Error:</p>
                <p className="text-xs sm:text-sm text-red-600">{health.error}</p>
              </div>
            )}

            {/* Version Info */}
            {health.version && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>Version:</strong> {health.version}
                </p>
              </div>
            )}

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-gray-500 text-center">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
