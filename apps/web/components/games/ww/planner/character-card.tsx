"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import { CircleHelp, EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import { MotionEffect } from "@/components/animate-ui/effects/motion-effect"
import { Button } from "@/components/ui/button"

type MaterialEntry = {
  type: string
  name: string
  qty: number
  rarity?: number
}

export function CharacterCard({
  name,
  icon,
  elementIcon,
  elementName,
  weaponType,
  breakdown,
  onEdit,
  onRemove,
}: {
  name: string
  icon: string
  elementIcon: string
  elementName: string
  weaponType: string
  breakdown: { credits: number; materials: MaterialEntry[] }
  onEdit?: () => void
  onRemove?: () => void
}) {
  const mats = breakdown.materials
  const getGlow = (rarity?: number) => {
    if (rarity === 1)
      return { base: "#81e6be", light: "#c7f3e1", line: "#81e6be" }
    if (rarity === 2)
      return { base: "#8fd6fa", light: "#c9ebfd", line: "#8fd6fa" }
    if (rarity === 3)
      return { base: "#d0a2fd", light: "#e6cffd", line: "#d0a2fd" }
    if (rarity === 4)
      return { base: "#f9d852", light: "#fdeea6", line: "#f9d852" }
    return { base: "#a1a1aa", light: "#d4d4d8", line: "#a1a1aa" }
  }

  return (
    <MotionEffect slide={{ direction: "down" }} fade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-6">
            <Image
              src={icon}
              alt={name}
              width={64}
              height={64}
              className="rounded-sm"
            />
            <div className="flex flex-col gap-1">
              <div className="font-bold">{name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Image
                  src={elementIcon}
                  alt={elementName}
                  width={24}
                  height={24}
                />
                {elementName} {weaponType}
              </div>
            </div>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 w-8">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil /> Edit plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onRemove}>
                    <Trash2 /> Remove character
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mx-auto justify-around">
            {mats.map((s, idx) => (
              <div
                key={idx}
                className="group rounded-md border bg-background/50 p-2 flex items-center justify-center overflow-hidden"
              >
                <div className="relative flex flex-col items-center gap-1">
                  <div className="relative flex justify-center w-full">
                    {s.name === "Unknown" ? (
                      <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center opacity-85 transition-opacity group-hover:opacity-100">
                        <CircleHelp className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <Image
                        src={getMaterialIconUrl(s.type, s.name)}
                        alt={s.name}
                        width={50}
                        height={50}
                        className="opacity-85 transition-opacity group-hover:opacity-100"
                      />
                    )}

                    <div className="absolute bottom-0 w-3/4">
                      <div className="relative flex w-full items-center">
                        <div className="absolute h-4 w-full -bottom-1">
                          <div
                            className="absolute bottom-0 h-1 w-full blur-lg transition-all duration-200 group-hover:h-4 group-hover:blur opacity-40"
                            style={{ background: getGlow(s.rarity).base }}
                          />
                          <div
                            className="absolute bottom-0 h-2 w-full blur transition-all duration-200 group-hover:h-2 group-hover:blur-sm opacity-60"
                            style={{ background: getGlow(s.rarity).light }}
                          />
                        </div>
                      </div>
                      <div
                        className="h-[3px] opacity-40"
                        style={{ backgroundColor: getGlow(s.rarity).line }}
                      />
                    </div>
                  </div>
                  <div className="text-xs">{s.qty.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MotionEffect>
  )
}
