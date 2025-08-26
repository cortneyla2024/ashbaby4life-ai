"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  rsvps: Array<{
    id: string;
    status: string;
    rsvpdAt: string;
    user: {
      id: string;
      username: string;
      name: string;
    };
  }>;
  _count: {
    rsvps: number;
  };
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [userRSVP, setUserRSVP] = useState<{ status: string; rsvpdAt: string } | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const fetchEvent = async() => {
    try {
      const response = await fetch(`/api/social/events/${eventId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/dashboard/social");
          return;
        }
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      setEvent(data);

      // Find user's RSVP
      const currentUserRSVP = data.rsvps.find((rsvp: any) => rsvp.user.id === "current-user-id"); // This would need to be replaced with actual user ID
      setUserRSVP(currentUserRSVP || null);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching event:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRSVP = async(status: string) => {
    setRsvping(true);
    try {
      const response = await fetch(`/api/social/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchEvent(); // Refresh event data
      } else {
        const error = await response.json();
        alert(error.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      alert("Failed to RSVP to event");
    } finally {
      setRsvping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMs < 0) {
      return "Past event";
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} from now`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} from now`;
    } else {
      return "Starting soon";
    }
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  const getAttendingCount = () => {
    return event?.rsvps.filter(rsvp => rsvp.status === "ATTENDING").length || 0;
  };

  const getInterestedCount = () => {
    return event?.rsvps.filter(rsvp => rsvp.status === "INTERESTED").length || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
                      <p className="text-gray-600 mb-6">The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.push("/dashboard/social")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Social Hub
          </Button>
        </div>
      </div>
    );
  }

  const { date, time, relative } = formatDate(event.date);
  const upcoming = isUpcoming(event.date);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/social")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            <Badge variant={upcoming ? "default" : "secondary"}>
              {relative}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {upcoming && (
            <>
              <Button
                variant="outline"
                onClick={() => handleRSVP("INTERESTED")}
                disabled={rsvping || userRSVP?.status === "INTERESTED"}
                className="flex items-center space-x-2"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{rsvping ? "RSVPing..." : "Interested"}</span>
              </Button>
              <Button
                onClick={() => handleRSVP("ATTENDING")}
                disabled={rsvping || userRSVP?.status === "ATTENDING"}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{rsvping ? "RSVPing..." : "Attend"}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{getAttendingCount()}</div>
                <div className="text-sm text-gray-600">Attending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{getInterestedCount()}</div>
                <div className="text-sm text-gray-600">Interested</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900 truncate">{event.location}</div>
                <div className="text-sm text-gray-600">Location</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {event.organizer.name || event.organizer.username}
                </div>
                <div className="text-sm text-gray-600">Organizer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="attendees" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Attendees</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Date & Time</h4>
                        <p className="text-gray-600">{date} at {time}</p>
                        <p className="text-sm text-gray-500">{relative}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Location</h4>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Organizer</h4>
                        <p className="text-gray-600">{event.organizer.name || event.organizer.username}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendees">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Event Attendees</span>
                    <Badge variant="secondary">{event.rsvps.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Attending */}
                    {getAttendingCount() > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Attending ({getAttendingCount()})</span>
                        </h4>
                        <div className="space-y-2">
                          {event.rsvps
                            .filter(rsvp => rsvp.status === "ATTENDING")
                            .map((rsvp) => (
                              <div
                                key={rsvp.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {rsvp.user.name || rsvp.user.username}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      RSVP&apos;d {formatDate(rsvp.rsvpdAt).date}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Attending
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Interested */}
                    {getInterestedCount() > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span>Interested ({getInterestedCount()})</span>
                        </h4>
                        <div className="space-y-2">
                          {event.rsvps
                            .filter(rsvp => rsvp.status === "INTERESTED")
                            .map((rsvp) => (
                              <div
                                key={rsvp.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-yellow-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {rsvp.user.name || rsvp.user.username}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      RSVP&apos;d {formatDate(rsvp.rsvpdAt).date}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-yellow-200 text-yellow-800">
                                  Interested
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {event.rsvps.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No RSVPs yet</p>
                        {upcoming && (
                          <p className="text-sm mt-2">Be the first to RSVP!</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Status */}
          {userRSVP && (
            <Card>
              <CardHeader>
                <CardTitle>Your RSVP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {userRSVP.status === "ATTENDING" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <Badge variant={userRSVP.status === "ATTENDING" ? "default" : "outline"}>
                      {userRSVP.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    RSVP&apos;d on {formatDate(userRSVP.rsvpdAt).date}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Actions */}
          {upcoming && (
            <Card>
              <CardHeader>
                <CardTitle>Event Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!userRSVP ? (
                  <>
                    <Button
                      onClick={() => handleRSVP("ATTENDING")}
                      disabled={rsvping}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {rsvping ? "RSVPing..." : "Attend Event"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRSVP("INTERESTED")}
                      disabled={rsvping}
                      className="w-full"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {rsvping ? "RSVPing..." : "Interested"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      You&apos;re {userRSVP.status.toLowerCase()} this event
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleRSVP(userRSVP.status === "ATTENDING" ? "INTERESTED" : "ATTENDING")}
                      disabled={rsvping}
                      className="w-full"
                    >
                      Change RSVP
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Access</h4>
                <Badge variant={event.isPublic ? "default" : "secondary"}>
                  {event.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Total RSVPs</h4>
                <p className="text-2xl font-bold text-gray-900">{event._count.rsvps}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
