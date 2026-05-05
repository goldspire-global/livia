import { useBusiness } from "@/lib/business-context";
import { useGetDashboardSummary, useGetActivityFeed } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/format";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function DashboardPage() {
  const { business } = useBusiness();

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(
    business?.id ?? "",
    { query: { enabled: !!business?.id } as any }
  );

  const { data: activityFeed, isLoading: isLoadingActivity } = useGetActivityFeed(
    business?.id ?? "",
    { limit: 10 },
    { query: { enabled: !!business?.id } as any }
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your command center{business?.name ? `, ${business.name}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.todayBookings ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.pendingCount ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.completedTodayCount ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.totalCustomers ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : summary?.upcomingBookings && summary.upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {summary.upcomingBookings.map((booking) => (
                  <Link key={booking.id} href={`/bookings/${booking.id}`}>
                    <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">{booking.service.name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-primary">{formatTime(booking.startAt)}</span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activityFeed && activityFeed.length > 0 ? (
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary/50 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{activity.type}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(activity.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
