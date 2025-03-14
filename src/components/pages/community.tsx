import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, Plus, X } from "lucide-react";
import RecipeForm from "@/components/recipe/RecipeForm";
import CommunityRecipes from "@/components/recipe/CommunityRecipes";
import { useAuth } from "../../../supabase/auth";
import { Link } from "react-router-dom";

export default function CommunityPage() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const translations = {
    title: language === "en" ? "Recipe Community" : "مجتمع الوصفات",
    subtitle:
      language === "en"
        ? "Share your recipes and discover dishes from other users"
        : "شارك وصفاتك واكتشف أطباقًا من مستخدمين آخرين",
    browse: language === "en" ? "Browse Recipes" : "تصفح الوصفات",
    share: language === "en" ? "Share Recipe" : "شارك وصفة",
    login:
      language === "en"
        ? "Sign in to share recipes"
        : "تسجيل الدخول لمشاركة الوصفات",
    signIn: language === "en" ? "Sign In" : "تسجيل الدخول",
    closeForm: language === "en" ? "Close Form" : "إغلاق النموذج",
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{translations.title}</h1>
            <p className="text-gray-600 max-w-2xl">{translations.subtitle}</p>
          </div>
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

        <Tabs defaultValue="browse" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="browse">{translations.browse}</TabsTrigger>
              <TabsTrigger value="share" disabled={!user}>
                {translations.share}
              </TabsTrigger>
            </TabsList>

            {!user && (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {translations.signIn}
                </Button>
              </Link>
            )}
          </div>

          <TabsContent value="browse">
            <CommunityRecipes language={language} />
          </TabsContent>

          <TabsContent value="share">
            {user && (
              <RecipeForm
                language={language}
                onSuccess={() => {
                  // Switch back to browse tab after successful submission
                  const browseTab = document.querySelector(
                    '[data-value="browse"]',
                  ) as HTMLElement;
                  if (browseTab) browseTab.click();
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
