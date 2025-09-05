import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  company: string | null;
  phone: string | null;
  timezone: string | null;
  avatar_url: string | null;
  theme_preference: string | null;
  created_at: string;
  updated_at: string;
};

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userId = user?.id;

  const queryKey = useMemo(() => ["profile", userId], [userId]);

  const profileQuery = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<ProfileRow>) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...updates }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      return data as ProfileRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Profile updated", description: "Your changes were saved." });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Save to profile immediately
      const { error: saveError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl }, { onConflict: "id" });
      if (saveError) throw saveError;

      return publicUrl;
    },
    onSuccess: (publicUrl: string) => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Avatar updated", description: "Your profile photo was updated." });
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  // Helpful derived values
  const displayName = profileQuery.data?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    // prefetch on auth ready
    if (userId) queryClient.prefetchQuery({ queryKey, queryFn: profileQuery.refetch as any });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    profile: profileQuery.data || null,
    isLoading: profileQuery.isLoading,
    refetch: profileQuery.refetch,
    updateProfile: updateProfile.mutateAsync,
    uploading: uploadAvatar.isPending,
    uploadAvatar: uploadAvatar.mutateAsync,
    displayName,
  };
}
