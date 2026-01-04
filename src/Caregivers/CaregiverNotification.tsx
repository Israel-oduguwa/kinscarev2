/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { cn } from "@/lib/utils";
import { Bell, Briefcase, ChevronRight, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function CaregiverNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const authData: any = useAuthContext();
  const { userData } = authData;
  const { privateApi } = useApiClient();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await privateApi.get(`/api/v1/notifications/fetch`, {
        params: { userId: userData.userID },
      });
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((notif: any) => !notif.read).length
      );
    } catch (error) {
      // console.log(error);
      toast({
        title: "Error fetching notifications",
        description: "Failed to fetch notifications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await privateApi.post(`/api/v1/notifications/mark-as-read`, {
        notificationId,
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    } catch (error) {
      // console.log(error);
      toast({
        title: "Error updating notification",
        description: "Unable to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await privateApi.post(`/api/v1/notifications/mark-all-read`, {
        userId: userData.userID,
      });
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error updating notifications",
        description: "Unable to mark all as read.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userData) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 300000);
      return () => clearInterval(interval);
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_application":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "job_application_status":
        return <UserCheck className="h-4 w-4 text-amber-600" />;
      case "message_caregiver":
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-purple-600" />;
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "message_caregiver":
        return `/vitae/provider/${notification.fromUserId}`;
      case "job_application":
        return `/vitae/jobs/${notification.metadata?.jobId}`;
      case "job_application_status":
        return `/vitae/jobs/${notification?.jobId}`;
      default:
        return `/vitae/referrals`;
    }
  };

  const totalCount = unreadCount + (userData?.complete === false ? 1 : 0);

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative w-12 h-12 [&>svg]:h-6! [&>svg]:w-6! rounded-full bg-transparent hover:bg-slate-100 transition-all duration-200 group"
          >
            <Bell className="h-6 w-6 text-slate-600 group-hover:text-slate-900 transition-colors" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {totalCount}
                </span>
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-96 p-0 rounded-2xl border-0 shadow-xl bg-white overflow-hidden"
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Notifications</h4>
              <p className="text-sm text-slate-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Profile Completion Banner */}
          {userData?.complete === false && (
            <Link href="/vitae/update">
              <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer group hover:bg-amber-100 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <UserCheck className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Complete Your Profile
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Update your profile to get the best experience.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-4 p-6">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="flex items-start gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No notifications
                </h3>
                <p className="text-slate-500 text-sm">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.slice(0, 6).map((notification) => (
                  <Link
                    key={notification._id}
                    href={getNotificationLink(notification)}
                  >
                    <div
                      onClick={() => markNotificationAsRead(notification._id)}
                      className={cn(
                        "group flex items-start gap-4 p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200",
                        notification.read 
                          ? "bg-white hover:bg-slate-50" 
                          : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
                      )}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={cn(
                          "p-2 rounded-lg",
                          notification.read ? "bg-slate-100" : "bg-blue-100"
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm leading-relaxed",
                            notification.read ? "text-slate-700" : "text-slate-900 font-medium"
                          )}>
                            {notification.type === "job_application" 
                              ? `${notification.caregiverName} applied for ${notification.metadata?.jobTitle}`
                              : notification.message
                            }
                          </p>
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 p-4 bg-slate-50">
              <Link href="/vitae/notifications">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-slate-600 hover:text-slate-900 hover:bg-white font-medium rounded-lg"
                >
                  View all notifications
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CaregiverNotification;
