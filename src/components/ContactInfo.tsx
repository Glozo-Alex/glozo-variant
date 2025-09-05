import { Mail, Phone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface ContactInfoProps {
  candidate: {
    email?: string;
    phone?: string;
    contacts?: {
      emails?: string[];
      phones?: string[];
    };
  };
  size?: 'sm' | 'default';
}

export const ContactInfo = memo(function ContactInfo({ candidate, size = 'default' }: ContactInfoProps) {
  // Check for contacts in the new structure first, then fallback to old structure
  const emails = candidate.contacts?.emails?.filter(email => email && email !== 'No email') || 
                 (candidate.email && candidate.email !== 'No email' ? [candidate.email] : []);
  
  const phones = candidate.contacts?.phones?.filter(phone => phone && phone !== 'No phone') || 
                 (candidate.phone && candidate.phone !== 'No phone' ? [candidate.phone] : []);

  const hasContacts = emails.length > 0 || phones.length > 0;

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (!hasContacts) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={size === 'sm' ? 'text-xs' : ''}
      >
        <Eye className={`${iconSize} mr-1`} />
        Reveal contact details
      </Button>
    );
  }

  if (size === 'sm') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {emails.slice(0, 1).map((email, index) => (
          <a
            key={index}
            href={`mailto:${email}`}
            className="flex items-center gap-1 text-primary hover:underline truncate max-w-[120px]"
          >
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        ))}
        {phones.slice(0, 1).map((phone, index) => (
          <a
            key={index}
            href={`tel:${phone}`}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{phone}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.slice(0, 1).map((email, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${email}`} className="text-primary hover:underline truncate">
            {email}
          </a>
        </div>
      ))}
      {phones.slice(0, 1).map((phone, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <a href={`tel:${phone}`} className="text-primary hover:underline">
            {phone}
          </a>
        </div>
      ))}
    </div>
  );
});