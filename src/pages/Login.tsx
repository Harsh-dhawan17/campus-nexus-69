import { LoginForm } from "@/components/auth/LoginForm";
import campusHero from "@/assets/campus-hero.jpg";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div 
        className="hidden lg:flex lg:flex-1 relative bg-gradient-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.6)), url(${campusHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-primary/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to Smart Campus
          </h1>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-lg">
            Your comprehensive campus management platform for attendance, library, hostel, events, and more.
          </p>
          <div className="space-y-4 text-primary-foreground/80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Real-time attendance tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Digital library management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Smart hostel administration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Event registration & management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-background">
        <div className="w-full">
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}