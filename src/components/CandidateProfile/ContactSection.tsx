import { Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContactSectionProps {
  contacts?: {
    emails?: string[];
    phones?: string[];
  };
}

export function ContactSection({ contacts }: ContactSectionProps) {
  if (!contacts || (!contacts.emails?.length && !contacts.phones?.length)) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="space-y-2">
          {contacts.emails?.slice(0, 3).map((email, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${email}`} 
                className="text-primary hover:underline"
              >
                {email}
              </a>
            </div>
          ))}
          {contacts.phones?.slice(0, 3).map((phone, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${phone}`} 
                className="text-primary hover:underline"
              >
                {phone}
              </a>
            </div>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}