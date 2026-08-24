import Dashboard from "@/src/views/Dashboard";
import { getStats, getMonthlyRevenue, getExpiringContracts } from "@/src/actions/dashboardActions";
import { redirect } from "next/navigation";

export default async function LandlordDashboardPage() {
  try {
    const [statsRes, revenueRes, expiringRes] = await Promise.all([
      getStats(),
      getMonthlyRevenue(),
      getExpiringContracts(),
    ]);
    return (
      <Dashboard
        stats={statsRes.data}
        revenue={revenueRes.data.chartData || []}
        expiring={expiringRes.data.contracts || []}
      />
    );
  } catch (err) {
    redirect("/login/landlord");
  }
}
