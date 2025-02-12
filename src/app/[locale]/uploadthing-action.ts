"use server";

import { UTApi } from "uploadthing/server";

export const deleteUploadthingImage = async (image: string) => {
  const utapi = new UTApi();

  const fileKey = image.split("/").pop();

  if (!fileKey) {
    throw new Error("Invalid file key");
  }

  await utapi.deleteFiles(fileKey);
};
