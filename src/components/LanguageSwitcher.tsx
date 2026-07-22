"use client";

import { useTranslation } from "@/lib/i18n/DictionaryProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-slate-200">
        <DropdownMenuItem 
          onClick={() => setLocale("tr")}
          className={`cursor-pointer ${locale === 'tr' ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
        >
          🇹🇷 Türkçe
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLocale("en")}
          className={`cursor-pointer ${locale === 'en' ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
