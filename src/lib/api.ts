import axios from "axios";
import { Recipe } from "@/components/recipe/RecipeCard";
import { supabase } from "../../supabase/supabase";

// Spoonacular API key from environment variables
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";

// Cache mechanism to avoid hitting API limits
let recipeCache: Recipe[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getRecipes(
  ingredients?: string[],
  filters?: string[],
): Promise<Recipe[]> {
  try {
    // Check if we have cached recipes and if the cache is still valid
    const now = Date.now();
    if (recipeCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      console.log("Using cached recipes");
      return filterRecipes(recipeCache, ingredients, filters);
    }

    // First try to get recipes from Supabase (our own database)
    const { data: supabaseRecipes, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // If we have enough recipes in our database, use those
    if (supabaseRecipes && supabaseRecipes.length > 20) {
      const formattedRecipes = formatSupabaseRecipes(supabaseRecipes);
      recipeCache = formattedRecipes;
      lastFetchTime = now;
      return filterRecipes(formattedRecipes, ingredients, filters);
    }

    // Otherwise, fetch from Spoonacular API
    const params: Record<string, any> = {
      apiKey: API_KEY,
      number: 50, // Get 50 recipes at once
      addRecipeInformation: true,
      fillIngredients: true,
      instructionsRequired: true,
    };

    // Add ingredients to query if provided
    if (ingredients && ingredients.length > 0) {
      params.includeIngredients = ingredients.join(",");
    }

    // Add diet filters if provided
    if (filters && filters.length > 0) {
      // Map our filter IDs to Spoonacular diet parameters
      const dietMap: Record<string, string> = {
        vegetarian: "vegetarian",
        vegan: "vegan",
        "gluten-free": "gluten-free",
        "dairy-free": "dairy-free",
        "low-carb": "low-carb",
        "high-protein": "high-protein",
      };

      const diets = filters
        .map((filter) => dietMap[filter])
        .filter((diet) => diet !== undefined);

      if (diets.length > 0) {
        params.diet = diets.join(",");
      }
    }

    const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
      params,
    });
    const apiRecipes = response.data.results;

    // Format the API response to match our Recipe interface
    const formattedRecipes = await Promise.all(
      apiRecipes.map(async (recipe: any) => {
        // For each recipe, we need to get more detailed nutrition information
        const nutritionResponse = await axios.get(
          `${BASE_URL}/recipes/${recipe.id}/nutritionWidget.json`,
          { params: { apiKey: API_KEY } },
        );

        return {
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          calories: nutritionResponse.data.calories || 0,
          protein: parseInt(nutritionResponse.data.protein) || 0,
          prepTime: recipe.readyInMinutes || 30,
          ingredients: recipe.extendedIngredients.map(
            (ing: any) => ing.original,
          ),
          instructions:
            recipe.analyzedInstructions[0]?.steps.map(
              (step: any) => step.step,
            ) || [],
          nutrition: {
            carbs: parseInt(nutritionResponse.data.carbs) || 0,
            fat: parseInt(nutritionResponse.data.fat) || 0,
            protein: parseInt(nutritionResponse.data.protein) || 0,
            fiber: parseInt(nutritionResponse.data.fiber) || 0,
            sugar: parseInt(nutritionResponse.data.sugar) || 0,
          },
          tags: [
            ...(recipe.vegetarian ? ["Vegetarian"] : []),
            ...(recipe.vegan ? ["Vegan"] : []),
            ...(recipe.glutenFree ? ["Gluten Free"] : []),
            ...(recipe.dairyFree ? ["Dairy Free"] : []),
            ...(recipe.veryHealthy ? ["Healthy"] : []),
            ...(recipe.cheap ? ["Budget Friendly"] : []),
          ],
          isFavorite: false,
        };
      }),
    );

    // Update cache
    recipeCache = formattedRecipes;
    lastFetchTime = now;

    // Store in Supabase for future use
    await storeRecipesInSupabase(formattedRecipes);

    return filterRecipes(formattedRecipes, ingredients, filters);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    // Fallback to mock data if API fails
    return getMockRecipes();
  }
}

// Helper function to filter recipes based on ingredients and filters
function filterRecipes(
  recipes: Recipe[],
  ingredients?: string[],
  filters?: string[],
): Recipe[] {
  let filteredRecipes = [...recipes];

  // Filter by ingredients if any are provided
  if (ingredients && ingredients.length > 0) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      return ingredients.some((ingredient) =>
        recipe.ingredients.some((recipeIngredient) =>
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase()),
        ),
      );
    });
  }

  // Apply dietary filters
  if (filters && filters.length > 0) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      return filters.some((filter) => {
        const filterLower = filter.toLowerCase();
        return recipe.tags.some((tag) =>
          tag.toLowerCase().includes(filterLower),
        );
      });
    });
  }

  return filteredRecipes;
}

// Helper function to format Supabase recipes to match our Recipe interface
function formatSupabaseRecipes(supabaseRecipes: any[]): Recipe[] {
  return supabaseRecipes.map((recipe) => ({
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
}

// Helper function to store recipes in Supabase for future use
async function storeRecipesInSupabase(recipes: Recipe[]): Promise<void> {
  try {
    // Format recipes for Supabase storage
    const supabaseRecipes = recipes.map((recipe) => ({
      title: recipe.title,
      image: recipe.image,
      calories: recipe.calories,
      protein: recipe.protein,
      prep_time: recipe.prepTime,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      tags: recipe.tags,
      is_community: false,
      created_at: new Date().toISOString(),
    }));

    // Insert recipes in batches to avoid hitting size limits
    const batchSize = 10;
    for (let i = 0; i < supabaseRecipes.length; i += batchSize) {
      const batch = supabaseRecipes.slice(i, i + batchSize);
      await supabase.from("recipes").upsert(batch, { onConflict: "title" });
    }
  } catch (error) {
    console.error("Error storing recipes in Supabase:", error);
  }
}

// Fallback mock data in case API fails
function getMockRecipes(): Recipe[] {
  return [
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
    {
      id: "5",
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
      id: "6",
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
  ];
}

// Function to get popular recipes based on favorites
export async function getPopularRecipes(limit: number = 10): Promise<Recipe[]> {
  try {
    // In a real app, this would query a favorites table and count occurrences
    // For now, we'll just return recipes from our cache or API
    if (recipeCache.length > 0) {
      return recipeCache.slice(0, limit);
    }

    // If cache is empty, get new recipes
    const recipes = await getRecipes();
    if (recipes.length >= limit) {
      return recipes.slice(0, limit);
    } else {
      // If we don't have enough recipes, add mock recipes
      const mockRecipes = getMockRecipes();
      return [...recipes, ...mockRecipes].slice(0, limit);
    }
  } catch (error) {
    console.error("Error fetching popular recipes:", error);
    return getMockRecipes();
  }
}

// Make getMockRecipes available for export
export { getMockRecipes };

// Function to search recipes by query
export async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    if (!query.trim()) return recipeCache;

    const params = {
      apiKey: API_KEY,
      query,
      number: 20,
      addRecipeInformation: true,
      fillIngredients: true,
    };

    const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
      params,
    });
    const apiRecipes = response.data.results;

    // Format the results similar to getRecipes function
    const formattedRecipes = await Promise.all(
      apiRecipes.map(async (recipe: any) => {
        // Simplified version to avoid too many API calls
        return {
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          calories:
            recipe.nutrition?.nutrients.find((n: any) => n.name === "Calories")
              ?.amount || 0,
          protein:
            recipe.nutrition?.nutrients.find((n: any) => n.name === "Protein")
              ?.amount || 0,
          prepTime: recipe.readyInMinutes || 30,
          ingredients:
            recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
          instructions:
            recipe.analyzedInstructions[0]?.steps.map(
              (step: any) => step.step,
            ) || [],
          nutrition: {
            carbs:
              recipe.nutrition?.nutrients.find(
                (n: any) => n.name === "Carbohydrates",
              )?.amount || 0,
            fat:
              recipe.nutrition?.nutrients.find((n: any) => n.name === "Fat")
                ?.amount || 0,
            protein:
              recipe.nutrition?.nutrients.find((n: any) => n.name === "Protein")
                ?.amount || 0,
            fiber:
              recipe.nutrition?.nutrients.find((n: any) => n.name === "Fiber")
                ?.amount || 0,
            sugar:
              recipe.nutrition?.nutrients.find((n: any) => n.name === "Sugar")
                ?.amount || 0,
          },
          tags: [
            ...(recipe.vegetarian ? ["Vegetarian"] : []),
            ...(recipe.vegan ? ["Vegan"] : []),
            ...(recipe.glutenFree ? ["Gluten Free"] : []),
            ...(recipe.dairyFree ? ["Dairy Free"] : []),
          ],
          isFavorite: false,
        };
      }),
    );

    return formattedRecipes;
  } catch (error) {
    console.error("Error searching recipes:", error);
    // Filter cache by query as fallback
    const queryLower = query.toLowerCase();
    return recipeCache.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(queryLower) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(queryLower),
        ),
    );
  }
}
