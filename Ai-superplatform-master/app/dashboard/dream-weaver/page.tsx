import DreamWeaverEngine from "@/components/dream-weaver/DreamWeaverEngine";

export default function DreamWeaverPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dream Weaver Engine</h1>
        <p className="text-muted-foreground">
          Create custom games and activities with AI-powered generation
        </p>
      </div>

      <DreamWeaverEngine />
    </div>
  );
}
