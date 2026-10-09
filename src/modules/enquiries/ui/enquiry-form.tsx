"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitEnquiryAction } from "@/modules/enquiries/actions";
import {
  enquiryFormSchema,
  type EnquiryFormValues,
} from "@/modules/enquiries/schemas";
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
  if (type === "invalid_format") return t("Enquiry.errors.invalidEmail");
  return t("Enquiry.errors.required");
}

export function EnquiryForm() {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm(enquiryFormSchema);
  const [isPending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [state, setState] = useState<SubmitState>("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const onSubmit = (values: EnquiryFormValues) => {
    const honeypot = honeypotRef.current?.value ?? "";

    startTransition(() => {
      void submitEnquiryAction({ values, honeypot, turnstileToken }).then(
        (result) => {
          if (result.ok) {
            setState("success");
            reset();
            return;
          }
          setState(
            result.error.kind === "rate_limited" ? "rate_limited" : "error",
          );
        },
      );
    });
  };

  if (state === "success") {
    return <p className="text-olive-dark">{t("Enquiry.success")}</p>;
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
        <label htmlFor="enquiry-website">Website</label>
        <input
          ref={honeypotRef}
          id="enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <FormField
        label={t("Enquiry.fields.propertyName")}
        required
        error={fieldErrorMessage(errors.propertyName?.type, t)}
      >
        {(field) => (
          <Input {...field} {...register("propertyName")} type="text" />
        )}
      </FormField>

      <FormField
        label={t("Enquiry.fields.contactPerson")}
        required
        error={fieldErrorMessage(errors.contactPerson?.type, t)}
      >
        {(field) => (
          <Input
            {...field}
            {...register("contactPerson")}
            type="text"
            autoComplete="name"
          />
        )}
      </FormField>

      <FormField
        label={t("Enquiry.fields.email")}
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

      <FormField label={t("Enquiry.fields.phone")}>
        {(field) => (
          <Input
            {...field}
            {...register("phone")}
            type="tel"
            autoComplete="tel"
          />
        )}
      </FormField>

      <FormField label={t("Enquiry.fields.location")}>
        {(field) => <Input {...field} {...register("location")} type="text" />}
      </FormField>

      <FormField
        label={t("Enquiry.fields.collaborationType")}
        description={t("Enquiry.fields.collaborationTypeHint")}
      >
        {(field) => (
          <Input {...field} {...register("collaborationType")} type="text" />
        )}
      </FormField>

      <FormField label={t("Enquiry.fields.preferredDates")}>
        {(field) => (
          <Input {...field} {...register("preferredDates")} type="text" />
        )}
      </FormField>

      <FormField label={t("Enquiry.fields.participants")}>
        {(field) => (
          <Input
            {...field}
            {...register("participants")}
            type="number"
            min={0}
          />
        )}
      </FormField>

      <FormField
        label={t("Enquiry.fields.message")}
        required
        error={fieldErrorMessage(errors.message?.type, t)}
      >
        {(field) => <Textarea {...field} {...register("message")} rows={5} />}
      </FormField>

      <TurnstileWidget armed={armed} onVerify={setTurnstileToken} />

      {state === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {t("Enquiry.genericError")}
        </p>
      ) : null}
      {state === "rate_limited" ? (
        <p role="alert" className="text-sm text-red-700">
          {t("Enquiry.rateLimited")}
        </p>
      ) : null}

      <p className="text-charcoal/60 text-xs">
        {t("Enquiry.privacyNotice")}{" "}
        <Link href="/datenschutz" className="text-olive underline">
          {t("Enquiry.privacyLinkLabel")}
        </Link>
      </p>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Enquiry.submitting") : t("Enquiry.submit")}
      </Button>
    </form>
  );
}
