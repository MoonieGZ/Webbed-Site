"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

export function CharacterConfigDialog({
  open,
  onOpenChange,
  character,
  fromAscension,
  toAscension,
  setFromAscension,
  setToAscension,
  fromLevel,
  toLevel,
  setFromLevel,
  setToLevel,
  skillRanges,
  setSkillRange,
  inherentLevels,
  setInherentLevels,
  statBoosts,
  setStatBoosts,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  character: { name: string; icon: string } | null
  fromAscension: number
  toAscension: number
  setFromAscension: (v: number) => void
  setToAscension: (v: number) => void
  fromLevel: number
  toLevel: number
  setFromLevel: (v: number) => void
  setToLevel: (v: number) => void
  skillRanges: [[number, number], [number, number], [number, number], [number, number], [number, number]]
  setSkillRange: (i: number, from: number, to: number) => void
  inherentLevels: [boolean, boolean]
  setInherentLevels: (v: [boolean, boolean]) => void
  statBoosts: [[boolean, boolean], [boolean, boolean], [boolean, boolean], [boolean, boolean]]
  setStatBoosts: (
    v: [[boolean, boolean], [boolean, boolean], [boolean, boolean], [boolean, boolean]],
  ) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {character ? (
              <Image src={character.icon} alt={character.name} width={28} height={28} />
            ) : null}
            Configure {character?.name || "Character"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ascension Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={fromAscension}
                  onChange={(e) => setFromAscension(parseInt(e.target.value || "0"))}
                />
                <span className="text-muted-foreground">→</span>
                <Input value={toAscension} onChange={(e) => setToAscension(parseInt(e.target.value || "0"))} />
              </div>
            </div>
            <div>
              <Label>Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={fromLevel} onChange={(e) => setFromLevel(parseInt(e.target.value || "1"))} />
                <span className="text-muted-foreground">→</span>
                <Input value={toLevel} onChange={(e) => setToLevel(parseInt(e.target.value || "90"))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {skillRanges.map(([from, to], i) => (
              <div key={i} className="space-y-2">
                {i === 2 ? (
                  <div className="space-y-2">
                    <Label className="justify-center">Inherent</Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                      <span className="text-xs text-muted-foreground">L2</span>
                        <Switch
                          checked={inherentLevels[0]}
                          onCheckedChange={(v) => setInherentLevels([Boolean(v), inherentLevels[1]])}
                          className='[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border'
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                        <span className="text-xs text-muted-foreground">L1</span>
                        <Switch
                          checked={inherentLevels[1]}
                          onCheckedChange={(v) => setInherentLevels([inherentLevels[0], Boolean(v)])}
                          className='[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border'
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Label className="justify-center">Stat</Label>
                    <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                      <span className="text-xs text-muted-foreground">L2</span>
                      <Switch
                        checked={statBoosts[i > 2 ? i - 1 : i][0]}
                        onCheckedChange={(v) =>
                          setStatBoosts(
                            statBoosts.map((r, idx) =>
                              idx === (i > 2 ? i - 1 : i) ? [Boolean(v), r[1]] : r,
                            ) as any,
                          )
                        }
                        className='[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border'
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                      <span className="text-xs text-muted-foreground">L1</span>
                      <Switch
                        checked={statBoosts[i > 2 ? i - 1 : i][1]}
                        onCheckedChange={(v) =>
                          setStatBoosts(
                            statBoosts.map((r, idx) =>
                              idx === (i > 2 ? i - 1 : i) ? [r[0], Boolean(v)] : r,
                            ) as any,
                          )
                        }
                        className='[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border'
                      />
                    </label>
                  </div>
                )}

                <Label className="justify-center">
                  {i === 0 && "Basic Attack"}
                  {i === 1 && "Skill"}
                  {i === 2 && "Forte"}
                  {i === 3 && "Liberation"}
                  {i === 4 && "Intro"}
                </Label>
                
                <div className="px-1">
                  <Slider
                    value={[from, to]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(vals: number[]) => setSkillRange(i, vals[0] ?? from, vals[1] ?? to)}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">{from} → {to}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded-md border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={onConfirm}>
              Add Plan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


