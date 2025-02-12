"use client";

import { useNavbarUserOptionsStore } from "@/store/global-store";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/upload-thing";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  AvatarIcon,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { type Session } from "next-auth";
import { PenSquare } from "lucide-react";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";

const userOptionsSchema = z.object({
  image: z.any().optional(),
  name: z
    .string()
    .min(1, {
      message: "require-name",
    })
    .max(30, {
      message: "name-too-long",
    }),
  keywords: z
    .string()
    .max(100, {
      message: "keywords-too-long",
    })
    .optional(),
  about: z
    .string()
    .max(300, {
      message: "about-too-long",
    })
    .optional(),
});

type UserOptionsSchema = z.infer<typeof userOptionsSchema>;

const UserOptionsPopup = ({ session }: { session: Session }) => {
  const t = useTranslations("Dashboard.user-options");

  const pathname = usePathname();

  const utils = api.useUtils();

  const { showUserOptions, setShowUserOptions } = useNavbarUserOptionsStore(
    (state) => ({
      showUserOptions: state.showUserOptions,
      setShowUserOptions: state.setShowUserOptions,
    }),
  );

  const { data: user } = api.user.get.useQuery(session?.user.id);
  const { mutate: updateUserOptions } =
    api.dashboard.updateUserOptions.useMutation();

  const [image, setImage] = useState<File | string | undefined>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserOptionsSchema>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(userOptionsSchema),
  });

  const { startUpload } = useUploadThing("imageUploader");

  const onSubmit: SubmitHandler<UserOptionsSchema> = async (data) => {
    try {
      setLoading(true);
      let uploadedImage;

      if (image) {
        uploadedImage = await startUpload([image as File]);
      }

      updateUserOptions(
        {
          ...data,
          image: uploadedImage?.[0]?.url,
        },
        {
          async onSuccess() {
            await utils.user.invalidate();
            await utils.articles.getAllArticles.invalidate();

            setLoading(false);

            toast.success(t("success-message"), {
              duration: 4000,
              position: "bottom-center",
              className: "text-center",
            });
          },
        },
      );
    } catch (error) {
      setLoading(false);

      toast.error(t("error-message"), {
        duration: 4000,
        position: "bottom-center",
        className: "text-center",
      });

      throw new Error("Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={showUserOptions}
      shouldBlockScroll={false}
      onOpenChange={() => setShowUserOptions(false)}
      className={cn("overflow-y-scroll md:max-h-[90dvh]", {
        "bg-black text-white": !pathname.includes("/dashboard"),
      })}
      placement="center"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col items-center gap-1">
            {t("settings")}
          </ModalHeader>
          <ModalBody>
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-4"
            >
              <div className="relative mx-auto mb-2 max-w-fit bg-transparent transition-opacity duration-200 hover:opacity-80">
                <Avatar
                  icon={user?.image ? undefined : <AvatarIcon />}
                  isBordered
                  size="lg"
                  color="default"
                  src={
                    image
                      ? URL.createObjectURL(image as File)
                      : user?.image ?? ""
                  }
                  className=" cursor-pointer transition-opacity duration-200 hover:opacity-80"
                />
                <PenSquare className="absolute bottom-0 right-0" size={16} />
                <input
                  type={"file"}
                  {...register("image", {
                    required: false,
                  })}
                  className="absolute inset-0 cursor-pointer text-transparent [&::-webkit-file-upload-button]:invisible"
                  onChange={(event) => setImage(event.target.files![0])}
                />
              </div>
              <Input
                type="name"
                variant={"bordered"}
                label={t("name")}
                isRequired
                placeholder={t("name-placeholder")}
                isInvalid={!!errors.name}
                defaultValue={user?.name ?? ""}
                errorMessage={errors.name?.message && t(errors.name.message)}
                classNames={{
                  label: cn("", {
                    "!text-white": !pathname.includes("/dashboard"),
                  }),
                }}
                {...register("name")}
              />
              <Input
                type="keywords"
                variant={"bordered"}
                label={t("keywords")}
                placeholder={t("keywords-placeholder")}
                isInvalid={!!errors.keywords}
                defaultValue={user?.keywords ?? ""}
                errorMessage={
                  errors.keywords?.message && t(errors.keywords.message)
                }
                classNames={{
                  label: cn("", {
                    "!text-white": !pathname.includes("/dashboard"),
                  }),
                }}
                {...register("keywords")}
              />
              <Textarea
                label={t("about")}
                isInvalid={!!errors.about}
                variant="bordered"
                placeholder={t("about-placeholder")}
                defaultValue={user?.about ?? ""}
                errorMessage={errors.about?.message && t(errors.about.message)}
                classNames={{
                  inputWrapper: "!bg-transparent",
                  label: cn("", {
                    "!text-white": !pathname.includes("/dashboard"),
                  }),
                }}
                className="!border-white"
                {...register("about")}
              />
              <Button
                color="primary"
                className="w-full bg-primary-main text-white hover:!bg-orange"
                variant="light"
                type="submit"
                isDisabled={loading}
              >
                {loading ? <Spinner color="primary" /> : <>{t("save")}</>}
              </Button>
            </form>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
};

export default UserOptionsPopup;
