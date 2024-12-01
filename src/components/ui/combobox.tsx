"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onSelect: (value: string) => void
  onCreateNew?: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function Combobox({
  options,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Select an option",
  emptyText = "No results found.",
  className,
  searchValue,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={searchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandGroup>
              {options.length > 0 ? (
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onSelect(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))
              ) : (
                <CommandItem
                  value={searchValue || ""}
                  onSelect={() => {
                    if (searchValue && onCreateNew) {
                      onCreateNew(searchValue);
                      setOpen(false);
                    }
                  }}
                  disabled={!searchValue || !onCreateNew}
                >
                  {searchValue && onCreateNew ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create &quot;{searchValue}&quot;
                    </>
                  ) : (
                    emptyText
                  )}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 