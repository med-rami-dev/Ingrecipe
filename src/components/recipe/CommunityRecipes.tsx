import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import RecipeCard, { Recipe } from "./RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Search, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CommunityRecipesProps {
  language?: "en" | "ar";
}

export default function CommunityRecipes({
  language = "en",
}: CommunityRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const { toast } = useToast();

  const translations = {
    title: language === "en" ? "Community Recipes" : "وصفات المجتمع",
    search:
      language === "en"
        ? "Search community recipes..."
        : "البحث في وصفات المجتمع...",
    latest: language === "en" ? "Latest" : "أحدث",
    popular: language === "en" ? "Popular" : "شائع",
    refresh: language === "en" ? "Refresh" : "تحديث",
    noRecipes:
      language === "en"
        ? "No community recipes found"
        : "لم يتم العثور على وصفات مجتمعية",
    loading:
      language === "en"
        ? "Loading community recipes..."
        : "جاري تحميل وصفات المجتمع...",
    error: language === "en" ? "Error loading recipes" : "خطأ في تحميل الوصفات",
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      let query = supabase.from("recipes").select("*").eq("is_community", true);

      if (activeTab === "latest") {
        query = query.order("created_at", { ascending: false });
      } else if (activeTab === "popular") {
        // In a real app, this would be based on likes/views
        query = query.order("calories", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Recipe interface
      const formattedRecipes: Recipe[] = data.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        calories: recipe.calories,
        protein: recipe.protein,
        prepTime: recipe.prep_time,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        tags: recipe.tags,
        isFavorite: false,
        userEmail: recipe.user_email,
      }));

      setRecipes(formattedRecipes);
      setFilteredRecipes(formattedRecipes);
    } catch (error) {
      console.error("Error fetching community recipes:", error);
      toast({
        title: translations.error,
        description: error.message,
        variant: "destructive",
      });

      // Set empty array to avoid showing loading indefinitely
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recipes.filter((recipe) => {
      return (
        recipe.title.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query),
        )
      );
    });

    setFilteredRecipes(filtered);
  }, [searchQuery, recipes]);

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    // Update local state
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === id ? { ...recipe, isFavorite } : recipe,
    );
    setRecipes(updatedRecipes);

    const updatedFiltered = filteredRecipes.map((recipe) =>
      recipe.id === id ? { ...recipe, isFavorite } : recipe,
    );
    setFilteredRecipes(updatedFiltered);

    // In a real app, this would update Supabase
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">{translations.loading}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">{translations.title}</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={translations.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchRecipes}
            className="flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="latest"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="latest" className="flex-1">
            {translations.latest}
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex-1">
            {translations.popular}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="latest" className="mt-6">
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  language={language}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noRecipes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  language={language}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noRecipes}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
