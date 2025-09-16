import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 grid place-items-center">
      
        <CardContent className="p-6 space-y-12">
          
          <h1 className="text-6xl font-bold flex justify-center">Welcome to TaskMaker</h1>
          <h5 className="text-xl text-gray-600 flex justify-center">Please log in or sign up to continue.</h5>

          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button variant="default">Login</Button>
            </Link>

            <Link href="/signup">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </div>
        </CardContent>
      
    </main>
  );
}