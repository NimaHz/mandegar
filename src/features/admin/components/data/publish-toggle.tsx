"use client";

import { Eye, EyeOff } from "lucide-react";

import { adminContent } from "../../content";
import { IconAction } from "./row-actions";

interface PublishToggleProps {
  published: boolean;
  label: string;
  onToggle: () => void;
}

const { common } = adminContent;

export function PublishToggle({ published, label, onToggle }: PublishToggleProps) {
  return (
    <IconAction
      label={`${published ? common.unpublish : common.publish}: ${label}`}
      icon={published ? EyeOff : Eye}
      onClick={onToggle}
    />
  );
}
