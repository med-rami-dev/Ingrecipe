import { useState } from "react";
import RecipeCard, { Recipe } from "./RecipeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Filter } from "lucide-react";

interface RecipeGridProps {
  recipes: Recipe[];
  language?: "en" | "ar";
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

export default function RecipeGrid({
  recipes,
  language = "en",
  onFavoriteToggle = () => {},
}: RecipeGridProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "calories" | "protein">(
    "default",
  );

  const favoriteRecipes = recipes.filter((recipe) => recipe.isFavorite);

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortBy === "calories") return a.calories - b.calories;
    if (sortBy === "protein") return b.protein - a.protein;
    return 0; // default order
  });

  const displayedRecipes =
    activeTab === "favorites" ? favoriteRecipes : sortedRecipes;

  const translations = {
    all: language === "en" ? "All Recipes" : "جميع الوصفات",
    favorites: language === "en" ? "Favorites" : "المفضلة",
    sortBy: language === "en" ? "Sort by" : "ترتيب حسب",
    default: language === "en" ? "Default" : "افتراضي",
    lowestCalories: language === "en" ? "Lowest Calories" : "أقل سعرات حرارية",
    highestProtein: language === "en" ? "Highest Protein" : "أعلى بروتين",
    noRecipes:
      language === "en" ? "No recipes found" : "لم يتم العثور على وصفات",
    noFavorites:
      language === "en"
        ? "No favorite recipes yet"
        : "لا توجد وصفات مفضلة حتى الآن",
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              {translations.all}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {translations.favorites}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2 border border-gray-100">
          <span className="text-sm font-medium text-gray-600">
            {translations.sortBy}:
          </span>
          <div className="flex gap-1">
            <Button
              variant={sortBy === "default" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("default")}
              className="text-xs h-8"
            >
              {translations.default}
            </Button>
            <Button
              variant={sortBy === "calories" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("calories")}
              className="text-xs h-8"
            >
              {translations.lowestCalories}
            </Button>
            <Button
              variant={sortBy === "protein" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("protein")}
              className="text-xs h-8"
            >
              {translations.highestProtein}
            </Button>
          </div>
        </div>
      </div>

      {activeTab === "all" ? (
        <div>
          {displayedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  language={language}
                  onFavoriteToggle={onFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noRecipes}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  language={language}
                  onFavoriteToggle={onFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noFavorites}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
