import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Monitor,
  Save,
  Upload,
  Moon,
  Sun,
  Globe,
  Mail,
  Smartphone,
  Layout
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { UIDensitySelector } from "@/components/UIDensitySelector";
import ColorSchemeSelector from "@/components/ColorSchemeSelector";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newCandidates: true,
    interviews: true,
    offers: true,
    teamUpdates: false
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    timezone: "UTC",
    avatar_url: "",
  });
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user } = useAuth();
  const { profile: dbProfile, isLoading, uploadAvatar, updateProfile, displayName } = useProfile();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const onUploadClick = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    setDirty(true);
  };

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({ ...prev, email: user.email || prev.email }));
    }
  }, [user]);

  useEffect(() => {
    if (dbProfile) {
      setProfile({
        name: dbProfile.full_name || displayName || "",
        email: user?.email || "",
        title: dbProfile.job_title || "",
        company: dbProfile.company || "",
        phone: dbProfile.phone || "",
        timezone: dbProfile.timezone || "UTC",
        avatar_url: dbProfile.avatar_url || "",
      });
      setDirty(false);
    }
  }, [dbProfile, displayName, user]);

  const handleSave = async () => {
    await updateProfile({
      full_name: profile.name || null,
      job_title: profile.title || null,
      company: profile.company || null,
      phone: profile.phone || null,
      timezone: profile.timezone || null,
      avatar_url: profile.avatar_url || null,
    } as any);
    setDirty(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and system settings</p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleSave} disabled={!dirty}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'Avatar'} />
                    <AvatarFallback className="text-2xl">{getInitials(profile.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.title}</p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2" onClick={onUploadClick}>
                    <Upload className="h-4 w-4" />
                    Upload New Photo
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => { setProfile({...profile, name: e.target.value}); setDirty(true); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profile.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input 
                        id="title" 
                        value={profile.title}
                        onChange={(e) => { setProfile({...profile, title: e.target.value}); setDirty(true); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        value={profile.company}
                        onChange={(e) => { setProfile({...profile, company: e.target.value}); setDirty(true); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => { setProfile({...profile, phone: e.target.value}); setDirty(true); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select 
                        id="timezone"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={profile.timezone}
                        onChange={(e) => {
                          setProfile({ ...profile, timezone: e.target.value });
                          setDirty(true);
                        }}
                      >
                        <option value="PST">Pacific Standard Time (PST)</option>
                        <option value="EST">Eastern Standard Time (EST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Browser notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Text message alerts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Candidates</p>
                    <p className="text-sm text-muted-foreground">When new candidates are added</p>
                  </div>
                  <Switch 
                    checked={notifications.newCandidates}
                    onCheckedChange={(checked) => setNotifications({...notifications, newCandidates: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Interview Reminders</p>
                    <p className="text-sm text-muted-foreground">Upcoming interview alerts</p>
                  </div>
                  <Switch 
                    checked={notifications.interviews}
                    onCheckedChange={(checked) => setNotifications({...notifications, interviews: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Offer Updates</p>
                    <p className="text-sm text-muted-foreground">Offer status changes</p>
                  </div>
                  <Switch 
                    checked={notifications.offers}
                    onCheckedChange={(checked) => setNotifications({...notifications, offers: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Team Updates</p>
                    <p className="text-sm text-muted-foreground">Team activity and mentions</p>
                  </div>
                  <Switch 
                    checked={notifications.teamUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, teamUpdates: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                    </div>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="font-medium">Color Scheme</p>
                  <ColorSchemeSelector collapsed={false} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="font-medium">Sidebar</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sidebar" value="expanded" defaultChecked />
                      <span className="text-sm">Always expanded</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sidebar" value="collapsed" />
                      <span className="text-sm">Start collapsed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sidebar" value="auto" />
                      <span className="text-sm">Auto (based on screen size)</span>
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <UIDensitySelector showPreview={false} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Password & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="font-medium">Active Sessions</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-accent/30">
                      <div>
                        <p className="text-sm font-medium">Current session</p>
                        <p className="text-xs text-muted-foreground">Chrome on macOS • San Francisco, CA</p>
                      </div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Who can see your profile</p>
                  </div>
                  <select className="w-32 h-8 px-2 rounded border border-input bg-background text-sm">
                    <option value="team">Team only</option>
                    <option value="company">Company</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Activity Status</p>
                    <p className="text-sm text-muted-foreground">Show when you're online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">Help improve the product</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Language & Region</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="mdy">MM/DD/YYYY</option>
                        <option value="dmy">DD/MM/YYYY</option>
                        <option value="ymd">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium mb-2">Data & Privacy</p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium mb-2">System</p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;