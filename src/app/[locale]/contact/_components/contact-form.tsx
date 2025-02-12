"use client";

import { inputStyles } from "@/app/_components/login-popup";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { type SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "require-name",
    })
    .max(60, {
      message: "name-too-long",
    }),
  email: z
    .string()
    .min(1, {
      message: "require-email",
    })
    .email({
      message: "valid-email",
    }),
  theme: z
    .string()
    .min(1, {
      message: "require-theme",
    })
    .max(200, {
      message: "theme-too-long",
    }),
  message: z
    .string()
    .min(1, {
      message: "require-message",
    })
    .max(2000, {
      message: "message-too-long",
    }),
});

type ContactSchema = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const t = useTranslations("Contact");

  const { mutate: createContact } = api.contact.create.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSchema>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactSchema> = async (data) => {
    try {
      createContact(data);

      toast.success(t("success-message"), {
        duration: 4000,
        position: "bottom-center",
        className: "text-center",
      });
      reset();
    } catch (error) {
      toast.error(t("error-message"), {
        duration: 4000,
        position: "bottom-center",
        className: "text-center",
      });

      throw new Error("Something went wrong!");
    }
  };

  return (
    <section className="mx-auto max-w-[700px]">
      <h1 className="h1">{t("contact")}</h1>
      <h2 className="h2">{t("contact-message")}</h2>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-4"
      >
        <Input
          {...register("name", { required: true })}
          label={t("name")}
          isRequired
          placeholder={t("name")}
          isInvalid={!!errors.name}
          variant="bordered"
          classNames={inputStyles}
          errorMessage={errors.name?.message && t(errors.name.message)}
        />
        <Input
          {...register("email", { required: true })}
          label={t("email")}
          isRequired
          placeholder={t("email")}
          isInvalid={!!errors.email}
          variant="bordered"
          classNames={inputStyles}
          errorMessage={errors.email?.message && t(errors.email.message)}
        />
        <Input
          {...register("theme", { required: true })}
          isRequired
          label={t("theme")}
          placeholder={t("theme")}
          isInvalid={!!errors.theme}
          variant="bordered"
          classNames={inputStyles}
          errorMessage={errors.theme?.message && t(errors.theme.message)}
        />
        <Textarea
          label={t("message")}
          isRequired
          isInvalid={!!errors.message}
          variant="bordered"
          placeholder={t("message")}
          classNames={inputStyles}
          errorMessage={errors.message?.message && t(errors.message.message)}
          {...register("message", {
            required: true,
          })}
        />
        <Button type="submit" className="bg-primary-main text-white">
          {t("send")}
        </Button>
      </form>
    </section>
  );
};

export default ContactForm;
