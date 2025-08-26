import FamilyCircleManager from "@/components/empathic-resonance/FamilyCircleManager";

export default function EmpathicResonancePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Empathic Resonance</h1>
        <p className="text-muted-foreground">
          Strengthen family bonds and foster meaningful connections through AI-guided conversations
        </p>
      </div>

      <FamilyCircleManager />
    </div>
  );
}
