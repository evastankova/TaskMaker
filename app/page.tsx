import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import ThemeToggle from "@/components/themeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 grid place-items-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          
          <h1 className="text-2xl font-bold">Welcome to TaskMaker</h1>
          <ThemeToggle />
          <p className="text-red-600">Please log in or sign up to continue.</p>

          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button variant="default">Login</Button>
            </Link>

            <Link href="/signup">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}