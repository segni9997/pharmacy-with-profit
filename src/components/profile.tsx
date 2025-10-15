import {  useWhoamiQuery } from "@/store/userApi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { User, Mail, Shield } from "lucide-react";


export function Profile() {

  const { data: whomai, isError:error, isLoading } = useWhoamiQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error || !whomai) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-destructive">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-foreground flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-semibold text-foreground">{whomai?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-foreground">
                    {whomai?.first_name} {whomai?.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{whomai?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold text-foreground capitalize">{whomai?.role}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-6">
              <Button variant="outline" size="lg">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
