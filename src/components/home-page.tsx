'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  MessageSquare, 
  Brain, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  Smartphone,
  Bot,
  BookOpen,
  Target,
  Users,
  CheckCircle
} from 'lucide-react';
// Using CSS animations instead of anime.js for better reliability

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Refs for animation targets
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Fixed particle positions to prevent hydration mismatch
  const heroParticles = [
    { left: 10, top: 20 },
    { left: 30, top: 60 },
    { left: 50, top: 10 },
    { left: 70, top: 80 },
    { left: 90, top: 30 },
    { left: 15, top: 70 },
    { left: 35, top: 40 },
    { left: 55, top: 90 },
    { left: 75, top: 15 },
    { left: 95, top: 50 },
    { left: 25, top: 85 },
    { left: 45, top: 25 },
    { left: 65, top: 55 },
    { left: 85, top: 75 },
    { left: 5, top: 45 },
    { left: 40, top: 5 },
    { left: 60, top: 35 },
    { left: 80, top: 65 },
    { left: 20, top: 95 },
    { left: 100, top: 10 }
  ];

  const ctaParticles = [
    { left: 20, top: 10 },
    { left: 40, top: 50 },
    { left: 60, top: 20 },
    { left: 80, top: 70 },
    { left: 10, top: 40 },
    { left: 30, top: 80 },
    { left: 50, top: 30 },
    { left: 70, top: 60 },
    { left: 90, top: 15 },
    { left: 15, top: 90 },
    { left: 35, top: 25 },
    { left: 55, top: 75 },
    { left: 75, top: 45 },
    { left: 95, top: 35 },
    { left: 5, top: 65 }
  ];

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial animations
    setIsVisible(true);
    
    // CSS animations will handle the entrance effects
    // No need for JavaScript animations

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Optimized parallax animations using requestAnimationFrame
  useEffect(() => {
    if (!isClient) return;

    let animationId: number;
    
    const updateParallax = () => {
      const parallaxBg = document.querySelector('.parallax-bg') as HTMLElement;
      const parallaxGradient = document.querySelector('.parallax-gradient') as HTMLElement;
      const mouseParallax = document.querySelectorAll('.mouse-parallax') as NodeListOf<HTMLElement>;

      if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrollY * 0.5}px)`;
      }

      if (parallaxGradient) {
        parallaxGradient.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0001})`;
      }

      mouseParallax.forEach(element => {
        element.style.transform = `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`;
      });

      animationId = requestAnimationFrame(updateParallax);
    };

    updateParallax();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [scrollY, mousePosition, isClient]);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "PDF Upload & Viewing",
      description: "Upload large PDF files and view them with our integrated PDF viewer. Navigate through pages seamlessly.",
      highlight: "50MB+ files supported"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-green-500" />,
      title: "AI-Powered Chat",
      description: "Ask questions about your documents and get intelligent responses based on the actual content.",
      highlight: "Document-grounded responses"
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Smart Analysis",
      description: "Get comprehensive document analysis, key insights, and actionable recommendations.",
      highlight: "AI-powered analysis"
    },
    {
      icon: <Search className="w-8 h-8 text-orange-500" />,
      title: "Citation & Navigation",
      description: "Click citations to jump to specific pages. Get page references in every AI response.",
      highlight: "One-click navigation"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-pink-500" />,
      title: "Mobile Responsive",
      description: "Works perfectly on all devices. Toggle between chat and PDF view on mobile.",
      highlight: "Touch-optimized"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Fast & Efficient",
      description: "Optimized for performance with minimal token usage and fast AI responses.",
      highlight: "Lightning fast"
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      text: "Secure document processing"
    },
    {
      icon: <Bot className="w-6 h-6 text-blue-500" />,
      text: "Multiple AI providers"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      text: "Academic paper analysis"
    },
    {
      icon: <Target className="w-6 h-6 text-orange-500" />,
      text: "Resume ATS scoring"
    },
    {
      icon: <Users className="w-6 h-6 text-pink-500" />,
      text: "Team collaboration ready"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Production ready"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Hero Section */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="parallax-bg absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="parallax-gradient absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
        
        {/* Floating Particles */}
        <div className="mouse-parallax absolute inset-0 z-[-1]">
          {heroParticles.map((particle, i) => (
            <div
              key={i}
              className="floating-particle absolute w-2 h-2 bg-blue-400/20 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
          <div className="hero-content text-center max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="hero-logo p-3 rounded-full bg-blue-500/10">
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="hero-title text-4xl sm:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
                PDF Chat Analyser
              </h1>
            </div>
            
            <p className="hero-description text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your PDF documents and analyze them with advanced AI. Get comprehensive insights, 
              ask intelligent questions, and extract valuable information from your documents.
            </p>

            {/* CTA Button */}
            <div className="hero-cta flex justify-center mb-12">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="hero-stats grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="stat-item text-center">
                <div className="text-2xl font-bold text-blue-600">50MB+</div>
                <div className="text-sm text-gray-600">PDF Size Limit</div>
              </div>
              <div className="stat-item text-center">
                <div className="text-2xl font-bold text-green-600">3+</div>
                <div className="text-sm text-gray-600">AI Providers</div>
              </div>
              <div className="stat-item text-center">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Mobile Ready</div>
              </div>
              <div className="stat-item text-center">
                <div className="text-2xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-gray-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-16 sm:py-24 bg-white/50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="mouse-parallax absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-indigo-50/30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze and interact with your PDF documents using AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {feature.description}
                      </p>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {feature.highlight}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div ref={benefitsRef} className="py-16 sm:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="mouse-parallax absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-indigo-100/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PDF Chat Navigator?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and designed for the best user experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item flex items-center gap-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm hover:bg-white/80 hover:scale-105 transition-all duration-300">
                {benefit.icon}
                <span className="text-gray-700 font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="py-16 sm:py-24 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="mouse-parallax absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute inset-0">
          {ctaParticles.map((particle, i) => (
            <div
              key={i}
              className="floating-particle absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="cta-content">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Upload your first PDF document and start chatting with AI. 
              No signup required, completely free to use.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 shadow-lg transition-all duration-200 hover:scale-105"
            >
              Start Analyzing Documents
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="mouse-parallax absolute inset-0 bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-gray-400">
            © 2024 PDF Chat Navigator. Built with Next.js, TypeScript, and AI.
          </p>
        </div>
      </footer>
    </main>
  );
}
