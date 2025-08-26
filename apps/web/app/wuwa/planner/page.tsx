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
import { InventoryDialog } from "@/components/games/ww/planner/inventory-dialog"
import { ReorderPlansDialog } from "@/components/games/ww/planner/reorder-plans-dialog"
import { useWwPlanner } from "@/hooks/games/ww/use-ww-planner"
import { WwInventoryProvider } from "@/hooks/games/ww/use-ww-inventory"
import { AnimatePresence } from "motion/react"
import { useState } from "react"

function PlannerContent() {
  const planner = useWwPlanner()
  const [showInventory, setShowInventory] = useState(false)

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
        <PlannerTopBar
          onAddCharacter={planner.openAddCharacter}
          onAddWeapon={() => {}}
          onManageInventory={() => setShowInventory(true)}
          onReorderPlans={planner.openReorderPlans}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {planner.plans.map((p, idx) => (
              <CharacterCard
                key={p.planId}
                name={p.characterName}
                icon={p.characterIcon}
                elementIcon={p.characterElementIcon}
                elementName={p.characterElement}
                weaponType={p.characterWeaponType}
                breakdown={planner.getPlanBreakdown(p)}
                onEdit={() => planner.beginEditPlan(idx)}
                onRemove={() => planner.removePlan(idx)}
                onMarkDone={() => planner.markPlanAsDone(idx)}
                availableFor={(type, name) =>
                  planner.getAvailableForPlan(idx, type, name)
                }
                availableExp={() =>
                  planner.getTotalExpForPlan(idx, "CHARACTER")
                }
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AddCharacterDialog
        open={planner.showAddCharacter}
        onOpenChange={(o) =>
          o ? planner.openAddCharacter() : planner.closeAddCharacter()
        }
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

      <InventoryDialog
        open={showInventory}
        onOpenChange={(o) => setShowInventory(o)}
      />

      <ReorderPlansDialog
        open={planner.showReorderPlans}
        onOpenChange={(o) =>
          o ? planner.openReorderPlans() : planner.closeReorderPlans()
        }
        plans={planner.plans.map((p) => ({
          characterId: p.characterId,
          characterName: p.characterName,
          characterIcon: p.characterIcon,
        }))}
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
