import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background animate-in-fade">
      <div className="text-center max-w-md px-4">
        <div className="text-7xl emoji-bounce mb-6">🚫</div>
        <h1 className="text-5xl font-bold mb-3">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="w-full gap-2 hover:scale-105 transition-transform"
          >
            <span>🏠</span> Back to Home
          </Button>
          <Button
            onClick={() => navigate("/categories")}
            variant="outline"
            size="lg"
            className="w-full gap-2 hover:scale-105 transition-transform"
          >
            <span>📂</span> Browse Categories
          </Button>
        </div>

        <p className="text-muted-foreground text-sm mt-8">
          <span className="emoji-wiggle">💭</span> Need help? <button className="text-primary hover:underline">Contact support</button>
        </p>
      </div>
    </div>
  );
};

export default NotFound;

