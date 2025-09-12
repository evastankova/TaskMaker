import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 grid place-items-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">shadcn/ui test</h1>
          <p className="text-sm text-muted-foreground">
            If these buttons look styled, shadcn is working.
          </p>

          <div className="mt-4 flex gap-3">
          <div className="w-10 h-10 bg-primary" />
          <div className="w-10 h-10 bg-secondary" />
          <div className="w-10 h-10 bg-destructive" />
          </div>


          <div className="flex gap-2 flex-wrap">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="icon" aria-label="add">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}