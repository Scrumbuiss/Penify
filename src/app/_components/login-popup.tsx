"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
} from "@nextui-org/react";
import { useLoginStore } from "@/store/login-store";
import { signIn } from "next-auth/react";
import { LockIcon, MailIcon } from "./svg";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import RegisterPopup from "./register-popup";
import { useTranslations } from "next-intl";

const loginSchema = z.object({
  email: z.string().email({
    message: "valid-email",
  }),
  password: z.string().min(1, {
    message: "valid-password",
  }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const inputStyles = {
  label: "!text-white",
  input: "text-white",
  inputWrapper:
    "group-data-[hover=true]:border-orange group-data-[focus=true]:border-orange",
};

const LoginPopup = () => {
  const t = useTranslations("Login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isOpen, onChange } = useLoginStore((state) => ({
    isOpen: state.isOpen,
    onChange: state.onChange,
  }));

  const [registerActive, setRegisterActive] = useState(false);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={() => {
          onChange();
          setRegisterActive(false);
        }}
        placement="center"
        className="bg-black"
        shouldBlockScroll={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center text-white">
            <h2 className="h2">{t("login")}</h2>
          </ModalHeader>
          <ModalBody>
            {!registerActive ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <Input
                  {...register("email", { required: true })}
                  autoFocus
                  endContent={
                    <MailIcon className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
                  }
                  label={t("email")}
                  placeholder={t("enter-email")}
                  isInvalid={!!errors.email}
                  variant="bordered"
                  classNames={inputStyles}
                  errorMessage={
                    errors.email?.message && t(errors.email.message)
                  }
                />
                <Input
                  {...register("password", { required: true })}
                  endContent={
                    <LockIcon className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
                  }
                  label={t("password")}
                  placeholder={t("enter-password")}
                  type="password"
                  isInvalid={!!errors.password}
                  variant="bordered"
                  classNames={inputStyles}
                  errorMessage={
                    errors.password?.message && t(errors.password.message)
                  }
                />
                <div className="flex gap-2 [&>button]:w-full">
                  <Button onClick={() => setRegisterActive(true)}>
                    {t("register")}
                  </Button>
                  <Button type="submit">{t("login")}</Button>
                </div>
                <h2 className="h2 text-center">{t("or")}</h2>
                <div className="flex gap-2 [&>button]:w-full">
                  {/* <Button onClick={() => signIn("google")}>
                    <GoogleIcon />
                  </Button>
                  <Button onClick={() => signIn("discord")}>
                    <DiscordIcon />
                  </Button> */}
                  {/* <Button
                   onClick={() =>
                     signIn("facebook")
                   }
                 >
                   <FbIcon />
                 </Button>
                 <Button
                   onClick={() =>
                     signIn("instagram")
                   }
                 >
                   <InstagramIcon />
                 </Button> */}
                </div>
              </form>
            ) : (
              <RegisterPopup setRegisterActive={setRegisterActive} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginPopup;
