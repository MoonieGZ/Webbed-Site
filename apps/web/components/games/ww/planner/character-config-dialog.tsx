"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, Minus, Plus, Sparkle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"

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
  skillRanges: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ]
  setSkillRange: (i: number, from: number, to: number) => void
  inherentLevels: [boolean, boolean]
  setInherentLevels: (v: [boolean, boolean]) => void
  statBoosts: [
    [boolean, boolean],
    [boolean, boolean],
    [boolean, boolean],
    [boolean, boolean],
  ]
  setStatBoosts: (
    v: [
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
      [boolean, boolean],
    ],
  ) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {character ? (
              <Image
                src={character.icon}
                alt={character.name}
                width={28}
                height={28}
              />
            ) : null}
            Configure {character?.name || "Character"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(() => {
            const milestoneOptions: Array<{
              key: string
              label: string
              level: number
              asc: number
              span?: boolean
            }> = [
              { key: "1", label: "1", level: 1, asc: 0, span: true },
              { key: "20", label: "20", level: 20, asc: 0 },
              { key: "20*", label: "20 (*)", level: 20, asc: 1 },
              { key: "40", label: "40", level: 40, asc: 1 },
              { key: "40*", label: "40 (*)", level: 40, asc: 2 },
              { key: "50", label: "50", level: 50, asc: 2 },
              { key: "50*", label: "50 (*)", level: 50, asc: 3 },
              { key: "60", label: "60", level: 60, asc: 3 },
              { key: "60*", label: "60 (*)", level: 60, asc: 4 },
              { key: "70", label: "70", level: 70, asc: 4 },
              { key: "70*", label: "70 (*)", level: 70, asc: 5 },
              { key: "80", label: "80", level: 80, asc: 5 },
              { key: "80*", label: "80 (*)", level: 80, asc: 6 },
              { key: "90", label: "90", level: 90, asc: 6, span: true },
            ]

            // full ordered states including milestone star nodes
            type State = { level: number; asc: number; isStar?: boolean }
            const states: State[] = (() => {
              const list: State[] = []
              for (let lvl = 1; lvl <= 90; lvl++) {
                let asc = 0
                if (lvl > 80) asc = 6
                else if (lvl > 70) asc = 5
                else if (lvl > 60) asc = 4
                else if (lvl > 50) asc = 3
                else if (lvl > 40) asc = 2
                else if (lvl > 20) asc = 1
                else asc = 0

                list.push({ level: lvl, asc })
                if ([20, 40, 50, 60, 70, 80].includes(lvl)) {
                  const starAsc = asc + 1
                  list.push({ level: lvl, asc: starAsc, isStar: true })
                }
              }
              return list
            })()

            const toIndex = (asc: number, lvl: number): number =>
              states.findIndex((s) => s.level === lvl && s.asc === asc)

            const makeIndexSetters = (
              setAsc: (a: number) => void,
              setLvl: (l: number) => void,
            ) => ({
              inc: (asc: number, lvl: number) => {
                const idx = toIndex(asc, lvl)
                const next = Math.min(states.length - 1, Math.max(0, idx + 1))
                setAsc(states[next].asc)
                setLvl(states[next].level)
              },
              dec: (asc: number, lvl: number) => {
                const idx = toIndex(asc, lvl)
                const prev = Math.min(states.length - 1, Math.max(0, idx - 1))
                setAsc(states[prev].asc)
                setLvl(states[prev].level)
              },
              clampTo: (idx: number) => {
                const safe = Math.min(states.length - 1, Math.max(0, idx))
                setAsc(states[safe].asc)
                setLvl(states[safe].level)
              },
            })

            const getStarAsc = (lvl: number): number =>
              lvl === 20
                ? 1
                : lvl === 40
                  ? 2
                  : lvl === 50
                    ? 3
                    : lvl === 60
                      ? 4
                      : lvl === 70
                        ? 5
                        : lvl === 80
                          ? 6
                          : -1
            const isStar = (asc: number, lvl: number): boolean =>
              asc === getStarAsc(lvl)
            const labelFor = (_asc: number, lvl: number): string => String(lvl)

            const renderMenu = (onPick: (asc: number, lvl: number) => void) => (
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 w-[160px]">
                  {milestoneOptions.map((opt) => {
                    return (
                      <div
                        key={opt.key}
                        className={opt.span ? "col-span-2" : ""}
                      >
                        <DropdownMenuItem
                          className="rounded-md border px-3 py-2 text-sm"
                          onSelect={() => onPick(opt.asc, opt.level)}
                        >
                          <span className="inline-flex items-center gap-1 w-full justify-center">
                            <span>{opt.level}</span>
                            {opt.key.endsWith("*") ? (
                              <Sparkle className="h-4 w-4" />
                            ) : null}
                          </span>
                        </DropdownMenuItem>
                      </div>
                    )
                  })}
                </div>
              </div>
            )

            return (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="justify-center">Current</Label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2 justify-center">
                      {(() => {
                        const { inc, dec } = makeIndexSetters(
                          setFromAscension,
                          setFromLevel,
                        )
                        const fromIsLast =
                          toIndex(fromAscension, fromLevel) ===
                          states.length - 1
                        const fromIsFirst =
                          toIndex(fromAscension, fromLevel) === 0
                        return (
                          <>
                            <Button
                              variant="outline"
                              className="px-2 w-8"
                              onClick={() => dec(fromAscension, fromLevel)}
                              disabled={fromIsFirst}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="justify-between w-[100px]"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <span>
                                      {labelFor(fromAscension, fromLevel)}
                                    </span>
                                    {isStar(fromAscension, fromLevel) ? (
                                      <Sparkle className="h-4 w-4" />
                                    ) : null}
                                  </span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center">
                                {renderMenu((asc, lvl) => {
                                  setFromAscension(asc)
                                  setFromLevel(lvl)
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              className="px-2 w-8"
                              onClick={() => inc(fromAscension, fromLevel)}
                              disabled={fromIsLast}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="justify-center">Desired</Label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2 justify-center">
                      {(() => {
                        const { inc, dec, clampTo } = makeIndexSetters(
                          setToAscension,
                          setToLevel,
                        )
                        const currentIdx = toIndex(fromAscension, fromLevel)
                        const desiredIdx = toIndex(toAscension, toLevel)
                        const desiredIsLast = desiredIdx === states.length - 1
                        const canDec = desiredIdx - 1 >= currentIdx
                        return (
                          <>
                            <Button
                              variant="outline"
                              className="px-2 w-8"
                              onClick={() =>
                                canDec && dec(toAscension, toLevel)
                              }
                              disabled={!canDec}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="justify-between w-[100px]"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <span>
                                      {labelFor(toAscension, toLevel)}
                                    </span>
                                    {isStar(toAscension, toLevel) ? (
                                      <Sparkle className="h-4 w-4" />
                                    ) : null}
                                  </span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center">
                                {renderMenu((asc, lvl) => {
                                  const pickIdx = toIndex(asc, lvl)
                                  const floored = Math.max(pickIdx, currentIdx)
                                  clampTo(floored)
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              className="px-2 w-8"
                              onClick={() => inc(toAscension, toLevel)}
                              disabled={desiredIsLast}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="grid grid-cols-5 gap-4">
            {skillRanges.map(([from, to], i) => (
              <div key={i} className="space-y-2">
                {i === 2 ? (
                  <div className="space-y-2">
                    <Label className="justify-center">Inherent</Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                        <span className="text-xs text-muted-foreground">
                          L2
                        </span>
                        <Switch
                          checked={inherentLevels[0]}
                          onCheckedChange={(v) =>
                            setInherentLevels([Boolean(v), inherentLevels[1]])
                          }
                          className="[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                        <span className="text-xs text-muted-foreground">
                          L1
                        </span>
                        <Switch
                          checked={inherentLevels[1]}
                          onCheckedChange={(v) =>
                            setInherentLevels([inherentLevels[0], Boolean(v)])
                          }
                          className="[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border"
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
                              idx === (i > 2 ? i - 1 : i)
                                ? [Boolean(v), r[1]]
                                : r,
                            ) as any,
                          )
                        }
                        className="[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm w-full justify-between px-4">
                      <span className="text-xs text-muted-foreground">L1</span>
                      <Switch
                        checked={statBoosts[i > 2 ? i - 1 : i][1]}
                        onCheckedChange={(v) =>
                          setStatBoosts(
                            statBoosts.map((r, idx) =>
                              idx === (i > 2 ? i - 1 : i)
                                ? [r[0], Boolean(v)]
                                : r,
                            ) as any,
                          )
                        }
                        className="[&_span]:border-input h-3 border-none [&_span]:size-4.5 [&_span]:border"
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
                    onValueChange={(vals: number[]) =>
                      setSkillRange(i, vals[0] ?? from, vals[1] ?? to)
                    }
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {from} → {to}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              onClick={onConfirm}
            >
              Save Plan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
