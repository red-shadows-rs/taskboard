"use client";

import {
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  LanguageToggle,
  ThemeToggle,
} from "@/components/common/settingsCommon";
import { Loading } from "@/components/common/loadingCommon";
import { Button } from "@/components/ui/buttonUi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenuUi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheetUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";

import type { User } from "@/types";

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === pathname) return;
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      useStore.getState().setUser(null);
      router.push("/login");
    } catch (_error) {}
  };

  return (
    <>
      {isNavigating && <Loading fullScreen />}
      <nav className="border-b bg-background" suppressHydrationWarning>
        <div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-3 flex items-center justify-between"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("common.nav.menu")}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={language === "ar" ? "right" : "left"}
                className="w-[280px]"
              >
                <SheetHeader className="flex flex-row items-center justify-between mb-6 pt-0.5">
                  <SheetTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    {t("common.appName")}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  {user.role === "leader" ? (
                    <>
                      <Link
                        href="/dashboard/tasks"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/tasks");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/tasks"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <CheckSquare className="h-4 w-4" />
                          {t("common.nav.tasks")}
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/projects"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/projects");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname?.startsWith("/dashboard/projects")
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <FolderKanban className="h-4 w-4" />
                          {t("common.nav.projects")}
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/analytics"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/analytics");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/analytics"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <BarChart3 className="h-4 w-4" />
                          {t("common.nav.analytics")}
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/team"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/team");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/team"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <Users className="h-4 w-4" />
                          {t("common.nav.team")}
                        </Button>
                      </Link>
                    </>
                  ) : user.role === "client" ? (
                    <>
                      <Link
                        href="/dashboard/projects"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/projects");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname?.startsWith("/dashboard/projects")
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <FolderKanban className="h-4 w-4" />
                          {t("common.nav.projects")}
                        </Button>
                      </Link>

                      <Link
                        href="/dashboard/team"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/team");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/team"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <Users className="h-4 w-4" />
                          {t("common.nav.team")}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard/tasks"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/tasks");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/tasks"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <CheckSquare className="h-4 w-4" />
                          {t("common.nav.tasks")}
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/analytics"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/analytics");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/analytics"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <BarChart3 className="h-4 w-4" />
                          {t("common.nav.analytics")}
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/team"
                        onClick={(e) => {
                          handleNavigation(e, "/dashboard/team");
                          setIsSheetOpen(false);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            pathname === "/dashboard/team"
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <Users className="h-4 w-4" />
                          {t("common.nav.team")}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-2"
              onClick={(e) => handleNavigation(e, "/dashboard/tasks")}
            >
              <LayoutDashboard className="h-6 w-6 text-primary ltr:mr-2 rtl:ml-2" />
              <span className="font-bold text-xl hidden lg:inline-block">
                {t("common.appName")}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-4">
              {user.role === "leader" ? (
                <>
                  <Link
                    href="/dashboard/tasks"
                    onClick={(e) => handleNavigation(e, "/dashboard/tasks")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/tasks"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                      {t("common.nav.tasks")}
                    </Button>
                  </Link>
                  <Link
                    href="/dashboard/projects"
                    onClick={(e) => handleNavigation(e, "/dashboard/projects")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname?.startsWith("/dashboard/projects")
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <FolderKanban className="h-4 w-4" />
                      {t("common.nav.projects")}
                    </Button>
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    onClick={(e) => handleNavigation(e, "/dashboard/analytics")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/analytics"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {t("common.nav.analytics")}
                    </Button>
                  </Link>
                  <Link
                    href="/dashboard/team"
                    onClick={(e) => handleNavigation(e, "/dashboard/team")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/team"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {t("common.nav.team")}
                    </Button>
                  </Link>
                </>
              ) : user.role === "client" ? (
                <>
                  <Link
                    href="/dashboard/projects"
                    onClick={(e) => handleNavigation(e, "/dashboard/projects")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname?.startsWith("/dashboard/projects")
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <FolderKanban className="h-4 w-4" />
                      {t("common.nav.projects")}
                    </Button>
                  </Link>

                  <Link
                    href="/dashboard/team"
                    onClick={(e) => handleNavigation(e, "/dashboard/team")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/team"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {t("common.nav.team")}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/tasks"
                    onClick={(e) => handleNavigation(e, "/dashboard/tasks")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/tasks"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                      {t("common.nav.tasks")}
                    </Button>
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    onClick={(e) => handleNavigation(e, "/dashboard/analytics")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/analytics"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {t("common.nav.analytics")}
                    </Button>
                  </Link>
                  <Link
                    href="/dashboard/team"
                    onClick={(e) => handleNavigation(e, "/dashboard/team")}
                  >
                    <Button
                      variant="ghost"
                      className={`hover:bg-primary/10 hover:text-primary transition-colors ${
                        pathname === "/dashboard/team"
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {t("common.nav.team")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />

            <div className="hidden sm:flex flex-col ltr:items-end rtl:items-start">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {t(`common.role.${user.role}`)}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild suppressHydrationWarning>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
                  suppressHydrationWarning
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={language === "ar" ? "start" : "end"}
                className="w-56"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="cursor-pointer"
                    onClick={(e) => handleNavigation(e, "/profile")}
                  >
                    <UserIcon
                      className={`h-4 w-4 ${language === "ar" ? "scale-x-[-1]" : ""}`}
                    />
                    {t("common.nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut
                    className={`h-4 w-4 ${language === "ar" ? "scale-x-[-1]" : ""}`}
                  />
                  {t("common.nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}
