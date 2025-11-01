import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Building2, BrainCircuit, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Educational Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/70" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Empowering Education and Enterprise
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform your learning journey with AI-driven courses and unlock business potential
              through data analytics and intelligent solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/auth?role=student">
                <Button variant="hero" size="lg" className="group">
                  Join as Student
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?role=instructor">
                <Button variant="outline" size="lg">
                  Become an Instructor
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">500+ Courses</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Building2 className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">Corporate Training</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <BrainCircuit className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">AI-Powered Analytics</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6 animate-fade-in">
            <div className="gradient-card p-6 rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 border">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div className="gradient-card p-6 rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 border">
              <div className="text-4xl font-bold text-secondary mb-2">200+</div>
              <div className="text-muted-foreground">Expert Instructors</div>
            </div>
            <div className="gradient-card p-6 rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 border">
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Corporate Clients</div>
            </div>
            <div className="gradient-card p-6 rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 border">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
