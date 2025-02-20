import { createUploadthing, type FileRouter } from "uploadthing/next";


const f = createUploadthing();

// const handleAuth = () => {
//   const { userId } = auth();
//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   return { userId: userId };
// };

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("file url", file.url);
    }),
  serverMessage: f(["image", "pdf"])
    // .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
