import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Settings,
  User,
  UtensilsCrossed,
  Globe,
  Heart,
  Utensils,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useRecipes } from "../recipe/RecipeService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const {
    popularRecipes,
    refreshRecipes,
    loading: recipesLoading,
  } = useRecipes();
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Modern navigation with gradient */}
      <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-md border-b border-blue-100/30">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-2xl text-blue-600">
              Recipe Finder
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/recipes">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
                  >
                    Recipes
                  </Button>
                </Link>
                <Link to="/community">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
                  >
                    Community
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 hover:cursor-pointer ring-2 ring-blue-100 hover:ring-blue-200 transition-all">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/recipes">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
                  >
                    Recipes
                  </Button>
                </Link>
                <Link to="/community">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
                  >
                    Community
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm px-5 py-2 shadow-md hover:shadow-lg transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero section with animation */}
        <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <motion.div
                className="md:w-1/2 text-center md:text-left"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900 leading-tight"
                  variants={fadeIn}
                >
                  Find Recipes With{" "}
                  <span className="text-blue-600">Ingredients</span> You Already
                  Have
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 mb-8 max-w-xl"
                  variants={fadeIn}
                >
                  Discover delicious, healthy recipes based on what's already in
                  your kitchen. No more wasted food or last-minute grocery runs.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                  variants={fadeIn}
                >
                  <Link to="/recipes">
                    <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                      Find Recipes
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      variant="outline"
                      className="rounded-full border-blue-200 hover:bg-blue-50 px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      Create Account
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="md:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-100 rounded-full z-0 animate-pulse"></div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-100 rounded-full z-0 animate-pulse"></div>
                  <img
                    src="https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=1200&q=80"
                    alt="Food ingredients"
                    className="rounded-2xl shadow-2xl relative z-10 object-cover w-full max-w-lg mx-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features section with cards */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our intelligent recipe finder helps you make the most of what
                you have
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Utensils className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Enter Your Ingredients
                </h3>
                <p className="text-gray-700">
                  Simply type in the ingredients you have available in your
                  kitchen. Our smart search helps with suggestions.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="h-14 w-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Apply Filters
                </h3>
                <p className="text-gray-700">
                  Customize your search with dietary preferences like
                  vegetarian, gluten-free, or high-protein in multiple
                  languages.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Discover & Save
                </h3>
                <p className="text-gray-700">
                  Find perfect recipes with detailed nutrition information, and
                  save your favorites for quick access later.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Recipe showcase section */}
        <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Popular Recipes
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore some of our most loved recipes from the community
              </p>
            </motion.div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Popular Recipes</h2>
              <Button
                onClick={refreshRecipes}
                variant="outline"
                size="sm"
                disabled={recipesLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${recipesLoading ? "animate-spin" : ""}`}
                />
                {recipesLoading ? "Updating..." : "Refresh"}
              </Button>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {popularRecipes.slice(0, 3).map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-blue-600" />
                      {recipe.prepTime} min
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {recipe.title}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">
                        {recipe.calories} calories
                      </span>
                      <div className="flex gap-2">
                        {recipe.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link to="/recipes">
                      <Button className="w-full rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        View Recipe
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/recipes">
                <Button
                  variant="outline"
                  className="rounded-full border-blue-200 hover:bg-blue-50 px-8 py-6 text-lg"
                >
                  Explore All Recipes <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  Dietary Preferences
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Customize your recipe search with specific dietary needs and
                  preferences
                </p>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Vegetarian",
                      "Vegan",
                      "Gluten Free",
                      "Dairy Free",
                      "Low Carb",
                      "High Protein",
                    ].map((diet, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded-md ${index < 3 ? "bg-blue-500" : "border-2 border-blue-300"} mr-3 flex-shrink-0`}
                        ></div>
                        <span className="font-medium text-gray-800">
                          {diet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/recipes">
                    <Button className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                      Try Filtering <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  Multilingual Support
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Access all features in both English and Arabic interfaces
                </p>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-800">
                          English
                        </span>
                      </div>
                      <div className="w-12 h-7 bg-blue-500 rounded-full relative">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-800 ml-3">
                            العربية
                          </span>
                          <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        </div>
                        <p className="text-right text-gray-600">
                          اكتشف وصفات صحية باستخدام المكونات المتوفرة لديك
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-right">
                  <Link to="/recipes">
                    <Button className="rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md">
                      Switch Language <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Cooking?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of home cooks who are making delicious meals with
                ingredients they already have
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/recipes">
                  <Button className="rounded-full bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    Find Recipes Now
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-blue-500 px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-6">Recipe Finder</h3>
              <p className="text-gray-400 mb-6">
                Discover delicious recipes with ingredients you already have in
                your kitchen.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "youtube"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="h-5 w-5 bg-white/20 rounded-full"></div>
                    </a>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Recipes</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    All Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Popular Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Seasonal Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Quick Meals
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Dietary Options</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Vegetarian
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Vegan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Gluten Free
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Low Carb
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Account</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recipes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Saved Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Preferences
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © 2025 Recipe Finder. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
