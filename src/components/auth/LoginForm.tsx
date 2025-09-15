import { useState } from "react";
import { Eye, EyeOff, User, Lock, Smartphone, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (user: { id: string; name: string; role: string; email: string }) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "id" | "otp">("email");
  const { toast } = useToast();

  const handleLogin = async (role: string) => {
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      const mockUser = {
        id: role === "admin" ? "ADM001" : role === "teacher" ? "TCH001" : "STU001", 
        name: role === "admin" ? "Dr. Sarah Wilson" : role === "teacher" ? "Prof. John Smith" : "Alex Johnson",
        role,
        email: `${role}@campus.edu`
      };
      
      onLogin(mockUser);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${mockUser.name}!`,
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-strong bg-gradient-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Smart Campus
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Sign in to access your campus dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="id">Campus ID</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" placeholder="student@campus.edu" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  className="pl-9 pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="id" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campusId">Campus ID</Label>
              <Input id="campusId" placeholder="STU2024001 or TCH001" />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Scan your QR code or enter your campus ID
            </div>
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" placeholder="+91 98765 43210" className="pl-9" />
              </div>
            </div>
            <Button variant="secondary" className="w-full">Send OTP</Button>
          </TabsContent>
        </Tabs>

        {/* Demo Login Buttons */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground text-center mb-2">Quick Demo Access:</div>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={() => handleLogin("student")}
              disabled={isLoading}
              className="w-full justify-start bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <User className="mr-2 h-4 w-4" />
              Login as Student
              <Badge variant="secondary" className="ml-auto">STU001</Badge>
            </Button>
            <Button 
              onClick={() => handleLogin("teacher")}
              disabled={isLoading}
              variant="secondary"
              className="w-full justify-start"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Login as Teacher
              <Badge variant="outline" className="ml-auto">TCH001</Badge>
            </Button>
            <Button 
              onClick={() => handleLogin("admin")}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-start"
            >
              <Lock className="mr-2 h-4 w-4" />
              Login as Admin
              <Badge variant="destructive" className="ml-auto">ADM001</Badge>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot your password?
          </a>
        </div>
      </CardContent>
    </Card>
  );
}