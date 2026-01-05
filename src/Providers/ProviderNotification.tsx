"use client";

import { Badge } from "@/components/ui/badge";
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
import { Bell, CheckCircle, Dot } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function ProviderNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const authData: any = useAuthContext();
  const { userData, contactData } = authData;

  // Calculate total notifications count:
  // unread notifications + (1 if profile is incomplete)
  const totalCount = unreadCount + (userData?.complete === false ? 1 : 0);
  const { privateApi } = useApiClient();
  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await privateApi.get(
        `/api/v1/notifications/fetch`,
        {
          params: { userId: contactData.userID },
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
      await privateApi.post(
        `/api/v1/notifications/mark-as-read`,
        { notificationId }
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    } catch (error) {
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
            className="relative h-12 w-12 rounded-full bg-transparent transition-all duration-200 hover:bg-slate-100 [&>svg]:h-5! [&>svg]:w-5! md:[&>svg]:h-6! md:[&>svg]:w-6!"
          >
            <Bell className="h-6 w-6 text-slate-600" />
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
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Notifications
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {totalCount > 0 && (
              <Badge className="bg-slate-100 text-slate-700">
                {totalCount} unread
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4 p-6">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                    <div className="h-3 w-1/2 rounded bg-slate-200"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* When not loading, show notifications if available or the complete-profile alert */}
          {!loading && (notifications.length > 0 || userData?.complete === false) && (
            <div className="p-2">
              {/* Complete Profile Notification */}
              {userData?.complete === false && (
                <Link href="/provider/account/settings/profile">
                  <div className="mx-2 my-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Complete your profile</p>
                    <p className="mt-1 text-xs text-amber-700">
                      Update your profile to get the best experience.
                    </p>
                  </div>
                </Link>
              )}

              {/* Other Notifications */}
              {notifications.slice(0, 4).map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 mx-2",
                    notification.read
                      ? "bg-white hover:bg-slate-50"
                      : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
                  )}
                  onClick={() => markNotificationAsRead(notification._id)}
                >
                  <Link
                    className="flex-1"
                    href={
                      notification.type === "job_application"
                        ? `/provider/candidates/${notification.fromUserId}`
                        : ``
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          notification.read
                            ? "text-slate-700"
                            : "text-slate-900 font-medium"
                        )}
                      >
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </Link>
                  {notification.read ? (
                    <CheckCircle className="h-5 w-5 text-slate-400" />
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
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No notifications yet</p>
              </div>
            )}

          {/* Footer */}
          {!loading && notifications.length > 4 && (
            <div className="border-t border-slate-100 p-4 bg-slate-50">
              <Button variant="ghost" size="sm" className="w-full justify-center text-slate-600 hover:text-slate-900 hover:bg-white">
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
