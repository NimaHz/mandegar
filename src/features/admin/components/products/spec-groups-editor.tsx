"use client";

import { useWatch } from "react-hook-form";

import { adminContent } from "../../content";
import { blankText } from "../../schemas";
import { CodeInput, NumberInput } from "../form/fields";
import { LocalizedField } from "../form/localized-field";
import { Repeater } from "../form/repeater";

const copy = adminContent.specs;

interface SpecGroupsEditorProps {
  name: string;
  withValues?: boolean;
}

const textOf = (value: unknown, key: string) => {
  if (typeof value !== "object" || value === null || !(key in value)) return "";
  const text: unknown = Reflect.get(value, key);
  if (typeof text === "object" && text !== null && "fa" in text && typeof text.fa === "string")
    return text.fa;
  return typeof text === "string" ? text : "";
};

const blankTemplateItem = () => ({ key: "", label: blankText(), unit: blankText(), unitCode: "" });

export const blankSpecItem = () => ({ ...blankTemplateItem(), value: blankText(), numeric: null });

const newItem = (withValues: boolean) => (withValues ? blankSpecItem() : blankTemplateItem());

function SpecItems({ name, withValues }: { name: string; withValues: boolean }) {
  const items: unknown = useWatch({ name });
  const list = Array.isArray(items) ? items : [];

  return (
    <Repeater
      name={name}
      compact
      addLabel={copy.addItem}
      emptyLabel={copy.emptyItems}
      newItem={() => newItem(withValues)}
      itemTitle={(index) => textOf(list[index], "label") || textOf(list[index], "key")}
      max={40}
    >
      {(index) => (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CodeInput name={`${name}.${index}.key`} label={copy.key} placeholder="airflow" />
            <CodeInput
              name={`${name}.${index}.unitCode`}
              label={copy.unitCode}
              placeholder="m3/h"
            />
            {withValues && <NumberInput name={`${name}.${index}.numeric`} label={copy.numeric} />}
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <LocalizedField name={`${name}.${index}.label`} label={copy.label} />
            {withValues && <LocalizedField name={`${name}.${index}.value`} label={copy.value} />}
            <LocalizedField name={`${name}.${index}.unit`} label={copy.unit} />
          </div>
        </>
      )}
    </Repeater>
  );
}

export function SpecGroupsEditor({ name, withValues = false }: SpecGroupsEditorProps) {
  const groups: unknown = useWatch({ name });
  const list = Array.isArray(groups) ? groups : [];

  return (
    <Repeater
      name={name}
      addLabel={copy.addGroup}
      emptyLabel={withValues ? copy.emptyGroups : copy.emptyTemplate}
      newItem={() => ({ title: blankText(), items: [newItem(withValues)] })}
      itemTitle={(index) => textOf(list[index], "title")}
      max={20}
    >
      {(index) => (
        <>
          <LocalizedField name={`${name}.${index}.title`} label={copy.groupTitle} />
          <div className="flex flex-col gap-3 rounded-field border border-line bg-sunken/50 p-2.5 sm:p-3">
            <p className="text-caption leading-5 text-muted">
              {withValues ? copy.itemsHint : copy.templateHint}
            </p>
            <SpecItems name={`${name}.${index}.items`} withValues={withValues} />
          </div>
        </>
      )}
    </Repeater>
  );
}
