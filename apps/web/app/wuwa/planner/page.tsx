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
import { PlannerTopBar } from "@/components/games/ww/planner/planner-top-bar"
import { AddCharacterDialog } from "@/components/games/ww/planner/add-character-dialog"
import { CharacterConfigDialog } from "@/components/games/ww/planner/character-config-dialog"
import { CharacterCard } from "@/components/games/ww/planner/character-card"
import { WeaponCard } from "@/components/games/ww/planner/weapon-card"
import { InventoryDialog } from "@/components/games/ww/planner/inventory-dialog"
import { ReorderPlansDialog } from "@/components/games/ww/planner/reorder-plans-dialog"
import { AddWeaponDialog } from "@/components/games/ww/planner/add-weapon-dialog"
import { WeaponConfigDialog } from "@/components/games/ww/planner/weapon-config-dialog"
import { MaterialSummaryCard } from "@/components/games/ww/planner/material-summary-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWwPlanner } from "@/hooks/games/ww/use-ww-planner"
import { WwInventoryProvider } from "@/hooks/games/ww/use-ww-inventory"
import { AnimatePresence } from "motion/react"
import { useMemo, useState } from "react"
import { ClipboardCheck, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

function PlannerContent() {
  const planner = useWwPlanner()
  const [showInventory, setShowInventory] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const summaryItems = useMemo(
    () => planner.getCombinedRemaining(),
    [planner.getCombinedRemaining, planner.plans, planner.weaponPlans],
  )

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

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PlannerTopBar
          onAddCharacter={planner.openAddCharacter}
          onAddWeapon={planner.openAddWeapon}
          onManageInventory={() => setShowInventory(true)}
          onReorderPlans={planner.openReorderPlans}
          summaryOpen={summaryOpen}
          setSummaryOpen={setSummaryOpen}
        />

        <div
          className={`grid grid-cols-1 gap-3 ${summaryOpen ? "block" : "hidden"}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Material Summary
                <Button
                  variant="outline"
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="ml-auto"
                >
                  <EyeOff />
                  Hide
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialSummaryCard
                items={summaryItems}
                loading={planner.loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {planner.orderedItems.map((item, pos) => {
              if (item.kind === "CHAR") {
                const idx = planner.plans.findIndex((p) => p.planId === item.id)
                const p = planner.plans[idx]
                if (!p) return null
                return (
                  <CharacterCard
                    key={`C-${p.planId}`}
                    name={p.characterName}
                    icon={p.characterIcon}
                    rarity={
                      planner.characters.find((c) => c.id === p.characterId)
                        ?.rarity as number
                    }
                    elementIcon={p.characterElementIcon}
                    elementName={p.characterElement}
                    weaponType={p.characterWeaponType}
                    breakdown={planner.getPlanBreakdown(p)}
                    onEdit={() => planner.beginEditPlan(idx)}
                    onRemove={() => planner.removePlan(idx)}
                    onMarkDone={() => planner.markPlanAsDone(idx)}
                    availableFor={(type: string, name: string) => {
                      const posAvail = planner.getMixedAvailability(pos)
                      return posAvail.availableFor(type, name)
                    }}
                    availableExp={() =>
                      planner
                        .getMixedAvailability(pos)
                        .availableExp("CHARACTER")
                    }
                  />
                )
              }
              if (item.kind === "WEAPON") {
                const idx = planner.weaponPlans.findIndex(
                  (p) => p.planId === item.id,
                )
                const p = planner.weaponPlans[idx]
                if (!p) return null
                return (
                  <WeaponCard
                    key={`W-${p.planId}`}
                    name={p.weaponName}
                    icon={p.weaponIcon}
                    weaponType={p.weaponType}
                    rarity={p.weaponRarity}
                    breakdown={planner.getWeaponPlanBreakdown(p)}
                    onEdit={() => planner.beginEditWeaponPlan(idx)}
                    onRemove={() => planner.removeWeaponPlan(idx)}
                    onMarkDone={() => planner.markWeaponPlanAsDone(idx)}
                    availableFor={(type: string, name: string) => {
                      const posAvail = planner.getMixedAvailability(pos)
                      return posAvail.availableFor(type, name)
                    }}
                    availableExp={() =>
                      planner.getMixedAvailability(pos).availableExp("WEAPON")
                    }
                  />
                )
              }
              return null
            })}
          </AnimatePresence>
        </div>
      </div>

      <AddCharacterDialog
        open={planner.showAddCharacter}
        onOpenChange={(o) => {
          if (o) {
            planner.openAddCharacter()
          } else {
            planner.closeAddCharacter()
          }
        }}
        search={planner.search}
        setSearch={planner.setSearch}
        characters={planner.filteredCharacters}
        onChoose={planner.chooseCharacter}
      />

      <CharacterConfigDialog
        open={planner.showCharacterConfig}
        onOpenChange={(o) => (!o ? planner.cancelCharacterConfig() : null)}
        character={planner.selectedCharacter}
        fromAscension={planner.fromAscension}
        toAscension={planner.toAscension}
        setFromAscension={planner.setFromAscension}
        setToAscension={planner.setToAscension}
        fromLevel={planner.fromLevel}
        toLevel={planner.toLevel}
        setFromLevel={planner.setFromLevel}
        setToLevel={planner.setToLevel}
        skillRanges={planner.skillRanges}
        setSkillRange={planner.setSkillRange}
        inherentLevels={planner.inherentLevels}
        setInherentLevels={planner.setInherentLevels}
        statBoosts={planner.statBoosts}
        setStatBoosts={planner.setStatBoosts}
        onConfirm={planner.confirmCharacterPlan}
      />

      <AddWeaponDialog
        open={planner.showAddWeapon}
        onOpenChange={(o) => {
          // Only update state if it's actually changing
          // This prevents the dialog from reopening unexpectedly
          if (o && !planner.showAddWeapon) {
            planner.openAddWeapon()
          } else if (!o && planner.showAddWeapon) {
            planner.closeAddWeapon()
          }
        }}
        search={planner.search}
        setSearch={planner.setSearch}
        weapons={planner.filteredWeapons}
        onChoose={planner.chooseWeapon}
      />

      <WeaponConfigDialog
        open={planner.showWeaponConfig}
        onOpenChange={(o) => (!o ? planner.cancelWeaponConfig() : null)}
        weapon={planner.selectedWeapon}
        fromAscension={planner.wFromAscension}
        toAscension={planner.wToAscension}
        setFromAscension={planner.setWFromAscension}
        setToAscension={planner.setWToAscension}
        fromLevel={planner.wFromLevel}
        toLevel={planner.wToLevel}
        setFromLevel={planner.setWFromLevel}
        setToLevel={planner.setWToLevel}
        onConfirm={planner.confirmWeaponPlan}
      />

      <InventoryDialog
        open={showInventory}
        onOpenChange={(o) => setShowInventory(o)}
      />

      <ReorderPlansDialog
        open={planner.showReorderPlans}
        onOpenChange={(o) =>
          o ? planner.openReorderPlans() : planner.closeReorderPlans()
        }
        plans={planner.orderedItems.map((it) => {
          if (it.kind === "CHAR")
            return { id: it.id, name: it.name, icon: it.icon }
          if (it.kind === "WEAPON")
            return { id: it.id, name: it.name, icon: it.icon }
          return { id: it.id, name: it.name, icon: it.icon }
        })}
        onConfirm={(order) => planner.applyPlanOrder(order)}
      />
    </>
  )
}

export default function WuWaPlannerPage() {
  return (
    <WwInventoryProvider>
      <PlannerContent />
    </WwInventoryProvider>
  )
}
