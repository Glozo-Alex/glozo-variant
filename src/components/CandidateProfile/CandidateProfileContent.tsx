import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmploymentSection } from './EmploymentSection';
import { EducationSection } from './EducationSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateProfileContentProps {
  displayData: any;
  socialLinks?: SocialLink[];
}

export function CandidateProfileContent({ displayData, socialLinks }: CandidateProfileContentProps) {
  if (!displayData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No candidate data available
      </div>
    );
  }

  return (
    <Tabs defaultValue="employment" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
        <TabsTrigger value="employment">Employment</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>

      <TabsContent value="employment" className="space-y-4">
        <ErrorBoundary>
          <EmploymentSection employments={displayData.employments} />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="education" className="space-y-4">
        <ErrorBoundary>
          <EducationSection educations={displayData.educations} />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <ErrorBoundary>
          <ProjectsSection projects={displayData.projects} />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="skills" className="space-y-4">
        <ErrorBoundary>
          <SkillsSection skills={displayData.skills} />
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
}