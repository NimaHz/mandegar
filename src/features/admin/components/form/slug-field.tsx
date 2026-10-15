"use client";

import { Wand2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { adminContent } from "../../content";
import { slugify } from "../../lib/slug";
import { CodeInput } from "./fields";

interface SlugFieldProps {
  source: string;
  name?: string;
  placeholder?: string;
}

export function SlugField({ source, name = "slug", placeholder }: SlugFieldProps) {
  const { getValues, setValue } = useFormContext();
  const { common } = adminContent;

  const suggest = () => {
    const value: unknown = getValues(source);
    setValue(name, slugify(typeof value === "string" ? value : ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <CodeInput
          name={name}
          label={common.slug}
          hint={common.slugHint}
          placeholder={placeholder}
        />
      </div>
      <Button
        variant="soft"
        size="icon-lg"
        className="mt-[1.6875rem]"
        aria-label={common.suggestSlug}
        title={common.suggestSlug}
        onClick={suggest}
      >
        <Wand2 className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
