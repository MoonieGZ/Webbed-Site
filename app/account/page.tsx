'use client';

import { 
  User, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Camera,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from '@/components/animate-ui/radix/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAccount } from "@/hooks/account/use-account";

export default function AccountPage() {
  const {
    user,
    loading,
    authenticated,
    newUsername,
    setNewUsername,
    isChangingUsername,
    isUploadingAvatar,
    canChangeUsername,
    getDaysUntilUsernameChange,
    handleUsernameChange,
    handleAvatarUpload,
    handleGravatarImport,
  } = useAccount();

  const onAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
    
    event.target.value = '';
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <span>Account</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Display Name</Label>
                <div className="flex rounded-md shadow-xs">
                  <Input
                    id="username"
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={user?.name.startsWith("User #") ? "Enter new username" : user?.name}
                    maxLength={32}
                    className="-me-px rounded-e-none shadow-none focus-visible:z-1"
                    disabled={!canChangeUsername()}
                  />
                  <Button
                    className="rounded-s-none"
                    onClick={handleUsernameChange}
                    disabled={isChangingUsername || !canChangeUsername() || newUsername.trim() === user?.name || newUsername.trim() === ""}
                  >
                    {isChangingUsername ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                
                <p className={`text-xs ${canChangeUsername() ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {canChangeUsername() ? "You can change your display name now" : `You can change your display name again in ${getDaysUntilUsernameChange()} days`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed, contact <a href="/feedback" className="text-primary">support</a> if you need to change it
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" value={user?.rank || 'User'} disabled />
                <p className="text-xs text-muted-foreground">
                  Rank is managed by administrators
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Avatar
              </CardTitle>
              <CardDescription>
                Upload a new profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={onAvatarFileChange}
                    disabled={isUploadingAvatar}
                    className="w-full text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-e file:border-solid file:bg-primary file:text-primary-foreground file:px-3 file:text-sm file:font-medium file:not-italic file:leading-none file:py-2.25 file:hover:bg-primary/90 file:transition-colors"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGravatarImport}
                      disabled={isUploadingAvatar}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Import Gravatar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-end">
                    JPG, PNG, GIF, WEBP up to 5MB • Or import from Gravatar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 