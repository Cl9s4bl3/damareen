"use client";

import { useState, useEffect } from "react";
import { WorldNameStep } from "@/components/world-creation/WorldNameStep";
import { ReviewStep } from "@/components/world-creation/ReviewStep";
import { CharacterCreationStep } from "@/components/world-creation/CharacterCreationStep";
import { VezerCreationStep } from "@/components/world-creation/VezerCreationStep";
import { DungeonCreationStep } from "@/components/world-creation/DungeonCreationStep";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AsciiBg from "@/components/backgrounds/AsciiBg";
import {PlayerCardsStep} from "@/components/world-creation/PlayerCardStep";


export type WorldCreationData = {
  worldName: string;
  description: string;
  bgStyle: string;
  cards: Array<{
    id: number;
    name: string;
    damage: number;
    health: number;
    type: "fire" | "water" | "earth" | "air";
    asciiArt: string;
  }>;
  vezerCards: Array<{
    id: number;
    name: string;
    baseCardId: number;
    boostType: "damage_double" | "health_double";
    damage: number;
    health: number;
    type: "fire" | "water" | "earth" | "air";
    asciiArt: string;
  }>;
  dungeons: Array<{
    name: string;
    type: "simple" | "small" | "large";
    description: string;
    cards: Array<{
      cardId: number;
      cardType: "normal" | "vezer";
      order: number;
    }>;
    reward: string;
  }>;
  availableCards: number[];
};


export function WorldCreationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [worldData, setWorldData] = useState<WorldCreationData>({
    worldName: "",
    description: "",
    bgStyle: "forest",
    cards: [],
    vezerCards: [],
    dungeons: [],
    availableCards: [],
  });

  const [bgType, setBgType] = useState('forest');

  useEffect(() => {
    setBgType(worldData.bgStyle);
  }, [worldData.bgStyle]);

  const handleSubmitClick = async () => {
    try {
      const response = await fetch("/api/worlds/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(worldData),
      });

      if (response.ok) {
        toast.success("Világ sikeresen létrehozva!");
        router.push("/dashboard");
      } else {
        toast.error("Hiba történt a világ létrehozása során");
      }
    } catch (error) {
      toast.error("Hiba történt a világ létrehozása során");
      console.error("Error:", error);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateWorldData = (updates: Partial<WorldCreationData>) => {
    setWorldData((prev) => ({ ...prev, ...updates }));
  };

  const ProgressIndicator = () => (
      <div className="flex justify-center mb-6 md:mb-8 px-2">
        {[1, 2, 3, 4, 5, 6].map((stepNumber) => {
          const isActive = step >= stepNumber;
          const isCompleted = step > stepNumber;
          return (
              <div key={stepNumber} className="flex items-center">
                <div
                    className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm transition-colors"
                    style={{
                      background: isActive ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 25%)",
                      color: isActive ? "hsl(0, 0%, 10%)" : "hsl(0, 0%, 65%)",
                    }}
                >
                  {stepNumber}
                </div>
                {stepNumber < 6 && (
                    <div
                        className="w-4 h-1 md:w-8 mx-1 md:mx-2 rounded transition-colors"
                        style={{
                          background: isCompleted
                              ? "hsl(0, 0%, 60%)"
                              : "hsl(0, 0%, 25%)",
                        }}
                    />
                )}
              </div>
          );
        })}
      </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
            <WorldNameStep
                key="step1"
                data={worldData}
                onUpdate={updateWorldData}
                onNext={nextStep}
            />
        );
      case 2:
        return (
            <CharacterCreationStep
                key="step2"
                data={worldData}
                onUpdate={updateWorldData}
                onNext={nextStep}
                onBack={prevStep}
            />
        );
      case 3:
        return (
            <VezerCreationStep
                key="step3"
                data={worldData}
                onUpdate={updateWorldData}
                onNext={nextStep}
                onBack={prevStep}
            />
        );
      case 4:
        return (
            <PlayerCardsStep
                key="step4"
                data={worldData}
                onUpdate={updateWorldData}
                onNext={nextStep}
                onBack={prevStep}
            />
        );

      case 5:
        return (
            <DungeonCreationStep
                key="step5"
                data={worldData}
                onUpdate={updateWorldData}
                onNext={nextStep}
                onBack={prevStep}
            />
        );
      case 6:
        return (
            <ReviewStep
                key="step6"
                data={worldData}
                onBack={prevStep}
                onSubmit={handleSubmitClick}
            />
        );
      default:
        return null;
    }
  };

  return (
      <div
          className="min-h-screen p-3 md:p-4 text-gray-100"
          style={{
            color: "hsl(0, 0%, 90%)",
          }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Telefon step cím */}
          <div className="md:hidden mb-4 text-center">
            <h1 className="text-xl font-bold">
              {step === 1
                  ? "Világ Létrehozása"
                  : step === 2
                      ? "Kártyák Készítése"
                      : step === 3
                          ? "Vezér Kártyák"
                          : step === 4
                              ? "Kazamaták"
                              : step === 5
                                  ? "Játékos Kártyák"
                                  : "Áttekintés"}
            </h1>
          </div>

          <ProgressIndicator />

          {/* Step kontent container */}
          <div className="relative min-h-[60vh] md:min-h-[500px]">
            {renderStep()}
          </div>
        </div>
        <AsciiBg type={bgType} />
      </div>
  );
}
