"use client";

import { useRouter } from "@/navigation";
import { api } from "@/trpc/react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { deleteUploadthingImage } from "../[locale]/uploadthing-action";

const BlogPostFormDeletePopup = ({
  isOpen,
  setIsOpen,
  articleId,
  imageUrl,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  articleId: string;
  imageUrl: string;
}) => {
  const router = useRouter();

  const utils = api.useUtils();

  const { mutate } = api.dashboard.deleteArticle.useMutation();

  const handleDelete = () => {
    try {
      mutate(articleId, {
        onError() {
          toast.error("You don't have permission to delete this article!", {
            position: "bottom-center",
            className: "text-center",
          });
        },
        async onSuccess() {
          await deleteUploadthingImage(imageUrl);
          await utils.articles.getAllArticles.invalidate();
          await utils.articles.getFeaturedArticle.invalidate();
          await utils.dashboard.getUserOnReviewArticles.invalidate();
          await utils.dashboard.currentUserArticle.invalidate();

          router.push("/dashboard");
          router.refresh();

          toast.success("Article deleted successfully!", {
            position: "bottom-center",
            className: "text-center",
          });

          setIsOpen(false);
        },
      });
    } catch (error) {
      toast.error(
        "Somenthing went wrong on Article delete. Please try again or Contact us!",
        {
          position: "bottom-center",
          className: "text-center",
        },
      );
      throw new Error("Something went wrong!");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        placement="center"
        className="text-black"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center">
            Delete Article
          </ModalHeader>
          <ModalBody>
            <h2 className="h4 text-center text-black">
              You are about to delete Article. Are you sure about this?
            </h2>
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button
              color="success"
              className="text-white"
              onPress={() => setIsOpen(false)}
            >
              No
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BlogPostFormDeletePopup;
