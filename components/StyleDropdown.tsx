"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type CardStyle = "forest" | "desert" | "mountains" | "palm_desert"

const styleOptions: { value: CardStyle; label: string }[] = [
    { value: "forest", label: "Erdő" },
    { value: "desert", label: "Sivatag" },
    { value: "mountains", label: "Hegység" },
    { value: "palm_desert", label: "Pálmafás sivatag" }
]

interface StyleDropdownProps {
    selectedStyle: CardStyle
    onStyleChange: (style: CardStyle) => void
    className?: string
}

export function StyleDropdown({ selectedStyle, onStyleChange, className }: StyleDropdownProps) {
    const [open, setOpen] = useState(false)

    const selectedOption = styleOptions.find(option => option.value === selectedStyle)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-between", className)}
                >
                    <span>{selectedOption?.label}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
                {styleOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                            onStyleChange(option.value)
                            setOpen(false)
                        }}
                        className="flex items-center justify-between"
                    >
                        {option.label}
                        {selectedStyle === option.value && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}