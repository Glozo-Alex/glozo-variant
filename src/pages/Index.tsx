import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";
import Layout from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="flex h-full">
        <CandidateList />
        <RightSidebar />
      </div>
    </Layout>
  );
};

export default Index;
