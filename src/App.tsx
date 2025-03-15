import { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import appRoutes from "./lib/routesConfig"; // Use your custom routes config
import { AuthProvider, useAuth } from "../supabase/auth";
import { RecipeProvider } from "./components/recipe/RecipeService";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen } from "./components/ui/loading-spinner";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  // This will return the route element tree based on the configuration
  const routesElement = useRoutes(appRoutes);
  return routesElement;
}

function App() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <Suspense fallback={<LoadingScreen text="Loading application..." />}>
          <AppRoutes />
        </Suspense>
        <Toaster />
      </RecipeProvider>
    </AuthProvider>
  );
}

export default App;
