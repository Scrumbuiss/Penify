import { api } from "@/trpc/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";

const ContactPopup = ({
  contactId,
  isOpen,
  setIsOpen,
}: {
  contactId: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const { data: contact } = api.dashboard.getContact.useQuery(contactId);

  return (
    <Modal
      isOpen={isOpen}
      shouldBlockScroll={false}
      onOpenChange={() => setIsOpen(false)}
      className="overflow-y-scroll md:max-h-[90dvh]"
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {contact?.theme}
            </ModalHeader>
            <ModalBody>
              <Input
                isReadOnly
                label={"Name"}
                value={contact?.name ?? ""}
                variant="bordered"
              />

              <Input
                isReadOnly
                value={contact?.email ?? ""}
                label={"Email"}
                variant="bordered"
              />
              <Textarea
                label={"Message"}
                value={contact?.message ?? ""}
                variant="bordered"
                isReadOnly
              />
              <Input
                isReadOnly
                label={"Date"}
                value={
                  new Date(contact?.createdAt ?? "").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  ) ?? ""
                }
                variant="bordered"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                className="w-full bg-primary-main text-white hover:!bg-orange"
                variant="light"
                onPress={onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ContactPopup;
