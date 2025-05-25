import { useRevalidator } from "@remix-run/react";
import { ImageOff, ImagePlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ImageUpload() {
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const uploadImageSrc = useMemo(
    () => uploadImage && URL.createObjectURL(uploadImage),
    [uploadImage],
  ); // FIXME: is this useMemo doing anything?
  const [alt, setAlt] = useState("");

  const revalidator = useRevalidator();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const toastId = toast.loading("Uploading image...");
    e.preventDefault();
    if (uploadImage) {
      const data = {
        size: uploadImage.size,
        alt,
      };

      let resp;
      try {
        resp = await fetch("../../images/new", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("fetch to get presigned PUT url failed");
        console.error(error);
        toast.error("An error was encountered while uploading the image.", {
          id: toastId,
        });
        return;
      }

      const respJson = await resp.json();
      const parsedResp = z.string().url().safeParse(respJson);
      if (parsedResp.success) {
        try {
          await fetch(parsedResp.data, {
            method: "PUT",
            body: uploadImage,
          });
          toast.success("Image successfully uploaded!", { id: toastId });
          revalidator.revalidate();
        } catch (error) {
          console.error("fetch to presigned PUT url failed");
          console.error(error);
          toast.error("An error was encountered while uploading the image.", {
            id: toastId,
          });
        }
      } else {
        console.error("failed to parse returned presigned PUT url");
        console.error(parsedResp.error.issues);
        toast.error("An error was encountered while uploading the image.", {
          id: toastId,
        });
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          <ImagePlus className="mr-2 size-[1.2rem]" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>Upload a new image.</DialogDescription>
        </DialogHeader>
        {uploadImageSrc ? (
          <img
            src={uploadImageSrc}
            className="aspect-[4/3] h-full w-full rounded bg-muted object-contain"
          />
        ) : (
          <Card>
            <CardContent className="flex aspect-[4/3] flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="w-1/3" />
              No Image
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <Label className="flex flex-col gap-1.5">
            Image
            <Input
              name="image"
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  setUploadImage(event.target.files[0]);
                }
              }}
              className="cursor-pointer"
            />
          </Label>
          <Label className="flex flex-col gap-1.5">
            Alt Text
            <Input
              value={alt}
              onChange={(e) => setAlt(e.currentTarget.value)}
            />
          </Label>
          <DialogClose asChild>
            <Button type="submit" disabled={!uploadImage}>
              Submit
            </Button>
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  );
}
