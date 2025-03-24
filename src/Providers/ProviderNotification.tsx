"use client";

import React, { useState, useEffect, useContext } from "react";
import { Bell, CheckCircle, Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import MongoContext from "@/app/MongoContext";
import Link from "next/link";

function ProviderNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const mongodb: any = useContext(MongoContext);
  const { user, userData } = mongodb;

  // Calculate total notifications count:
  // unread notifications + (1 if profile is incomplete)
  const totalCount = unreadCount + (userData?.complete === false ? 1 : 0);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log("fetching");
      const { data } = await axios.get(
        `https://api.kinscare.org/api/v1/notifications/fetch`,
        {
          params: { userId: user.customData.userID },
        }
      );
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((notif: any) => !notif.read).length
      );
    } catch (error) {
      toast({
        title: "Error fetching notifications",
        description: "Failed to fetch notifications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log("marking as read");
      await axios.post(
        `https://api.kinscare.org/api/v1/notifications/mark-as-read`,
        { notificationId }
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    } catch (error) {
      console.log(error);
      toast({
        title: "Error updating notification",
        description: "Unable to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  // Fetch notifications on mount and set interval for periodic updates
  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative px-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="[&_svg]:size-5 relative p-2 rounded-full"
          >
            <Bell className="h-6 w-6" />
            {totalCount > 0 && (
              <span
                className="absolute text-white text-xs p-2 top-0 right-0 inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full font-bold"
              >
                {totalCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold">Notifications</h4>
            {totalCount > 0 && <Badge>{totalCount} unread</Badge>}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4 mt-4">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* When not loading, show notifications if available or the complete-profile alert */}
          {!loading && (notifications.length > 0 || userData?.complete === false) && (
            <div className="mt-4 space-y-3">
              {/* Complete Profile Notification */}
              {userData?.complete === false && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-100 cursor-pointer">
                  <Link
                    href="/provider/account/settings/profile"
                    className="flex-1"
                  >
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">
                        Complete Your Profile
                      </p>
                      <p className="text-xs text-yellow-600">
                        Update your profile to get the best experience.
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Other Notifications */}
              {notifications.slice(0, 4).map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    notification.read ? "bg-gray-50" : "bg-blue-100"
                  } cursor-pointer`}
                  onClick={() => markNotificationAsRead(notification._id)}
                >
                  <Link
                    className="mb-2 flex-1"
                    href={
                      notification.type === "job_application"
                        ? `/provider/candidates/${notification.fromUserId}`
                        : ``
                    }
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          notification.read ? "text-gray-800" : "font-semibold"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </Link>
                  {notification.read ? (
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Dot className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            notifications.length === 0 &&
            userData?.complete === true && (
              <div className="flex flex-col items-center justify-center h-32 space-y-2">
                <Bell className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}

          {/* Footer */}
          {!loading && notifications.length > 4 && (
            <div className="mt-4 text-center">
              <Button variant="link" size="sm">
                View all notifications
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ProviderNotification;
