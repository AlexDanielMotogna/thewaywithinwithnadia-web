import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/cn";

type ImageProps = NextImageProps & {
  alt: string;
};

/** Wrapper around next/image — `alt` is required, radii follow the token scale. */
export function Image({ alt, className, ...props }: ImageProps) {
  return (
    <NextImage alt={alt} className={cn("rounded-md", className)} {...props} />
  );
}
