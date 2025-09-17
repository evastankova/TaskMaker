import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import BackgroundWrapper from "@/components/backgroundWrapper";

export default function HomePage() {
  return (
    <BackgroundWrapper image ="/desk_messy.jpg">
    <main className="min-h-dvh grid place-items-center p-8">
      
        <CardContent className="p-6 space-y-12">
          
          <h1 className="text-6xl text-white font-bold text-center" ><span>Welcome to TaskMaker. Tasking made easy.</span></h1>
          <h5 className="text-xl text-white text-center">Please log in or sign up to continue.</h5>

          <div className="flex justify-center gap-8">
            <Link href="/login">
              <Button variant="outlineWhite" size="lg">Log In</Button>
            </Link>

            <Link href="/signup">
              <Button variant="outlineWhite" size="lg">Sign Up</Button>
            </Link>
          </div>
        </CardContent>
      
    </main>
    </BackgroundWrapper>
  );
}