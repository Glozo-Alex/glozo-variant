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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <div className="space-y-3">
        {contacts.emails?.slice(0, 3).map((email, index) => (
          <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Mail className="h-4 w-4 text-primary" />
            <a 
              href={`mailto:${email}`} 
              className="text-primary hover:underline font-medium"
            >
              {email}
            </a>
          </div>
        ))}
        {contacts.phones?.slice(0, 3).map((phone, index) => (
          <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Phone className="h-4 w-4 text-primary" />
            <a 
              href={`tel:${phone}`} 
              className="text-primary hover:underline font-medium"
            >
              {phone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}