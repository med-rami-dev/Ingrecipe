import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  protein: number;
  prepTime: number;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    carbs: number;
    fat: number;
    protein: number;
    fiber: number;
    sugar: number;
  };
  tags: string[];
  isFavorite?: boolean;
  userEmail?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  language?: "en" | "ar";
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

export default function RecipeCard({
  recipe,
  language = "en",
  onFavoriteToggle = () => {},
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite || false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    onFavoriteToggle(recipe.id, newState);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const translations = {
    calories: language === "en" ? "Calories" : "سعرات حرارية",
    protein: language === "en" ? "Protein" : "بروتين",
    prepTime: language === "en" ? "Prep Time" : "وقت التحضير",
    ingredients: language === "en" ? "Ingredients" : "المكونات",
    instructions: language === "en" ? "Instructions" : "تعليمات",
    nutrition: language === "en" ? "Nutrition" : "التغذية",
    carbs: language === "en" ? "Carbs" : "كربوهيدرات",
    fat: language === "en" ? "Fat" : "دهون",
    fiber: language === "en" ? "Fiber" : "ألياف",
    sugar: language === "en" ? "Sugar" : "سكر",
    minutes: language === "en" ? "min" : "دقيقة",
    viewDetails: language === "en" ? "View Details" : "عرض التفاصيل",
    hideDetails: language === "en" ? "Hide Details" : "إخفاء التفاصيل",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 bg-white",
        expanded ? "max-h-[2000px]" : "max-h-[400px]",
      )}
    >
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90"
          onClick={toggleFavorite}
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600",
            )}
          />
        </Button>
      </div>

      <CardContent className="p-4">
        {recipe.userEmail && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipe.userEmail}`}
              alt="User"
              className="w-4 h-4 rounded-full mr-1"
            />
            <span>{recipe.userEmail.split("@")[0]}</span>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>

        <div className="flex justify-between mb-4">
          <div className="text-center">
            <span className="block text-sm text-gray-500">
              {translations.calories}
            </span>
            <span className="font-medium">{recipe.calories}</span>
          </div>
          <div className="text-center">
            <span className="block text-sm text-gray-500">
              {translations.protein}
            </span>
            <span className="font-medium">{recipe.protein}g</span>
          </div>
          <div className="text-center flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {recipe.prepTime} {translations.minutes}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">{translations.ingredients}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">{translations.instructions}</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">{translations.nutrition}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">{translations.carbs}: </span>
                  <span>{recipe.nutrition.carbs}g</span>
                </div>
                <div>
                  <span className="text-gray-500">{translations.fat}: </span>
                  <span>{recipe.nutrition.fat}g</span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {translations.protein}:{" "}
                  </span>
                  <span>{recipe.nutrition.protein}g</span>
                </div>
                <div>
                  <span className="text-gray-500">{translations.fiber}: </span>
                  <span>{recipe.nutrition.fiber}g</span>
                </div>
                <div>
                  <span className="text-gray-500">{translations.sugar}: </span>
                  <span>{recipe.nutrition.sugar}g</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-1"
          onClick={toggleExpanded}
        >
          {expanded ? translations.hideDetails : translations.viewDetails}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
