import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SkillGroup {
  cluster?: string;
  skills?: string[];
}

interface SkillsSectionProps {
  skills?: SkillGroup[];
}

function groupSkillsByCluster(skills: SkillGroup[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  skills?.forEach(skillGroup => {
    const cluster = skillGroup.cluster || 'Other';
    if (!grouped[cluster]) {
      grouped[cluster] = [];
    }
    skillGroup.skills?.forEach(skill => {
      if (!grouped[cluster].includes(skill)) {
        grouped[cluster].push(skill);
      }
    });
  });
  
  return grouped;
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills?.length) {
    return null;
  }

  const groupedSkills = groupSkillsByCluster(skills);
  const clusterEntries = Object.entries(groupedSkills).slice(0, 5); // Limit clusters

  if (clusterEntries.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        <div className="space-y-4">
          {clusterEntries.map(([cluster, clusterSkills]) => (
            <div key={cluster} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{cluster}</h4>
              <div className="flex flex-wrap gap-2">
                {clusterSkills.slice(0, 10).map((skill, index) => ( // Limit skills per cluster
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-fade-in hover-scale transition-all duration-200 hover:shadow-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {skill}
                  </Badge>
                ))}
                {clusterSkills.length > 10 && (
                  <Badge variant="outline" className="hover-scale transition-all duration-200">
                    +{clusterSkills.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}