import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Instructors = () => {
  const { data: instructors, isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      // Get all users with instructor role
      const { data: instructorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "instructor");

      if (rolesError) throw rolesError;

      const instructorIds = instructorRoles.map((r) => r.user_id);

      // Get profiles for instructors
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", instructorIds);

      if (profilesError) throw profilesError;

      // Get courses for each instructor
      const instructorsWithCourses = await Promise.all(
        profiles.map(async (profile) => {
          const { data: courses } = await supabase
            .from("courses")
            .select("id, title, category")
            .eq("instructor_id", profile.id)
            .eq("status", "published");

          return {
            ...profile,
            courses: courses || [],
          };
        })
      );

      return instructorsWithCourses;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Expert Instructors</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Learn from industry professionals with years of real-world experience in their respective fields
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="gradient-card">
                    <CardHeader className="text-center">
                      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : instructors && instructors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {instructors.map((instructor) => (
                  <Card key={instructor.id} className="gradient-card hover:shadow-strong transition-all duration-300">
                    <CardHeader className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={instructor.avatar_url || ""} alt={instructor.full_name} />
                        <AvatarFallback className="text-2xl">
                          {instructor.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle>{instructor.full_name}</CardTitle>
                      {instructor.expertise && (
                        <Badge variant="secondary" className="mt-2">
                          {instructor.expertise}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {instructor.bio ? (
                        <CardDescription className="text-center line-clamp-3">
                          {instructor.bio}
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-center italic">
                          No bio available
                        </CardDescription>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          <span>{instructor.courses.length} Published Courses</span>
                        </div>
                        
                        {instructor.courses.length > 0 && (
                          <div className="space-y-1">
                            {instructor.courses.slice(0, 3).map((course: any) => (
                              <Link
                                key={course.id}
                                to={`/course/${course.id}`}
                                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                              >
                                <BookOpen className="h-3 w-3" />
                                <span className="line-clamp-1">{course.title}</span>
                              </Link>
                            ))}
                            {instructor.courses.length > 3 && (
                              <p className="text-xs text-muted-foreground pl-5">
                                +{instructor.courses.length - 3} more courses
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <Link to="/courses" className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          View All Courses
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="gradient-card">
                <CardContent className="text-center py-12">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Instructors Yet</h3>
                  <p className="text-muted-foreground">
                    We're currently onboarding expert instructors. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Instructors;
