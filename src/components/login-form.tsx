
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pill, Eye, EyeOff } from "lucide-react";
import {  useLoginMutation } from "@/store/authApi";
import { useNavigate } from "react-router-dom";



export function LoginForm() {
  const navigate= useNavigate()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // Step 1: login -> get tokens
    const result = await login({ username, password }).unwrap();
      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);
    // Step 2: fetch profile with the new token
 

    navigate("/dashboard")
    // Step 3: store both tokens and profile

    

  } catch (err: any) {
    setError(err?.data?.message || "Invalid username or password");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md border border-border/50 shadow-2xl rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Pill className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">
              Nati pharma Import
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Sign in to manage your pharmacy with ease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. owner"
                className="rounded-lg"
              />
            </div>

            {/* Password with Eye toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
