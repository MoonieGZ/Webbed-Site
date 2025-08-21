"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import { Coins, HeartHandshake } from "lucide-react"

type MaterialEntry = { type: string; name: string; qty: number }

export function CharacterCard({
  name,
  icon,
  breakdown,
}: {
  name: string
  icon: string
  breakdown: { credits: number; materials: MaterialEntry[] }
}) {
  const mats = breakdown.materials

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-6">
          <Image src={icon} alt={name} width={64} height={64} className="rounded-sm" />
          <div className="flex flex-col gap-1">
            <div className="font-bold">{name}</div>
            <div className="text-xs text-muted-foreground">
              {/* TODO: add element and weapon type */}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="inline-grid grid-cols-4 gap-2 mx-auto w-full">
          {mats.map((s, idx) => (
            <div key={idx} className="rounded-md border bg-background/50 p-2 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <Image src={getMaterialIconUrl(s.type, s.name)} alt={s.name} width={50} height={50} />
                <div className="text-xs">{s.qty.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
