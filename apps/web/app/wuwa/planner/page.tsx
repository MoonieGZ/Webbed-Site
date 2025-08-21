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
import { PlannerTopBar } from "@/components/wuwa/planner/planner-top-bar"
import { AddCharacterDialog } from "@/components/wuwa/planner/add-character-dialog"
import { CharacterConfigDialog } from "@/components/wuwa/planner/character-config-dialog"
import { CharacterCard } from "@/components/wuwa/planner/character-card"
import { useWwPlanner } from "@/hooks/wuwa/use-ww-planner"

export default function WuwaPlannerPage() {
  const planner = useWwPlanner()

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
          totalItems={planner.totalResources.items}
          totalCredits={planner.totalResources.credits}
          onAddCharacter={planner.openAddCharacter}
          onAddWeapon={() => {}}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {planner.plans.map((p, idx) => (
            <CharacterCard
              key={idx}
              name={p.characterName}
              icon={p.characterIcon}
              breakdown={planner.getPlanBreakdown(p)}
            />
          ))}
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
    </>
  )
}
