import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCandidateDetails } from '@/hooks/useCandidateDetails';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CandidateProfileContent } from '@/components/CandidateProfile/CandidateProfileContent';

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateProfileProps {
  children: React.ReactNode;
  candidateData: any;
  socialLinks?: SocialLink[];
  projectId: string;
}

export function CandidateProfile({ children, candidateData, socialLinks = [], projectId }: CandidateProfileProps) {
  const [open, setOpen] = useState(false);
  const { candidateDetail, loading, error } = useCandidateDetails({
    candidateId: candidateData?.id,
    projectId,
    enabled: open // Only fetch when sheet is opened
  });

  // Combine basic candidate data with detailed data
  const displayData = candidateDetail ? { ...candidateData, ...candidateDetail } : candidateData;

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  console.log('CandidateProfile render:', { 
    candidateData, 
    candidateDetail, 
    loading, 
    error,
    displayDataName: displayData?.name 
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) })}
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <ErrorBoundary>
          <SheetHeader className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(displayData?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <SheetTitle className="text-xl">{displayData?.name || 'Name not available'}</SheetTitle>
                <p className="text-muted-foreground">
                  {displayData?.title || displayData?.role || 'Position not specified'}
                </p>
                {displayData?.employer && (
                  <p className="text-sm text-muted-foreground">
                    at {displayData.employer}
                  </p>
                )}
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading detailed information...</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                Failed to load detailed information: {error}
              </div>
            )}
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}

            {/* Content - Only show when not loading */}
            {!loading && (
              <CandidateProfileContent 
                displayData={displayData} 
                socialLinks={socialLinks}
              />
            )}
          </div>
        </ErrorBoundary>
      </SheetContent>
    </Sheet>
  );
}