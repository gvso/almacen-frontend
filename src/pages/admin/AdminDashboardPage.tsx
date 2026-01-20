import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Package, Wrench, ShoppingCart, ChevronRight, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAdminToken, verifyAdminToken } from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminDashboardPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const language = useLanguage();

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  const handleLogout = () => {
    clearAdminToken();
    navigate(`/${language}/admin`);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/${language}/admin/orders`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">Orders</CardTitle>
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage customer orders
              </p>
              <div className="flex items-center text-base text-primary mt-3 font-medium">
                View all <ChevronRight className="h-5 w-5 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/${language}/admin/tags`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">Tags</CardTitle>
              <Tags className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage tags for categorizing products and services
              </p>
              <div className="flex items-center text-base text-primary mt-3 font-medium">
                View all <ChevronRight className="h-5 w-5 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/${language}/admin/products`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">Fridge Stocking</CardTitle>
              <Package className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage fridge stocking products, translations, and variations
              </p>
              <div className="flex items-center text-base text-primary mt-3 font-medium">
                View all <ChevronRight className="h-5 w-5 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/${language}/admin/services`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">Celebration & Decor</CardTitle>
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage celebration services, translations, and variations
              </p>
              <div className="flex items-center text-base text-primary mt-3 font-medium">
                View all <ChevronRight className="h-5 w-5 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/${language}/admin/housekeeping`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold">Housekeeping</CardTitle>
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage housekeeping services, translations, and variations
              </p>
              <div className="flex items-center text-base text-primary mt-3 font-medium">
                View all <ChevronRight className="h-5 w-5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
