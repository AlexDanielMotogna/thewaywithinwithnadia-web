import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const INPUT_CLASS =
  "border-sand focus-visible:outline-gold w-full rounded-md border bg-ivory px-3 py-2 text-sm text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(INPUT_CLASS, className)} {...props} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(INPUT_CLASS, className)} {...props} />;
}
