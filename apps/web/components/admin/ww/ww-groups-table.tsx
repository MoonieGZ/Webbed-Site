"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWwAdminGroups } from "@/hooks/games/ww/use-ww-admin-groups"
import { getCharacterIconUrl, getElementIconUrl } from "@/lib/games/ww/icons"
import Image from "next/image"

const GROUP_TYPES: Array<{ key: "enemy_drop"; label: string }> = [
  { key: "enemy_drop", label: "Enemy Drop" },
]

const MATERIAL_TYPES: Array<{
  key: "weekly_boss" | "collectible" | "boss_drop"
  label: string
}> = [
  { key: "weekly_boss", label: "Weekly Boss" },
  { key: "collectible", label: "Collectible" },
  { key: "boss_drop", label: "Boss Drop" },
]

export function WwGroupsTable() {
  const {
    loading,
    q,
    setQ,
    groupedByElement,
    groupsByType,
    materialsByType,
    current,
    updateAssignment,
  } = useWwAdminGroups()

  return (
    <Card>
      <CardHeader>
        <CardTitle>WW Character Groupings</CardTitle>
        <CardDescription>
          Assign material groups to characters. Grouped by element.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search character"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {Object.keys(groupedByElement).length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : "No characters found."}
          </div>
        ) : null}

        <div className="space-y-6">
          {Object.entries(groupedByElement).map(([element, chars]) => (
            <div key={element} className="space-y-2">
              <div className="flex items-center gap-2">
                {/* TODO: Replace with Image component */}
                <img
                  src={getElementIconUrl(element)}
                  alt={element}
                  className="h-6 w-6"
                />
                <div className="font-medium">{element}</div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-[180px_repeat(4,minmax(160px,1fr))] items-center gap-3 px-3 py-2 text-xs font-medium bg-muted/50">
                  <div>Character</div>
                  {[...MATERIAL_TYPES, ...GROUP_TYPES].map((gt) => (
                    <div key={gt.key}>{gt.label}</div>
                  ))}
                </div>
                <div>
                  {chars.map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[180px_repeat(4,minmax(160px,1fr))] items-center gap-3 px-3 py-2 border-t"
                    >
                      <div className="flex items-center gap-2">
                        {/* TODO: Replace with Image component */}
                        <img
                          src={getCharacterIconUrl(element, c.name)}
                          alt={c.name}
                          className="h-8 w-8"
                        />
                        <div className="truncate text-sm">{c.name}</div>
                      </div>
                      {MATERIAL_TYPES.map((mt) => {
                        const selection = current[c.id]?.[mt.key]
                        // Dynamically import options via data- attribute on wrapper? We'll render without icons for value; options get icons below
                        return (
                          <div key={mt.key} className="py-1">
                            <Select
                              value={selection ? String(selection) : ""}
                              onValueChange={(val) =>
                                updateAssignment(
                                  c.id,
                                  mt.key,
                                  val === "none" ? null : Number(val),
                                )
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {(materialsByType[mt.key] || []).map((m) => (
                                  <SelectItem key={m.id} value={String(m.id)}>
                                    <span className="inline-flex items-center gap-2">
                                      <Image
                                        src={`/games/ww/materials/${mt.key}/Item_${m.name.replaceAll(" ", "_")}.png`}
                                        alt={m.name}
                                        width={20}
                                        height={20}
                                      />
                                      <span>{m.name}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      })}
                      {GROUP_TYPES.map((gt) => {
                        const selection = current[c.id]?.[gt.key]
                        const options = groupsByType[gt.key] || []
                        return (
                          <div key={gt.key} className="py-1">
                            <Select
                              value={selection ? String(selection) : ""}
                              onValueChange={(val) =>
                                updateAssignment(
                                  c.id,
                                  gt.key,
                                  val === "none" ? null : Number(val),
                                )
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {options.map((g) => (
                                  <SelectItem key={g.id} value={String(g.id)}>
                                    <span className="inline-flex items-center gap-2">
                                      {g.previewMaterialName ? (
                                        <Image
                                          src={`/games/ww/materials/${gt.key}/Item_${g.previewMaterialName.replaceAll(" ", "_")}.png`}
                                          alt={g.previewMaterialName}
                                          width={20}
                                          height={20}
                                        />
                                      ) : null}
                                      <span>{g.name}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
