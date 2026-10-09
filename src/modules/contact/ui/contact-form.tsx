"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitContactMessageAction } from "@/modules/contact/actions";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/modules/contact/schemas";
import {
  Button,
  FormField,
  Input,
  Textarea,
  TurnstileWidget,
  useZodForm,
} from "@/ui";
import { Link } from "@/i18n/navigation";

type SubmitState = "idle" | "success" | "error" | "rate_limited";

function fieldErrorMessage(
  type: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string | undefined {
  if (!type) return undefined;
  if (type === "invalid_format") return t("Contact.errors.invalidEmail");
  return t("Contact.errors.required");
}

export function ContactForm() {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm(contactFormSchema);
  const [isPending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [state, setState] = useState<SubmitState>("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const onSubmit = (values: ContactFormValues) => {
    const honeypot = honeypotRef.current?.value ?? "";

    startTransition(() => {
      void submitContactMessageAction({
        values,
        honeypot,
        turnstileToken,
      }).then((result) => {
        if (result.ok) {
          setState("success");
          reset();
          return;
        }
        setState(
          result.error.kind === "rate_limited" ? "rate_limited" : "error",
        );
      });
    });
  };

  if (state === "success") {
    return <p className="text-olive-dark">{t("Contact.success")}</p>;
  }

  return (
    <form
      onFocus={() => {
        setArmed(true);
      }}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      {/* Honeypot: hidden from sighted and AT users, left in the DOM for bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          ref={honeypotRef}
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <FormField
        label={t("Contact.fields.name")}
        required
        error={fieldErrorMessage(errors.name?.type, t)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("name")}
            type="text"
            autoComplete="name"
          />
        )}
      </FormField>

      <FormField
        label={t("Contact.fields.email")}
        required
        error={fieldErrorMessage(errors.email?.type, t)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("email")}
            type="email"
            autoComplete="email"
          />
        )}
      </FormField>

      <FormField label={t("Contact.fields.phone")}>
        {(field) => (
          <Input
            {...field}
            {...register("phone")}
            type="tel"
            autoComplete="tel"
          />
        )}
      </FormField>

      <FormField
        label={t("Contact.fields.subject")}
        required
        error={fieldErrorMessage(errors.subject?.type, t)}
      >
        {(field) => <Input {...field} {...register("subject")} type="text" />}
      </FormField>

      <FormField
        label={t("Contact.fields.message")}
        required
        error={fieldErrorMessage(errors.message?.type, t)}
      >
        {(field) => <Textarea {...field} {...register("message")} rows={5} />}
      </FormField>

      <TurnstileWidget armed={armed} onVerify={setTurnstileToken} />

      {state === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {t("Contact.genericError")}
        </p>
      ) : null}
      {state === "rate_limited" ? (
        <p role="alert" className="text-sm text-red-700">
          {t("Contact.rateLimited")}
        </p>
      ) : null}

      <p className="text-charcoal/60 text-xs">
        {t("Contact.privacyNotice")}{" "}
        <Link href="/datenschutz" className="text-olive underline">
          {t("Contact.privacyLinkLabel")}
        </Link>
      </p>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Contact.submitting") : t("Contact.submit")}
      </Button>
    </form>
  );
}
