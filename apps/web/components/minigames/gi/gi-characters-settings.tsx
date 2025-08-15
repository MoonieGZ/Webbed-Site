"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/animate-ui/radix/switch"
import { Input } from "@/components/ui/input"
import { useGiSettingsCharacters } from "@/hooks/minigames/gi/use-gi-settings-characters"
import { buildCharacterIconPath } from "@/lib/minigames/gi/icon-path"
import { ChevronDown, Search, ToggleRight, UserPen, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import {
  Select as ProfileSelect,
  SelectTrigger as ProfileSelectTrigger,
  SelectValue as ProfileSelectValue,
  SelectContent as ProfileSelectContent,
  SelectItem as ProfileSelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import Image from "next/image"

export default function GICharactersSettings() {
  const {
    loading,
    filteredGroups,
    enabledMap,
    toggleEnabled,
    profiles,
    loadProfile,
    saveProfile,
    toggleAll,
    toggleByRarity,
    usedProfileIndices,
    nextAvailableProfileIndex,
    filter,
    setFilter,
  } = useGiSettingsCharacters()
  const [showSave, setShowSave] = React.useState(false)
  const [showLoad, setShowLoad] = React.useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Characters
            </div>
          </CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>
              Manage enabled characters in your profile
            </CardDescription>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
                  <Search className="size-4" />
                </div>
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search Characters"
                  className="h-8 w-[200px] peer ps-9 placeholder:text-muted-foreground"
                  autoComplete="off"
                  inputMode="search"
                  name="search"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-1"
                  >
                    <ToggleRight className="h-4 w-4" />
                    Toggles
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toggleAll(true)}>
                    Enable All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAll(false)}>
                    Disable All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleByRarity(false, true)}>
                    Enable All 4★
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleByRarity(false, false)}
                  >
                    Disable All 4★
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleByRarity(true, true)}>
                    Enable All 5★
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleByRarity(true, false)}>
                    Disable All 5★
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-1"
                  >
                    <UserPen className="h-4 w-4" />
                    Profiles
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowLoad(true)}>
                    Load...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSave(true)}>
                    Save...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading characters...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(filteredGroups.entries()).map(([element, chars]) => (
                <div key={element} className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Image
                      src={`/minigames/gi/elements/${element}.webp`}
                      alt={element}
                      width={24}
                      height={24}
                      className="rounded-sm"
                    />
                    {element}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {chars.map((c) => (
                      <div
                        key={c.name}
                        className={`flex items-center justify-between p-2 rounded-lg border bg-background/50 cursor-pointer ${
                          c.fiveStar
                            ? "ring-1 ring-yellow-500/40"
                            : "ring-1 ring-purple-500/30"
                        } ${(enabledMap[c.name] ?? true) ? "" : "opacity-75 grayscale"}`}
                        onClick={() =>
                          toggleEnabled(c.name, !(enabledMap[c.name] ?? true))
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 shrink-0 rounded overflow-hidden ring-2 ${
                              c.fiveStar
                                ? "ring-yellow-500/60 bg-yellow-500/10"
                                : "ring-purple-500/50 bg-purple-500/10"
                            }`}
                            title={c.name}
                          >
                            <Image
                              src={buildCharacterIconPath(c.name, c.element)}
                              alt={c.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {c.weaponType} &bull; {c.fiveStar ? "5★" : "4★"}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={enabledMap[c.name] ?? true}
                          className="pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SaveProfileDialog
        open={showSave}
        onOpenChange={setShowSave}
        profiles={profiles}
        onSave={saveProfile}
        nextIndex={nextAvailableProfileIndex}
        used={usedProfileIndices}
      />
      <LoadProfileDialog
        open={showLoad}
        onOpenChange={setShowLoad}
        profiles={profiles}
        onLoad={loadProfile}
      />
    </div>
  )
}

function SaveProfileDialog({
  open,
  onOpenChange,
  profiles,
  onSave,
  nextIndex,
  used,
}: {
  open?: boolean
  onOpenChange?: (o: boolean) => void
  profiles?: Array<{ profileIndex: number; name: string | null }>
  onSave?: (i: number, name?: string) => Promise<void>
  nextIndex?: number | null
  used?: Set<number>
}) {
  const [selected, setSelected] = React.useState<string>("")
  const [name, setName] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const canCreate = used && used.size < 10 && !!nextIndex
  const options = (profiles ?? []).map((p) => ({
    value: String(p.profileIndex),
    label: p.name
      ? `${p.profileIndex} — ${p.name}`
      : `Profile ${p.profileIndex}`,
  }))
  if (canCreate) options.push({ value: "new", label: "Create new" })
  const handleSave = async () => {
    if (!onSave) return
    if (saving) return
    try {
      setSaving(true)
      if (selected === "new" && nextIndex)
        await onSave(nextIndex, name || undefined)
      else if (selected) await onSave(parseInt(selected), undefined)
      toast("Profile saved!", toastStyles.success)
      onOpenChange?.(false)
    } catch (e) {
      toast("Failed to save profile.", toastStyles.error)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ProfileSelect value={selected} onValueChange={setSelected}>
            <ProfileSelectTrigger className="w-full">
              <ProfileSelectValue placeholder="Select profile" />
            </ProfileSelectTrigger>
            <ProfileSelectContent>
              {options.map((o) => (
                <ProfileSelectItem key={o.value} value={o.value}>
                  {o.label}
                </ProfileSelectItem>
              ))}
            </ProfileSelectContent>
          </ProfileSelect>
          {selected === "new" && (
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile name (optional)</Label>
              <input
                id="profile-name"
                className="w-full rounded-md border px-3 py-2 bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
          )}
          {!canCreate && (
            <p className="text-sm text-muted-foreground">
              Maximum of 10 profiles reached. Overwrite an existing profile to
              save.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selected || saving}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoadProfileDialog({
  open,
  onOpenChange,
  profiles,
  onLoad,
}: {
  open?: boolean
  onOpenChange?: (o: boolean) => void
  profiles?: Array<{
    profileIndex: number
    name: string | null
    enabledMap?: Record<string, boolean>
  }>
  onLoad?: (i: number) => void
}) {
  const [selected, setSelected] = React.useState<string>("")
  const options = React.useMemo(() => {
    return (profiles ?? []).map((p) => ({
      value: String(p.profileIndex),
      label: p.name
        ? `${p.profileIndex} — ${p.name}`
        : `Profile ${p.profileIndex}`,
    }))
  }, [profiles])
  React.useEffect(() => {
    if (!selected && options.length > 0) setSelected(options[0].value)
  }, [options, selected])
  const handleLoad = () => {
    if (onLoad && selected) {
      try {
        onLoad(parseInt(selected))
        toast("Profile loaded!", toastStyles.success)
        onOpenChange?.(false)
      } catch (e) {
        toast("Failed to load profile.", toastStyles.error)
      }
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ProfileSelect value={selected} onValueChange={setSelected}>
            <ProfileSelectTrigger className="w-full">
              <ProfileSelectValue placeholder="Select profile" />
            </ProfileSelectTrigger>
            <ProfileSelectContent>
              {options.map((o) => (
                <ProfileSelectItem key={o.value} value={o.value}>
                  {o.label}
                </ProfileSelectItem>
              ))}
            </ProfileSelectContent>
          </ProfileSelect>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoad} disabled={!selected}>
              Load
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
