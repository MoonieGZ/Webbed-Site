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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/animate-ui/radix/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import { useGiSettingsBosses } from "../../../hooks/minigames/gi/use-gi-settings-bosses"
import {
  ChevronDown,
  Search,
  ShieldUser,
  ToggleRight,
  UserPen,
} from "lucide-react"
import type { GiBoss } from "@/types"
import { buildBossIconPath } from "@/lib/minigames/gi/icon-path"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Label } from "@/components/ui/label"
import {
  Select as ProfileSelect,
  SelectTrigger as ProfileSelectTrigger,
  SelectValue as ProfileSelectValue,
  SelectContent as ProfileSelectContent,
  SelectItem as ProfileSelectItem,
} from "@/components/ui/select"

export default function GIBossesSettings() {
  const {
    settings,
    filter,
    setFilter,
    enabledMap,
    groupKeys,
    filteredGroups,
    setEnabled,
    toggleLegendBosses,
    toggleAll,
    profiles,
    selectedProfile,
    saveProfile,
    loadProfile,
    usedProfileIndices,
    nextAvailableProfileIndex,
  } = useGiSettingsBosses()
  const [showSave, setShowSave] = React.useState(false)
  const [showLoad, setShowLoad] = React.useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldUser className="h-5 w-5" />
              Bosses
            </div>
          </CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>Manage enabled bosses by region</CardDescription>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
                  <Search className="size-4" />
                </div>
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search Bosses"
                  className="h-8 w-[200px] peer ps-9 placeholder:text-muted-foreground"
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
                  <DropdownMenuItem onClick={() => toggleLegendBosses(true)}>
                    Enable Legends
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLegendBosses(false)}>
                    Disable Legends
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
        <CardContent className="space-y-6">
          {groupKeys.map((region: string) => {
            const bosses = (filteredGroups.get(region) ?? []) as GiBoss[]
            if (bosses.length === 0) return null
            return (
              <div key={region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <img
                      src={`/minigames/gi/locations/${region}.webp`}
                      alt={region}
                      className="h-5 w-5 rounded-sm"
                      loading="lazy"
                    />
                    {region}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {bosses.map((b) => (
                    <div
                      key={b.name}
                      className={`flex items-center justify-between p-2 rounded-lg border bg-background/50 cursor-pointer ${
                        b.legendary
                          ? "ring-1 ring-yellow-500/40"
                          : "ring-1 ring-muted-foreground/20"
                      } ${(enabledMap[b.name] ?? true) ? "" : "opacity-75 grayscale"}`}
                      onClick={() =>
                        setEnabled(b.name, !(enabledMap[b.name] ?? true))
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 shrink-0 rounded overflow-hidden ring-2 ${
                            b.legendary
                              ? "ring-yellow-500/60 bg-yellow-500/10"
                              : "ring-muted-foreground/40 bg-muted/20"
                          }`}
                          title={b.name}
                        >
                          <img
                            src={buildBossIconPath(b.name, b.location)}
                            alt={b.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {b.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {b.legendary ? "Legend" : ""}
                            {b.legendary && !b.coop ? " • " : ""}
                            {!b.coop ? "Co-Op N/A" : ""}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={enabledMap[b.name] ?? true}
                        className="pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
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
    try {
      if (selected === "new" && nextIndex)
        await onSave(nextIndex, name || undefined)
      else if (selected) await onSave(parseInt(selected), undefined)
      onOpenChange?.(false)
    } catch (e) {}
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
              <Label htmlFor="boss-profile-name">Profile name (optional)</Label>
              <input
                id="boss-profile-name"
                className="w-full rounded-md border px-3 py-2 bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selected}>
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
        onOpenChange?.(false)
      } catch (e) {}
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
