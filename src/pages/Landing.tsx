import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  StickyNote,
  BarChart3,
  Sparkles,
  ArrowRight,
  Bot
} from "lucide-react";


const features = [
  {
    icon: StickyNote,
    title: "Expense Notes",
    description: "Quickly note and track your daily expenses",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Get smart suggestions to optimize spending",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Visual insights into your spending patterns",
  },
  {
    icon: MessageCircle,
    title: "Smart Chatbot",
    description: "Ask questions about your finances naturally",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">FinanceAI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 pt-12 pb-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Bot Icon */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-pulse-soft" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center animate-bounce-gentle shadow-soft-xl">
              <Bot className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
            Your AI-Powered{" "}
            <span className="text-primary">Financial Assistant</span>
          </h1>

          <p className="text-muted-foreground text-lg mb-8 animate-fade-in-up stagger-1">
            Track expenses, get AI-powered insights, and manage your finances smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up stagger-2">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="gpt"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Chat Preview */}
      <section className="container px-4 py-8">
        <Card className="max-w-md mx-auto overflow-hidden animate-fade-in-up stagger-3">
          <div className="bg-muted/50 px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-center text-muted-foreground">
              Financial Assistant
            </p>
          </div>
          <CardContent className="p-4 space-y-3">
            {/* Assistant Message */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
                <p className="text-sm">Hi! I can help you track expenses and analyze your spending. What would you like to know?</p>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-2 justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                <p className="text-sm">How much did I spend last month?</p>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-12">
        <h2 className="text-xl font-semibold text-center text-foreground mb-8 animate-fade-in-up">
          Everything you need
        </h2>

        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="animate-fade-in-up hover:shadow-gpt-hover transition-all duration-300"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent mx-auto mb-3 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-12 pb-24">
        <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to get started?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join thousands of users managing their finances smarter.
            </p>
            <Button
              className="w-full gap-2"
              onClick={() => navigate('/auth')}
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
