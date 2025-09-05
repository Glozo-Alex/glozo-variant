import { Building2, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Employment {
  dates?: { start?: string; end?: string };
  description?: string;
  employer?: string;
  location?: string;
  responsibilities?: string[];
  role?: string;
  skills?: Array<{
    cluster?: string;
    skills?: string[];
  }>;
  tenure?: string;
  linkedin?: string;
}

interface EmploymentSectionProps {
  employments?: Employment[];
}

export function EmploymentSection({ employments }: EmploymentSectionProps) {
  if (!employments?.length) {
    return null;
  }

  // Limit to first 5 employments to prevent rendering issues
  const limitedEmployments = employments.slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employment History</h3>
        <div className="space-y-4">
          {limitedEmployments.map((employment, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{employment.role || 'Position not specified'}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{employment.employer || 'Company not specified'}</span>
                  </div>
                </div>
                {employment.dates && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {employment.dates.start || 'N/A'} - {employment.dates.end || 'Present'}
                    </span>
                  </div>
                )}
              </div>
              
              {employment.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{employment.location}</span>
                </div>
              )}
              
              {employment.description && (
                <p className="text-sm text-muted-foreground">{employment.description}</p>
              )}
              
              {employment.responsibilities?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Responsibilities:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {employment.responsibilities.slice(0, 5).map((responsibility, respIndex) => (
                      <li key={respIndex} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {employment.skills?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Skills Used:</h5>
                  <div className="flex flex-wrap gap-1">
                    {employment.skills.slice(0, 3).map((skillGroup, skillIndex) => 
                      skillGroup.skills?.slice(0, 5).map((skill, index) => (
                        <Badge key={`${skillIndex}-${index}`} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}