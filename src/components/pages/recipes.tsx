import { useState } from "react";
import RecipeSearch from "../recipe/RecipeSearch";
import RecipeGrid from "../recipe/RecipeGrid";
import { useRecipes } from "../recipe/RecipeService";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Recipe } from "../recipe/RecipeCard";

// Mock data for initial development
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Grilled Chicken Salad",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    calories: 320,
    protein: 28,
    prepTime: 20,
    ingredients: [
      "2 chicken breasts",
      "2 cups mixed greens",
      "1 cucumber, sliced",
      "1 tomato, diced",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Season chicken breasts with salt and pepper.",
      "Grill chicken for 6-7 minutes per side until cooked through.",
      "Let chicken rest for 5 minutes, then slice.",
      "In a large bowl, combine mixed greens, cucumber, and tomato.",
      "Whisk together olive oil and lemon juice for dressing.",
      "Top salad with sliced chicken and drizzle with dressing.",
    ],
    nutrition: {
      carbs: 8,
      fat: 14,
      protein: 28,
      fiber: 3,
      sugar: 4,
    },
    tags: ["High Protein", "Low Carb", "Gluten Free"],
  },
  {
    id: "2",
    title: "Vegetable Stir Fry",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    calories: 250,
    protein: 12,
    prepTime: 15,
    ingredients: [
      "2 cups mixed vegetables (bell peppers, broccoli, carrots)",
      "1 cup tofu, cubed",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 cup brown rice, cooked",
    ],
    instructions: [
      "Heat sesame oil in a wok or large pan over medium-high heat.",
      "Add garlic and ginger, sauté for 30 seconds until fragrant.",
      "Add tofu and cook until lightly browned, about 3-4 minutes.",
      "Add vegetables and stir-fry for 5-6 minutes until tender-crisp.",
      "Pour in soy sauce and toss to combine.",
      "Serve over cooked brown rice.",
    ],
    nutrition: {
      carbs: 30,
      fat: 10,
      protein: 12,
      fiber: 6,
      sugar: 5,
    },
    tags: ["Vegetarian", "Vegan", "Dairy Free"],
  },
  {
    id: "3",
    title: "Salmon with Roasted Vegetables",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    calories: 420,
    protein: 32,
    prepTime: 30,
    ingredients: [
      "2 salmon fillets",
      "1 zucchini, sliced",
      "1 bell pepper, sliced",
      "1 red onion, sliced",
      "2 tbsp olive oil",
      "1 lemon",
      "2 cloves garlic, minced",
      "Fresh dill",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Toss vegetables with olive oil, garlic, salt, and pepper.",
      "Spread vegetables on a baking sheet and roast for 15 minutes.",
      "Season salmon with salt, pepper, and lemon zest.",
      "Place salmon on top of vegetables and roast for another 12-15 minutes.",
      "Garnish with fresh dill and lemon wedges before serving.",
    ],
    nutrition: {
      carbs: 12,
      fat: 24,
      protein: 32,
      fiber: 4,
      sugar: 6,
    },
    tags: ["High Protein", "Gluten Free", "Dairy Free"],
  },
  {
    id: "4",
    title: "Quinoa Bowl with Avocado",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    calories: 380,
    protein: 14,
    prepTime: 25,
    ingredients: [
      "1 cup quinoa, rinsed",
      "2 cups vegetable broth",
      "1 avocado, sliced",
      "1 cup cherry tomatoes, halved",
      "1 cucumber, diced",
      "1/4 cup red onion, finely chopped",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "Fresh cilantro",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Cook quinoa in vegetable broth according to package instructions.",
      "Let quinoa cool to room temperature.",
      "In a large bowl, combine quinoa, tomatoes, cucumber, and red onion.",
      "Whisk together olive oil, lemon juice, salt, and pepper for dressing.",
      "Toss the quinoa mixture with the dressing.",
      "Top with avocado slices and fresh cilantro.",
    ],
    nutrition: {
      carbs: 42,
      fat: 18,
      protein: 14,
      fiber: 9,
      sugar: 4,
    },
    tags: ["Vegetarian", "Vegan", "Gluten Free"],
  },
  {
    id: "5",
    title: "Turkey and Sweet Potato Chili",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    calories: 340,
    protein: 26,
    prepTime: 40,
    ingredients: [
      "1 lb ground turkey",
      "2 sweet potatoes, diced",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 can (14 oz) diced tomatoes",
      "1 can (14 oz) black beans, drained and rinsed",
      "2 cups chicken broth",
      "2 tbsp chili powder",
      "1 tsp cumin",
      "1 tsp paprika",
      "Salt and pepper to taste",
    ],
    instructions: [
      "In a large pot, brown ground turkey over medium heat.",
      "Add onion and garlic, sauté until softened.",
      "Add sweet potatoes, diced tomatoes, black beans, and chicken broth.",
      "Stir in chili powder, cumin, paprika, salt, and pepper.",
      "Bring to a boil, then reduce heat and simmer for 25-30 minutes.",
      "Serve hot, garnished with optional toppings like avocado or Greek yogurt.",
    ],
    nutrition: {
      carbs: 32,
      fat: 10,
      protein: 26,
      fiber: 8,
      sugar: 7,
    },
    tags: ["High Protein", "Dairy Free", "Gluten Free"],
  },
  {
    id: "6",
    title: "Mediterranean Chickpea Salad",
    image:
      "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=800&q=80",
    calories: 290,
    protein: 10,
    prepTime: 15,
    ingredients: [
      "1 can (14 oz) chickpeas, drained and rinsed",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/2 red onion, finely chopped",
      "1/2 cup feta cheese, crumbled",
      "1/4 cup kalamata olives, pitted and sliced",
      "2 tbsp olive oil",
      "1 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Fresh parsley, chopped",
      "Salt and pepper to taste",
    ],
    instructions: [
      "In a large bowl, combine chickpeas, cucumber, tomatoes, red onion, feta cheese, and olives.",
      "In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.",
      "Pour dressing over the salad and toss to combine.",
      "Garnish with fresh parsley before serving.",
      "For best flavor, refrigerate for at least 30 minutes before serving.",
    ],
    nutrition: {
      carbs: 28,
      fat: 14,
      protein: 10,
      fiber: 7,
      sugar: 5,
    },
    tags: ["Vegetarian", "Gluten Free", "Mediterranean"],
  },
];

export default function RecipesPage() {
  const { filteredRecipes, loading, searchRecipes, toggleFavorite, language } =
    useRecipes();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (
    ingredients: string[],
    filters: string[],
    lang: string,
  ) => {
    setSearchPerformed(true);
    searchRecipes(ingredients, filters, lang);
  };

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    toggleFavorite(id, isFavorite);
  };

  if (loading) {
    return (
      <LoadingScreen
        text={
          language === "en" ? "Finding recipes..." : "جاري البحث عن الوصفات..."
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Button>
            <h1 className="text-xl font-semibold">
              {language === "en" ? "Recipe Finder" : "الباحث عن الوصفات"}
            </h1>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto space-y-8 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === "en"
              ? "Ingredient-Based Recipe Finder"
              : "الباحث عن وصفات حسب المكونات"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === "en"
              ? "Enter the ingredients you have on hand and discover delicious, healthy recipes."
              : "أدخل المكونات المتوفرة لديك واكتشف وصفات لذيذة وصحية."}
          </p>
        </div>

        <RecipeSearch onSearch={handleSearch} />

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            {language === "en" ? "Recipes" : "الوصفات"}
          </h2>
          <RecipeGrid
            recipes={filteredRecipes}
            language={language}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </div>
      </div>
    </div>
  );
}
