import SupabaseCheck from "@/components/SupabaseCheck";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 grid place-items-center">
      <div className="max-w-xl w-full rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold">Hello TS + Next + Tailwind</h1>
        <p className="mt-2 text-sm text-gray-600">
          If this heading is big and bold, Tailwind works.
        </p>

        <div className="mt-8 w-40 h-40 bg-blue-500 rounded-lg text-white grid place-items-center">
          Blue
        </div>
        
        <SupabaseCheck />
      </div>
    </main>
  );
}