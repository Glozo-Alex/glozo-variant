import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
          {socialLinks.slice(0, 5).map((link, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span className="capitalize">{link.platform}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}