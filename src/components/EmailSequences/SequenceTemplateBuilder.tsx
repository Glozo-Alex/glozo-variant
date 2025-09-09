import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface SequenceEmail {
  id?: string;
  name: string;
  subject: string;
  content: string;
  order_index: number;
  delay_days: number;
  delay_hours: number;
}

interface SequenceTemplateBuilderProps {
  sequenceId?: string;
  sequenceName?: string;
  initialData?: {
    emails: SequenceEmail[];
  };
  onSave: (data: {
    emails: SequenceEmail[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMAIL_VARIABLES = [
  { variable: '{{firstName}}', description: 'Recipient first name' },
  { variable: '{{lastName}}', description: 'Recipient last name' },
  { variable: '{{fullName}}', description: 'Recipient full name' },
  { variable: '{{email}}', description: 'Recipient email address' },
  { variable: '{{company}}', description: 'Recipient company' },
  { variable: '{{position}}', description: 'Recipient position' },
  { variable: '{{senderName}}', description: 'Your name' },
  { variable: '{{senderCompany}}', description: 'Your company' },
];

export function SequenceTemplateBuilder({
  sequenceId,
  sequenceName,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: SequenceTemplateBuilderProps) {
  const [emails, setEmails] = useState<SequenceEmail[]>(
    initialData?.emails || [
      {
        name: 'Initial Outreach',
        subject: '',
        content: '',
        order_index: 0,
        delay_days: 0,
        delay_hours: 0,
      }
    ]
  );
  const [collapsedEmails, setCollapsedEmails] = useState<Set<number>>(new Set());
  const [activeField, setActiveField] = useState<{ emailIndex: number; field: 'subject' | 'content' } | null>(null);
  const subjectRefs = useRef<(HTMLInputElement | null)[]>([]);
  const contentRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { toast } = useToast();

  // Sync local state when initialData loads
  useEffect(() => {
    if (!initialData) return;

    setEmails(
      initialData.emails && initialData.emails.length > 0
        ? initialData.emails
        : [
            {
              name: 'Initial Outreach',
              subject: '',
              content: '',
              order_index: 0,
              delay_days: 0,
              delay_hours: 0,
            },
          ]
    );
  }, [initialData]);

  const addEmail = () => {
    const newEmail: SequenceEmail = {
      name: `Follow-up ${emails.length}`,
      subject: '',
      content: '',
      order_index: emails.length,
      delay_days: 2,
      delay_hours: 0,
    };
    setEmails([...emails, newEmail]);
  };

  const removeEmail = (index: number) => {
    if (emails.length <= 1) {
      toast({
        title: 'Cannot delete',
        description: 'A sequence must have at least one email.',
        variant: 'destructive',
      });
      return;
    }
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, field: keyof SequenceEmail, value: any) => {
    const updatedEmails = emails.map((email, i) => 
      i === index ? { ...email, [field]: value } : email
    );
    setEmails(updatedEmails);
  };

  const insertVariable = (variable: string) => {
    if (!activeField) return;
    
    const { emailIndex, field } = activeField;
    const ref = field === 'subject' ? subjectRefs.current[emailIndex] : contentRefs.current[emailIndex];
    
    if (ref) {
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const currentValue = emails[emailIndex][field];
      const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
      
      updateEmail(emailIndex, field, newValue);
      
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        if (ref) {
          ref.focus();
          ref.setSelectionRange(start + variable.length, start + variable.length);
        }
      }, 0);
    }
  };

  const toggleEmailCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedEmails);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedEmails(newCollapsed);
  };

  const isEmailComplete = (email: SequenceEmail) => {
    return email.name.trim() && email.subject.trim() && email.content.trim();
  };

  const handleSave = async () => {
    if (emails.some(email => !email.subject.trim() || !email.content.trim())) {
      toast({
        title: 'Invalid input',
        description: 'All emails must have a subject and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSave({
        emails: emails.map((email, index) => ({
          ...email,
          order_index: index,
        })),
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save templates. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sequence
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Templates
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {sequenceName ? `Configure email templates for "${sequenceName}"` : 'Design your email sequence templates'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Templates'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Email Sequence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Email Sequence</h2>
              <Button onClick={addEmail} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            </div>

            {emails.map((email, index) => (
              <Collapsible 
                key={index} 
                open={!collapsedEmails.has(index)} 
                onOpenChange={() => toggleEmailCollapse(index)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <CardTitle className="text-base">
                              {email.name || `Email ${index + 1}`}
                            </CardTitle>
                            {isEmailComplete(email) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {emails.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {collapsedEmails.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`email-name-${index}`}>Email Name</Label>
                        <Input
                          id={`email-name-${index}`}
                          value={email.name}
                          onChange={(e) => updateEmail(index, 'name', e.target.value)}
                          placeholder="Enter email name"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-subject-${index}`}>Subject Line</Label>
                        <Input
                          ref={(el) => (subjectRefs.current[index] = el)}
                          id={`email-subject-${index}`}
                          value={email.subject}
                          onChange={(e) => updateEmail(index, 'subject', e.target.value)}
                          onFocus={() => setActiveField({ emailIndex: index, field: 'subject' })}
                          placeholder="Enter email subject"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-content-${index}`}>Email Content</Label>
                        <Textarea
                          ref={(el) => (contentRefs.current[index] = el)}
                          id={`email-content-${index}`}
                          value={email.content}
                          onChange={(e) => updateEmail(index, 'content', e.target.value)}
                          onFocus={() => setActiveField({ emailIndex: index, field: 'content' })}
                          placeholder="Enter email content..."
                          rows={6}
                        />
                      </div>

                      <Separator />

                      <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">Delay Settings</h4>
                              <Badge variant="outline" className="text-xs">
                                {email.delay_days}d {email.delay_hours}h
                              </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`delay-days-${index}`}>Delay (Days)</Label>
                              <Input
                                id={`delay-days-${index}`}
                                type="number"
                                min="0"
                                value={email.delay_days}
                                onChange={(e) => updateEmail(index, 'delay_days', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`delay-hours-${index}`}>Additional Hours</Label>
                              <Input
                                id={`delay-hours-${index}`}
                                type="number"
                                min="0"
                                max="23"
                                value={email.delay_hours}
                                onChange={(e) => updateEmail(index, 'delay_hours', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {activeField ? 
                  `Click to insert at cursor in Email ${activeField.emailIndex + 1} ${activeField.field}` : 
                  'Focus on a field to insert variables'
                }
              </p>
              <div className="grid grid-cols-1 gap-2">
                {EMAIL_VARIABLES.map(({ variable, description }) => (
                  <div key={variable}>
                    <Badge
                      variant="outline"
                      className={`w-full justify-start cursor-pointer hover:bg-accent text-xs ${
                        activeField ? 'hover:bg-primary hover:text-primary-foreground' : 'opacity-50'
                      }`}
                      onClick={() => activeField && insertVariable(variable)}
                    >
                      {variable}
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs pl-2">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use variables to personalize your emails</p>
              <p>• Set appropriate delays between emails</p>
              <p>• Start with 0 delay for immediate first email</p>
              <p>• Test your sequence before activating</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}