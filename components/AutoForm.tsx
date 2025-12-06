"use client";

import {
    z,
    ZodTypeAny,
    ZodObject
} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReactNode } from "react";


interface StyleConfig {
    formClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    buttonClassName?: string;
    placeholderColor?: string;
}

interface FieldOverride {
    label?: string;
    placeholder?: string;
    type?:
        | "text"
        | "email"
        | "password"
        | "file"
        | "select"
        | "checkbox"
        | "radio"
        | "number"
        | "date";
    options?: { label: string; value: string }[];
}

interface Props<TSchema extends ZodTypeAny> {
    schema: TSchema;
    defaultValues: z.infer<TSchema>;
    onSubmit: (data: Record<string, any>) => Promise<void> | void;
    submitLabel?: string;
    styles?: StyleConfig;
    overrides?: Partial<Record<keyof z.infer<TSchema>, FieldOverride>>;
    toLink: string;
}

function unwrapEffects(schema: ZodTypeAny): ZodObject<any> {
    let current = schema;

    while (
        current &&
        "innerType" in current &&
        typeof current.innerType === "function"
    ) {
        current = current.innerType();
    }

    if (!(current instanceof ZodObject)) {
        throw new Error("Schema must be a ZodObject at the root");
    }
    return current;
}

function getFieldType(def: any): FieldOverride["type"] {
    const constructorName = def?.constructor?.name;
    const typeName = def?._def?.typeName;

    if (constructorName === "ZodString" || typeName === "ZodString") {
        return "text";
    } else if (constructorName === "ZodBoolean" || typeName === "ZodBoolean") {
        return "checkbox";
    } else if (constructorName === "ZodEnum" || typeName === "ZodEnum") {
        return "select";
    } else if (constructorName === "ZodNumber" || typeName === "ZodNumber") {
        return "number";
    } else if (constructorName === "ZodDate" || typeName === "ZodDate") {
        return "date";
    }

    if (def?._def) {
        if (def._def.typeName === "ZodString") return "text";
        if (def._def.typeName === "ZodBoolean") return "checkbox";
        if (def._def.typeName === "ZodEnum") return "select";
        if (def._def.typeName === "ZodNumber") return "number";
        if (def._def.typeName === "ZodDate") return "date";
    }

    return "text";
}

function getEnumOptions(
    def: any,
): { label: string; value: string }[] | undefined {
    if (
        def?.constructor?.name === "ZodEnum" ||
        def?._def?.typeName === "ZodEnum"
    ) {
        const values = def._def?.values || def.options || [];
        return values.map((v: string) => ({
            label: v.charAt(0).toUpperCase() + v.slice(1),
            value: v,
        }));
    }
    return undefined;
}

function convertToPlainObject<T extends Record<string, any>>(
    data: T,
): Record<string, any> {
    const plainData: Record<string, any> = {};

    Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value instanceof Date) {
            plainData[key] = value.toISOString();
        } else if (value instanceof File) {
            plainData[key] = value;
        } else if (Array.isArray(value)) {
            plainData[key] = value.map((item) =>
                item instanceof Date ? item.toISOString() : item,
            );
        } else if (typeof value === "object" && value !== null) {
            plainData[key] = JSON.stringify(value);
        } else {
            plainData[key] = value;
        }
    });

    return plainData;
}

const AutoForm = <TSchema extends ZodTypeAny>({
    schema,
    defaultValues,
    onSubmit,
    submitLabel = "Submit",
    styles,
    overrides = {},
}: Props<TSchema>) => {
    type FormValues = z.infer<TSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const handleSubmit: SubmitHandler<FormValues> = async (data) => {
        const plainData = convertToPlainObject(data);
        try {
            await onSubmit(plainData);
        } catch (err) {
            console.error("Submission failed:", err);
        }
    };

    const baseSchema = unwrapEffects(schema);
    const shape = baseSchema.shape;

    const fields = Object.keys(shape).map((key) => {
        const def = shape[key];
        let detectedType = getFieldType(def);
        let options: { label: string; value: string }[] | undefined;

        if (detectedType === "text") {
            if (key.toLowerCase().includes("email")) detectedType = "email";
            else if (key.toLowerCase().includes("jelszó"))
                detectedType = "password";
        }

        if (detectedType === "select") {
            options = getEnumOptions(def);
        }

        const override = overrides[key as keyof FormValues];

        const finalType =
            override?.type === "radio" && detectedType === "select"
                ? "radio"
                : (override?.type ?? detectedType);

        return {
            name: key as Path<FormValues>,
            label:
                override?.label ??
                key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1"),
            type: finalType,
            placeholder: override?.placeholder,
            options: override?.options ?? options,
        };
    });

    const renderField = (f: (typeof fields)[0], field: any): ReactNode => {
        if (f.type === "file") {
            return (
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? null)
                    }
                    className={styles?.inputClassName}
                />
            );
        }

        if (f.type === "checkbox") {
            return (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                    />
                    <span>{f.placeholder || f.label}</span>
                </div>
            );
        }

        if (f.type === "select" && f.options && f.options.length > 0) {
            return (
                <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                    defaultValue={field.value as string}
                >
                    <SelectTrigger className={styles?.inputClassName}>
                        <SelectValue
                            placeholder={f.placeholder || `Select ${f.label}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {f.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (f.type === "radio" && f.options && f.options.length > 0) {
            return (
                <RadioGroup
                    value={field.value as string}
                    onValueChange={field.onChange}
                    className="space-y-2"
                >
                    {f.options.map((opt) => (
                        <div
                            key={opt.value}
                            className="flex items-center space-x-2"
                        >
                            <RadioGroupItem
                                value={opt.value}
                                id={`${f.name}-${opt.value}`}
                            />
                            <label
                                htmlFor={`${f.name}-${opt.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {opt.label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
            );
        }

        if (f.type === "number") {
            return (
                <Input
                    {...field}
                    type="number"
                    placeholder={f.placeholder}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                        const value =
                            e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                        field.onChange(value);
                    }}
                    className={`${styles?.inputClassName ?? ""} ${
                        styles?.placeholderColor
                            ? `[&::placeholder]:text-[${styles.placeholderColor}]`
                            : ""
                    }`}
                />
            );
        }

        if (f.type === "date") {
            return (
                <Input
                    type="date"
                    placeholder={f.placeholder}
                    value={
                        field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : field.value || ""
                    }
                    onChange={(e) => {
                        const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                        field.onChange(dateValue);
                    }}
                    className={`${styles?.inputClassName ?? ""} ${
                        styles?.placeholderColor
                            ? `[&::placeholder]:text-[${styles.placeholderColor}]`
                            : ""
                    }`}
                />
            );
        }

        return (
            <Input
                {...field}
                type={f.type}
                placeholder={f.placeholder}
                value={field.value === undefined ? "" : field.value}
                className={`${styles?.inputClassName ?? ""} ${
                    styles?.placeholderColor
                        ? `[&::placeholder]:text-[${styles.placeholderColor}]`
                        : ""
                }`}
            />
        );
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className={`space-y-6 w-full max-w-full overflow-hidden ${styles?.formClassName ?? ""}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {fields.map((f) => (
                        <FormField
                            key={f.name as string}
                            control={form.control}
                            name={f.name}
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    {f.type !== "checkbox" && (
                                        <FormLabel
                                            className={styles?.labelClassName}
                                        >
                                            {f.label}
                                        </FormLabel>
                                    )}
                                    <FormControl>
                                        {renderField(f, field)}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <div className="flex justify-center mt-8">
                    <Button
                        type="submit"
                        className={styles?.buttonClassName}
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? "Kérlek várj..."
                            : submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default AutoForm;
