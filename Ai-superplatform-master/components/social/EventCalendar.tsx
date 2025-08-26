"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  isPublic: boolean;
  organizer: {
    id: string;
    username: string;
    name: string;
  };
  _count: {
    rsvps: number;
  };
}

interface EventCalendarProps {
  onViewEvent?: (eventId: string) => void;
  onRSVP?: (eventId: string, status: string) => void;
}

export default function EventCalendar({ onViewEvent, onRSVP }: EventCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rsvping, setRsvping] = useState<string | null>(null);

  const fetchEvents = async() => {
    try {
      const response = await fetch("/api/social/events?upcoming=true&limit=50");
      if (!response.ok) {
throw new Error("Failed to fetch events");
}

      const data = await response.json();
      setEvents(data.events);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = async(eventId: string, status: string) => {
    setRsvping(eventId);
    try {
      const response = await fetch(`/api/social/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update the event to show new RSVP count
        setEvents(prev =>
          prev.map(event =>
            event.id === eventId
              ? { ...event, _count: { ...event._count, rsvps: event._count.rsvps + 1 } }
              : event
          )
        );
        onRSVP?.(eventId, status);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      alert("Failed to RSVP to event");
    } finally {
      setRsvping(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isUpcoming = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    return eventDate > now;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Event Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Event Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((date, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-1 border border-gray-200 ${
                date ? "bg-white" : "bg-gray-50"
              }`}
            >
              {date && (
                <>
                  <div className={`text-xs font-medium mb-1 ${
                    isToday(date.toISOString())
                      ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      : "text-gray-900"
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(date).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                        onClick={() => onViewEvent?.(event.id)}
                        title={event.name}
                      >
                        <div className="font-medium truncate">{event.name}</div>
                        <div className="text-blue-600 truncate">
                          {formatDate(event.date).time}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Events List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(event => isUpcoming(event.date))
              .slice(0, 5)
              .map(event => {
                const { date, time, fullDate } = formatDate(event.date);
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {event.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{fullDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-20">{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{event._count.rsvps}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleRSVP(event.id, "ATTENDING")}
                            disabled={rsvping === event.id}
                          >
                            {rsvping === event.id ? "RSVPing..." : "Attend"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewEvent?.(event.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {events.filter(event => isUpcoming(event.date)).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
