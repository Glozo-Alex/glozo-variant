import { Mail, Phone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactHeaderSectionProps {
  contacts?: {
    emails?: string[];
    phones?: string[];
  };
}

export function ContactHeaderSection({ contacts }: ContactHeaderSectionProps) {
  const hasContacts = contacts && (contacts.emails?.length || contacts.phones?.length);

  if (!hasContacts) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs"
      >
        <Eye className="h-3 w-3 mr-1" />
        Reveal contact details
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {contacts.emails?.slice(0, 1).map((email, index) => (
        <a
          key={index}
          href={`mailto:${email}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Mail className="h-3 w-3" />
          <span>{email}</span>
        </a>
      ))}
      {contacts.phones?.slice(0, 1).map((phone, index) => (
        <a
          key={index}
          href={`tel:${phone}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          <span>{phone}</span>
        </a>
      ))}
    </div>
  );
}