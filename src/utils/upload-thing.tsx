import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@/server/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
