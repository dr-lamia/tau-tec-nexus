import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, BrainCircuit, Users, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: GraduationCap,
      title: "Online & Offline Courses",
      description: "Access hundreds of courses across various domains with flexible learning modes. Learn at your own pace with lifetime access.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/courses",
    },
    {
      icon: Building2,
      title: "Corporate Training",
      description: "Customized training programs for your organization. Upskill your workforce with industry-relevant content.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/auth",
    },
    {
      icon: BrainCircuit,
      title: "AI & Data Analytics",
      description: "Leverage cutting-edge AI solutions and data analytics to drive business insights and intelligent decision-making.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/auth",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience in their respective fields.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/courses",
    },
    {
      icon: BookOpen,
      title: "Rich Learning Materials",
      description: "Access comprehensive course content including videos, PDFs, assignments, and interactive discussions.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/courses",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your progress, earn certifications, and advance your career with our structured learning paths.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/auth",
    },
  ];

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for students, professionals, and enterprises
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Link key={index} to={service.link} className="block">
              <Card
                className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer h-full"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${service.bgColor} flex items-center justify-center mb-4`}>
                    <service.icon className={`h-7 w-7 ${service.color}`} />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button variant="hero" size="lg">
              Explore All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
