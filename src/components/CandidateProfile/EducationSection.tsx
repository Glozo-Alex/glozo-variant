import { GraduationCap, Calendar, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Education {
  dates?: { start?: string; end?: string };
  description?: string;
  qualification?: string;
  location?: string;
  provider?: string;
}

interface EducationSectionProps {
  educations?: Education[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  if (!educations?.length) {
    return null;
  }

  // Limit to first 5 educations to prevent rendering issues
  const limitedEducations = educations.slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <div className="space-y-4">
          {limitedEducations.map((education, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{education.qualification || 'Qualification not specified'}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{education.provider || 'Institution not specified'}</span>
                  </div>
                </div>
                {education.dates && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {education.dates.start || 'N/A'} - {education.dates.end || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
              
              {education.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{education.location}</span>
                </div>
              )}
              
              {education.description && (
                <p className="text-sm text-muted-foreground">{education.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}