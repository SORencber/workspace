import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertOctagon className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
          <CardDescription>
            We're experiencing technical difficulties. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Our team has been notified and is working on the issue. Thank you for your patience.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}