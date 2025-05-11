import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "./context/ChatContext";
import { AISettingsProvider } from "./context/AISettingsContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Recommendation from "@/pages/Recommendation";
import NotFound from "@/pages/not-found";
import AISettingsPanel from "@/components/AISettingsPanel";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AISettingsProvider>
          <ChatProvider>
            <div className="flex flex-col min-h-screen bg-neutral-light">
              <Header />
              <main className="flex-grow">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/chat" component={Chat} />
                  <Route path="/recommendation" component={Recommendation} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
              <AISettingsPanel />
              <Toaster />
            </div>
          </ChatProvider>
        </AISettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
