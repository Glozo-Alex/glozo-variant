import { MapPin, Briefcase, DollarSign, Target, Award } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CandidateDetail } from '@/services/candidateDetails';
import { ContactSection } from './ContactSection';
import { SocialLinksSection } from './SocialLinksSection';
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
    <div className="space-y-6">
      {/* Basic Information - Always visible */}
      <ErrorBoundary>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{displayData.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{displayData.years_of_experience || displayData.average_years_of_experience || 'Experience not specified'}</span>
            </div>
            {displayData.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Salary: {displayData.salary}</span>
              </div>
            )}
            {displayData.seniority_level && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Seniority: {displayData.seniority_level}</span>
              </div>
            )}
            {displayData.standout && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>Standout: {displayData.standout}</span>
              </div>
            )}
            {displayData.domain && (
              <div className="flex items-center gap-2">
                <span>Domain: {displayData.domain}</span>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>

      <Separator />

      {/* Bio - Always visible if available */}
      {displayData.bio && (
        <ErrorBoundary>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Bio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {displayData.bio}
            </p>
          </div>
          <Separator />
        </ErrorBoundary>
      )}

      {/* Contact Information */}
      <ErrorBoundary>
        <ContactSection contacts={displayData.contacts} />
      </ErrorBoundary>

      {/* Social Links */}
      <ErrorBoundary>
        <SocialLinksSection socialLinks={socialLinks} />
      </ErrorBoundary>

      {/* Employment History */}
      <ErrorBoundary>
        <EmploymentSection employments={displayData.employments} />
      </ErrorBoundary>

      {/* Education */}
      <ErrorBoundary>
        <EducationSection educations={displayData.educations} />
      </ErrorBoundary>

      {/* Projects */}
      <ErrorBoundary>
        <ProjectsSection projects={displayData.projects} />
      </ErrorBoundary>

      {/* Skills */}
      <ErrorBoundary>
        <SkillsSection skills={displayData.skills} />
      </ErrorBoundary>
    </div>
  );
}