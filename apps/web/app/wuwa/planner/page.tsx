"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/animate-ui/radix/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"

export default function WuwaPlannerPage() {
  const [characters, setCharacters] = useState<Array<{ name: string; element: string; icon: string; elementIcon: string }>>([])
  const [weaponsByType, setWeaponsByType] = useState<Record<string, Array<{ name: string; type: string; icon: string }>>>({})
  const [groupsByType, setGroupsByType] = useState<Record<string, Array<{ groupId: number; groupName: string; materials: Array<{ id: number; name: string; rarity: number }> }>>>({})
  const [materialsByType, setMaterialsByType] = useState<Record<string, Array<{ id: number; name: string; rarity: number }>>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/wuwa/assets")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: {
          characters: Array<{ name: string; element: string; icon: string; elementIcon: string }>
          weaponsByType: Record<string, Array<{ name: string; type: string; icon: string }>>
          groupsByType: Record<string, Array<{ groupId: number; groupName: string; materials: Array<{ id: number; name: string; rarity: number }> }>>
          materialsByType: Record<string, Array<{ id: number; name: string; rarity: number }>>
        } = await res.json()
        setCharacters(data.characters)
        setWeaponsByType(data.weaponsByType)
        setGroupsByType(data.groupsByType)
        setMaterialsByType(data.materialsByType)
      } catch (err) {
        console.error("Failed loading WW assets:", err)
      }
    })()
  }, [])

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
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>Wuthering Waves</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>Planner</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="grid gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Groups & Materials</h2>
            {Object.entries(groupsByType).map(([type, groups]) => (
              <div key={type} className="mb-6">
                <h3 className="font-medium mb-2 capitalize">{type.replaceAll('_', ' ')}</h3>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Group</th>
                        <th className="px-3 py-2 text-left">Materials</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <tr key={`${type}:${g.groupId}`} className="border-t align-top">
                          <td className="px-3 py-2 whitespace-nowrap">{g.groupName}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              {g.materials
                                .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name))
                                .map((m) => (
                                  <span key={m.id} className="inline-flex items-center gap-2 rounded border px-2 py-1">
                                    <Image src={getMaterialIconUrl(type, m.name)} alt={m.name} width={24} height={24} />
                                    <span>{m.name} [{m.rarity}]</span>
                                  </span>
                                ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Standalone Materials</h2>
            {Object.entries(materialsByType).map(([type, mats]) => (
              <div key={type} className="mb-6">
                <h3 className="font-medium mb-2 capitalize">{type.replaceAll('_', ' ')}</h3>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Icon</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Rarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mats.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)).map((m) => (
                        <tr key={`${type}:${m.id}`} className="border-t">
                          <td className="px-3 py-2">
                            <Image src={getMaterialIconUrl(type, m.name)} alt={m.name} width={28} height={28} />
                          </td>
                          <td className="px-3 py-2">{m.name}</td>
                          <td className="px-3 py-2">{m.rarity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Characters</h2>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Icon</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Element</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr key={`${c.element}:${c.name}`} className="border-t">
                      <td className="px-3 py-2">
                        <Image src={c.icon} alt={c.name} width={36} height={36} />
                      </td>
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2 flex items-center gap-2">
                        <Image src={c.elementIcon} alt={c.element} width={18} height={18} />
                        <span>{c.element}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {Object.entries(weaponsByType).map(([type, weapons]) => (
            <section key={type}>
              <h2 className="text-lg font-semibold mb-2">{type} Weapons</h2>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Icon</th>
                      <th className="px-3 py-2 text-left">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weapons.map((w) => (
                      <tr key={`${type}:${w.name}`} className="border-t">
                        <td className="px-3 py-2">
                          <Image src={w.icon} alt={w.name} width={36} height={36} />
                        </td>
                        <td className="px-3 py-2">{w.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
