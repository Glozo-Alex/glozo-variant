import Sidebar from "@/components/Sidebar";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <CandidateList />
      <RightSidebar />
    </div>
  );
};

export default Index;
