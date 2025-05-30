"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Filter, X, ChevronDown } from "lucide-react"

export interface SearchFilters {
  category?: string
  subcategory?: string
  ruleType?: string
  keywords?: string[]
  complexity?: string
}

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  selectedCategory?: string
}

export default function AdvancedFilters({ filters, onFiltersChange, selectedCategory }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([])
  const [ruleTypes, setRuleTypes] = useState<string[]>([])
  const [complexityLevels, setComplexityLevels] = useState<string[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true)
      try {
        const url = selectedCategory
          ? `/api/search-rules?category=${encodeURIComponent(selectedCategory)}`
          : "/api/search-rules"

        const response = await fetch(url)
        const data = await response.json()

        setAvailableKeywords(data.keywords || [])
        setRuleTypes(data.ruleTypes || [])
        setComplexityLevels(data.complexityLevels || [])
        setSubcategories(data.subcategories || [])
      } catch (error) {
        console.error("Failed to load filter options:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFilterOptions()
  }, [selectedCategory])

  // Handle filter changes
  const handleKeywordToggle = (keyword: string) => {
    const currentKeywords = filters.keywords || []
    const newKeywords = currentKeywords.includes(keyword)
      ? currentKeywords.filter((k) => k !== keyword)
      : [...currentKeywords, keyword]

    onFiltersChange({
      ...filters,
      keywords: newKeywords.length > 0 ? newKeywords : undefined,
    })
  }

  const handleRuleTypeChange = (ruleType: string | undefined) => {
    onFiltersChange({
      ...filters,
      ruleType,
    })
  }

  const handleComplexityChange = (complexity: string | undefined) => {
    onFiltersChange({
      ...filters,
      complexity,
    })
  }

  const handleSubcategoryChange = (subcategory: string | undefined) => {
    onFiltersChange({
      ...filters,
      subcategory,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: filters.category,
    })
    setIsOpen(false)
  }

  // Count active filters
  const activeFilterCount = [
    filters.ruleType,
    filters.complexity,
    filters.subcategory,
    ...(filters.keywords || []),
  ].filter(Boolean).length

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 md:w-96" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>

            {/* Rule Type Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Rule Type</h4>
              <RadioGroup
                value={filters.ruleType || ""}
                onValueChange={(value) => handleRuleTypeChange(value || undefined)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="rule-type-any" />
                  <Label htmlFor="rule-type-any">Any</Label>
                </div>
                {ruleTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`rule-type-${type}`} />
                    <Label htmlFor={`rule-type-${type}`}>{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Complexity Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Complexity</h4>
              <RadioGroup
                value={filters.complexity || ""}
                onValueChange={(value) => handleComplexityChange(value || undefined)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="complexity-any" />
                  <Label htmlFor="complexity-any">Any</Label>
                </div>
                {complexityLevels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={`complexity-${level}`} />
                    <Label htmlFor={`complexity-${level}`}>{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Subcategory Filter (only if category is selected) */}
            {selectedCategory && subcategories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Subcategory</h4>
                <RadioGroup
                  value={filters.subcategory || ""}
                  onValueChange={(value) => handleSubcategoryChange(value || undefined)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="subcategory-any" />
                    <Label htmlFor="subcategory-any">Any</Label>
                  </div>
                  {subcategories.map((sub) => (
                    <div key={sub} className="flex items-center space-x-2">
                      <RadioGroupItem value={sub} id={`subcategory-${sub}`} />
                      <Label htmlFor={`subcategory-${sub}`}>{sub}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Keywords Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Keywords</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading keywords...</p>
                ) : availableKeywords.length > 0 ? (
                  availableKeywords.slice(0, 20).map((keyword) => (
                    <div key={keyword} className="flex items-center space-x-2">
                      <Checkbox
                        id={`keyword-${keyword}`}
                        checked={(filters.keywords || []).includes(keyword)}
                        onCheckedChange={() => handleKeywordToggle(keyword)}
                      />
                      <Label htmlFor={`keyword-${keyword}`}>{keyword}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No keywords available</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Display */}
      {activeFilterCount > 0 && (
        <Card className="mt-2">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active filters:</span>

              {filters.ruleType && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Type: {filters.ruleType}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRuleTypeChange(undefined)} />
                </Badge>
              )}

              {filters.complexity && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Complexity: {filters.complexity}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleComplexityChange(undefined)} />
                </Badge>
              )}

              {filters.subcategory && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Subcategory: {filters.subcategory}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleSubcategoryChange(undefined)} />
                </Badge>
              )}

              {(filters.keywords || []).map((keyword) => (
                <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                  Keyword: {keyword}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleKeywordToggle(keyword)} />
                </Badge>
              ))}

              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
