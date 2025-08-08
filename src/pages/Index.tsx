import ModernSidebar from "@/components/ModernSidebar";
import ModernCandidateList from "@/components/ModernCandidateList";
import ModernRightSidebar from "@/components/ModernRightSidebar";

const Index = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <ModernSidebar />
      <ModernCandidateList />
      <ModernRightSidebar />
    </div>
  );
};

export default Index;
