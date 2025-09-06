import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export interface ScheduleConfig {
  delay?: { days: number; hours: number };
  specific_date?: string;
  days_of_week?: number[];
  time?: string;
  timezone?: string;
}

export interface TriggerConfig {
  trigger_type: 'email_opened' | 'email_replied' | 'email_clicked' | 'no_response' | 'immediate';
  delay_after_trigger?: { days: number; hours: number };
  fallback_delay?: { days: number; hours: number };
}

interface AdvancedSchedulerProps {
  scheduleType: string;
  scheduleConfig: ScheduleConfig;
  triggerConfig?: TriggerConfig;
  onScheduleTypeChange: (type: string) => void;
  onScheduleConfigChange: (config: ScheduleConfig) => void;
  onTriggerConfigChange: (config: TriggerConfig | undefined) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const TRIGGER_TYPES = [
  { value: 'immediate', label: 'Immediate', description: 'Send immediately' },
  { value: 'email_opened', label: 'Email Opened', description: 'After previous email is opened' },
  { value: 'email_replied', label: 'Email Replied', description: 'After recipient replies' },
  { value: 'email_clicked', label: 'Email Clicked', description: 'After link is clicked' },
  { value: 'no_response', label: 'No Response', description: 'After no response for X days' },
];

export function AdvancedScheduler({
  scheduleType,
  scheduleConfig,
  triggerConfig,
  onScheduleTypeChange,
  onScheduleConfigChange,
  onTriggerConfigChange,
}: AdvancedSchedulerProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(scheduleConfig.days_of_week || []);

  const handleDayToggle = (day: number, checked: boolean) => {
    const newDays = checked 
      ? [...selectedDays, day]
      : selectedDays.filter(d => d !== day);
    
    setSelectedDays(newDays);
    onScheduleConfigChange({
      ...scheduleConfig,
      days_of_week: newDays,
    });
  };

  const updateDelayConfig = (field: 'days' | 'hours', value: number) => {
    onScheduleConfigChange({
      ...scheduleConfig,
      delay: {
        ...scheduleConfig.delay,
        days: field === 'days' ? value : scheduleConfig.delay?.days || 0,
        hours: field === 'hours' ? value : scheduleConfig.delay?.hours || 0,
      },
    });
  };

  const updateTriggerDelayConfig = (
    field: 'delay_after_trigger' | 'fallback_delay',
    subField: 'days' | 'hours',
    value: number
  ) => {
    if (!triggerConfig) return;
    
    onTriggerConfigChange({
      ...triggerConfig,
      [field]: {
        ...triggerConfig[field],
        days: subField === 'days' ? value : triggerConfig[field]?.days || 0,
        hours: subField === 'hours' ? value : triggerConfig[field]?.hours || 0,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Type</CardTitle>
          <CardDescription>Choose how this email should be scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={scheduleType} onValueChange={onScheduleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delay">Delay (Days/Hours)</SelectItem>
              <SelectItem value="specific_date">Specific Date</SelectItem>
              <SelectItem value="days_of_week">Days of Week</SelectItem>
              <SelectItem value="trigger_based">Trigger Based</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {scheduleType === 'delay' && (
        <Card>
          <CardHeader>
            <CardTitle>Delay Configuration</CardTitle>
            <CardDescription>Set the delay after the previous email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delay-days">Days</Label>
                <Input
                  id="delay-days"
                  type="number"
                  min="0"
                  value={scheduleConfig.delay?.days || 0}
                  onChange={(e) => updateDelayConfig('days', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="delay-hours">Hours</Label>
                <Input
                  id="delay-hours"
                  type="number"
                  min="0"
                  max="23"
                  value={scheduleConfig.delay?.hours || 0}
                  onChange={(e) => updateDelayConfig('hours', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scheduleType === 'specific_date' && (
        <Card>
          <CardHeader>
            <CardTitle>Specific Date</CardTitle>
            <CardDescription>Choose an exact date and time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="specific-date">Date</Label>
              <Input
                id="specific-date"
                type="date"
                value={scheduleConfig.specific_date || ''}
                onChange={(e) => onScheduleConfigChange({
                  ...scheduleConfig,
                  specific_date: e.target.value,
                })}
              />
            </div>
            <div>
              <Label htmlFor="specific-time">Time</Label>
              <Input
                id="specific-time"
                type="time"
                value={scheduleConfig.time || '09:00'}
                onChange={(e) => onScheduleConfigChange({
                  ...scheduleConfig,
                  time: e.target.value,
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {scheduleType === 'days_of_week' && (
        <Card>
          <CardHeader>
            <CardTitle>Days of Week</CardTitle>
            <CardDescription>Select which days of the week to send</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="weekly-time">Time</Label>
              <Input
                id="weekly-time"
                type="time"
                value={scheduleConfig.time || '09:00'}
                onChange={(e) => onScheduleConfigChange({
                  ...scheduleConfig,
                  time: e.target.value,
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {scheduleType === 'trigger_based' && (
        <Card>
          <CardHeader>
            <CardTitle>Trigger Configuration</CardTitle>
            <CardDescription>Set up behavior-based triggers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Trigger Type</Label>
              <Select 
                value={triggerConfig?.trigger_type || 'immediate'} 
                onValueChange={(value) => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger_type: value as TriggerConfig['trigger_type'],
                } as TriggerConfig)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div>
                        <div className="font-medium">{trigger.label}</div>
                        <div className="text-sm text-muted-foreground">{trigger.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {triggerConfig?.trigger_type !== 'immediate' && (
              <>
                <div>
                  <Label>Delay After Trigger</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="trigger-delay-days">Days</Label>
                      <Input
                        id="trigger-delay-days"
                        type="number"
                        min="0"
                        value={triggerConfig?.delay_after_trigger?.days || 0}
                        onChange={(e) => updateTriggerDelayConfig('delay_after_trigger', 'days', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigger-delay-hours">Hours</Label>
                      <Input
                        id="trigger-delay-hours"
                        type="number"
                        min="0"
                        max="23"
                        value={triggerConfig?.delay_after_trigger?.hours || 0}
                        onChange={(e) => updateTriggerDelayConfig('delay_after_trigger', 'hours', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Fallback Delay (if trigger doesn't occur)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="fallback-delay-days">Days</Label>
                      <Input
                        id="fallback-delay-days"
                        type="number"
                        min="0"
                        value={triggerConfig?.fallback_delay?.days || 3}
                        onChange={(e) => updateTriggerDelayConfig('fallback_delay', 'days', parseInt(e.target.value) || 3)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fallback-delay-hours">Hours</Label>
                      <Input
                        id="fallback-delay-hours"
                        type="number"
                        min="0"
                        max="23"
                        value={triggerConfig?.fallback_delay?.hours || 0}
                        onChange={(e) => updateTriggerDelayConfig('fallback_delay', 'hours', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {scheduleType !== 'specific_date' && scheduleType !== 'trigger_based' && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduleType === 'delay' && (
                <Badge variant="outline">
                  Send {scheduleConfig.delay?.days || 0} days and {scheduleConfig.delay?.hours || 0} hours after previous email
                </Badge>
              )}
              {scheduleType === 'days_of_week' && selectedDays.length > 0 && (
                <Badge variant="outline">
                  Send on {selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')} at {scheduleConfig.time || '09:00'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}