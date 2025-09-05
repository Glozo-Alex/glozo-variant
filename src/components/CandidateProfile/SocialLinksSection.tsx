import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getSocialIcon } from '@/utils/socialIcons';

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksSectionProps {
  socialLinks?: SocialLink[];
}

export function SocialLinksSection({ socialLinks }: SocialLinksSectionProps) {
  if (!socialLinks?.length) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <div className="flex flex-wrap gap-2">
          {socialLinks.slice(0, 5).map((link, index) => {
            const IconComponent = getSocialIcon(link.platform);
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
              >
                <IconComponent className="h-4 w-4" />
                <span className="sr-only">{link.platform}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <Separator />
    </>
  );
}