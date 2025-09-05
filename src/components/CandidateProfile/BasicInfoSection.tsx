import { MapPin, Briefcase, DollarSign, Target, Award } from 'lucide-react';

interface BasicInfoSectionProps {
  displayData: any;
}

export function BasicInfoSection({ displayData }: BasicInfoSectionProps) {
  if (!displayData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No basic information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
  );
}