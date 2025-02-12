"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { inputStyles } from "./login-popup";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";
import { hashPassword } from "@/utils";
import { useTranslations } from "next-intl";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, {
        message: "enter-name",
      })
      .max(60, {
        message: "name-too-long",
      }),
    email: z.string().email({
      message: "valid-email",
    }),
    password: z
      .string()
      .min(1, {
        message: "enter-password",
      })
      .max(60, {
        message: "password-too-long",
      }),
    repeatPassword: z.string().min(1, {
      message: "valid-repeat-password",
    }),
  })
  .refine(
    (data) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return data.password === data.repeatPassword;
    },
    {
      message: "passwords-dont-match",
      path: ["repeatPassword"],
    },
  );

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterPopup = ({
  setRegisterActive,
}: {
  setRegisterActive: (state: boolean) => void;
}) => {
  const t = useTranslations("Login");

  const { mutate: user } = api.user.create.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterSchema>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
    try {
      const { email, password, name } = data;
      const hashedPassword = await hashPassword(password);

      user(
        {
          email,
          password: hashedPassword,
          name,
        },
        {
          async onSuccess() {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            await signIn("credentials", {
              callbackUrl: "/dashboard",
              email: email,
              password: password,
            });

            setRegisterActive(false);
            reset();
          },
        },
      );
    } catch (error) {
      throw new Error("Something went wrong with creating your account");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        {...register("name", { required: true })}
        autoFocus
        label={t("name")}
        placeholder={t("enter-name")}
        isInvalid={!!errors.name}
        variant="bordered"
        classNames={inputStyles}
        errorMessage={errors.name?.message && t(errors.name.message)}
      />
      <Input
        {...register("email", { required: true })}
        label={t("email")}
        placeholder={t("enter-email")}
        isInvalid={!!errors.email}
        variant="bordered"
        classNames={inputStyles}
        errorMessage={errors.email?.message && t(errors.email.message)}
      />
      <Input
        {...register("password", { required: true })}
        label={t("password")}
        placeholder={t("enter-password")}
        type="password"
        isInvalid={!!errors.password}
        variant="bordered"
        classNames={inputStyles}
        errorMessage={errors.password?.message && t(errors.password.message)}
      />
      <Input
        {...register("repeatPassword", { required: true })}
        label={t("repeat-password")}
        placeholder={t("repeat-your-password")}
        type="password"
        isInvalid={!!errors.repeatPassword}
        variant="bordered"
        classNames={inputStyles}
        errorMessage={
          errors.repeatPassword?.message && t(errors.repeatPassword.message)
        }
      />
      <div className="flex gap-2 [&>button]:w-full">
        <Button
          type="button"
          onClick={() => setRegisterActive(false)}
          className="bg-rose-200"
        >
          {t("go-back")}
        </Button>
        <Button type="submit" color="success">
          {t("create-account")}
        </Button>
      </div>
    </form>
  );
};

export default RegisterPopup;
