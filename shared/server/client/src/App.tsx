import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BookReader from "@/pages/book-reader";
import BigIdea from "@/pages/big-idea";
import Search from "@/pages/search";
import Library from "@/pages/library";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import Subscription from "@/pages/subscription";
import ContentManager from "@/pages/content-manager";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (isAuthenticated && !isLoading && !onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Check if user has trial or subscription - make this reactive
    const checkSubscription = () => {
      const trialStarted = localStorage.getItem("trial_started");
      const subscriptionSelected = localStorage.getItem("subscription_selected");
      setHasSubscription(!!(trialStarted || subscriptionSelected));
    };

    // Auto-start trial if not set (for demo purposes)
    if (!localStorage.getItem("trial_started") && !localStorage.getItem("subscription_selected")) {
      localStorage.setItem("trial_started", "true");
    }

    // Initial check
    checkSubscription();

    // Listen for storage changes
    window.addEventListener('storage', checkSubscription);
    
    // Also check periodically for same-window changes
    const interval = setInterval(checkSubscription, 100);

    return () => {
      window.removeEventListener('storage', checkSubscription);
      clearInterval(interval);
    };
  }, []);

  // Debug routing state
  console.log("Routing state:", {
    isLoading,
    isAuthenticated,
    hasSubscription,
    showOnboarding,
    condition: isLoading ? "loading" : 
               !isAuthenticated && !hasSubscription ? "landing" :
               !isAuthenticated && hasSubscription ? "home_trial" :
               showOnboarding ? "onboarding" : "home_auth"
  });

  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/subscription" component={Subscription} />
      {isLoading && !hasSubscription ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated && !hasSubscription ? (
        <>
          <Route path="/" component={Landing} />
          <Route component={NotFound} />
        </>
      ) : (!isAuthenticated && hasSubscription) || (isLoading && hasSubscription) ? (
        <>
          {/* User has trial/subscription - show app content even during loading */}
          <Route path="/" component={Home} />
          <Route path="/book/:id" component={BookReader} />
          <Route path="/summary/:id" component={BookReader} />
          <Route path="/big-idea/:id" component={BigIdea} />
          <Route path="/search" component={Search} />
          <Route path="/library" component={Library} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin/content" component={ContentManager} />
          <Route path="/content-manager" component={ContentManager} />
          <Route component={NotFound} />
        </>
      ) : showOnboarding ? (
        <Route path="*" component={Onboarding} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/book/:id" component={BookReader} />
          <Route path="/summary/:id" component={BookReader} />
          <Route path="/big-idea/:id" component={BigIdea} />
          <Route path="/search" component={Search} />
          <Route path="/library" component={Library} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin/content" component={ContentManager} />
          <Route path="/content-manager" component={ContentManager} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="echoread-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
