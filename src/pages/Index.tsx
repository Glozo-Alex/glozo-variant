import Sidebar from "@/components/Sidebar";
import Rail from "@/components/Rail";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Rail />
      <CandidateList />
      <RightSidebar />
    </div>
  );
};

export default Index;
