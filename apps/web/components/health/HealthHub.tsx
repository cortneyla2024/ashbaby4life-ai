"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function HealthHub() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Hub</CardTitle>
          <CardDescription>
            Central hub for health monitoring and wellness tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Health Hub component - Coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
