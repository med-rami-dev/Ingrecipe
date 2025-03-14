import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecipeSearchProps {
  onSearch?: (
    ingredients: string[],
    filters: string[],
    language: string,
  ) => void;
}

const commonIngredients = [
  "Chicken",
  "Beef",
  "Rice",
  "Pasta",
  "Tomato",
  "Onion",
  "Garlic",
  "Potato",
  "Carrot",
  "Broccoli",
  "Spinach",
  "Olive Oil",
  "Salt",
  "Pepper",
];

const dietaryFilters = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
  { id: "low-carb", label: "Low Carb" },
  { id: "high-protein", label: "High Protein" },
];

export default function RecipeSearch({
  onSearch = () => {},
}: RecipeSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = commonIngredients.filter(
      (ingredient) =>
        ingredient.toLowerCase().includes(inputValue.toLowerCase()) &&
        !ingredients.includes(ingredient),
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, ingredients]);

  const addIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient) && ingredient.trim() !== "") {
      setIngredients([...ingredients, ingredient]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((item) => item !== ingredient));
  };

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter((id) => id !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleSearch = () => {
    onSearch(ingredients, activeFilters, language);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      addIngredient(inputValue.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {language === "en"
            ? "Find Recipes by Ingredients"
            : "البحث عن وصفات حسب المكونات"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="rounded-full"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Toggle Language</span>
        </Button>
      </div>

      <div className="relative">
        <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <Search className="ml-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder={
              language === "en" ? "Enter ingredients..." : "أدخل المكونات..."
            }
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => addIngredient(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {language === "en" ? "Dietary Preferences" : "التفضيلات الغذائية"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {dietaryFilters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleFilter(filter.id)}
              >
                <div
                  className={`w-4 h-4 rounded-sm border ${activeFilters.includes(filter.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                >
                  {activeFilters.includes(filter.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filterId) => {
              const filter = dietaryFilters.find((f) => f.id === filterId);
              return (
                <Badge
                  key={filterId}
                  variant="outline"
                  className="px-3 py-1 text-sm"
                >
                  {filter?.label}
                  <button
                    onClick={() => toggleFilter(filterId)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <Button
        onClick={handleSearch}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        disabled={ingredients.length === 0}
      >
        <Search className="h-5 w-5" />
        {language === "en" ? "Find Recipes" : "البحث عن وصفات"}
      </Button>
    </div>
  );
}
