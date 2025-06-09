import { Form, useFetcher } from "@remix-run/react";
import { ImageOff, Trash2 } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { action as registerStrayAction } from "../clubs.$clubId.images.stray";
import { action as deleteStrayAction } from "../clubs.$clubId.images.stray.delete";

interface StrayImageEditProps {
  images: {
    objKey: string;
    url: string;
  }[];
}

export function StrayImageEdit({ images }: StrayImageEditProps) {
  return (
    <ul className="justify-left flex flex-row flex-wrap gap-2">
      {images.map((image) => (
        <li className="relative" key={image.objKey}>
          <ImageCardWithEditDialog {...image} />
        </li>
      ))}
    </ul>
  );
}

const ImageCardWithEditDialog = React.forwardRef<
  HTMLLIElement,
  HTMLAttributes<HTMLLIElement> & {
    objKey: string;
    url: string;
  }
>((props, ref) => {
  const fetcher = useFetcher<typeof registerStrayAction>();
  const [toastId, setToastId] = useState<string | number | null>(null);
  // console.log(props);

  // kinda cursed, but the returned function is the "cleanup" that runs before
  // rerender but also (importantly) before unmount. Checking for fetcher.data
  // is probably unnecessary, as is having fetcher.state in the dependency
  // array. It works.
  useEffect(() => {
    return () => {
      if (fetcher.data && toastId) {
        if (fetcher.data.success) {
          toast.success("Registered image!", { id: toastId });
        } else {
          console.error(
            "Failed to register stray image (error message:",
            fetcher.data.errorMessage,
            "):",
            fetcher.data.error,
          );
          toast.error(
            "Failed to register image. Error: " + fetcher.data.errorMessage,
          );
        }
        setToastId(null);
      }
    };
  }, [fetcher.state]);

  return (
    <>
      <Dialog>
        <DialogTrigger className="size-full">
          <Card className="flex aspect-[4/3] w-24 items-center justify-center overflow-hidden bg-muted lg:w-48">
            {props.url ? (
              <img
                src={props.url}
                className="size-full object-contain"
                draggable={false}
              />
            ) : (
              <p>No image</p>
            )}
          </Card>
        </DialogTrigger>
        <DialogContent className="max-h-full overflow-auto">
          <DialogHeader>
            <DialogTitle>Register Image</DialogTitle>
            <DialogDescription>
              Add information about the image and register it. Click submit when
              done.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form
            action="../../../images/stray"
            method="POST"
            className="flex flex-col gap-1.5"
            onSubmit={() => {
              // FIXME: find a way to dismiss the toast
              // figured it out, we have a useEffect that runs on unmount
              setToastId(toast.loading("Registering image..."));
            }}
          >
            <input type="hidden" name="key" value={props.objKey} />
            <Label className="flex flex-col gap-1.5">
              Name
              <Input name="name" />
            </Label>
            <Label className="flex flex-col gap-1.5">
              Alt
              <Input name="alt" />
            </Label>
            <Button type="submit">Submit</Button>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
      <DeleteImageForm objKey={props.objKey} />
    </>
  );
});

const DeleteImageForm = (props: { objKey: string }) => {
  const fetcher = useFetcher<typeof deleteStrayAction>();
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    return () => {
      if (fetcher.data && toastId) {
        if (fetcher.data.success) {
          toast.success("Deleted image!", { id: toastId });
        } else {
          console.error(
            "Failed to delete stray image (error message:",
            fetcher.data.errorMessage,
            "):",
            fetcher.data.error,
          );
          toast.error(
            "Failed to delete stray image. Error: " + fetcher.data.errorMessage,
          );
        }
        setToastId(null);
      }
    };
  }, [fetcher.state]);

  return (
    <>
      <fetcher.Form
        method="POST"
        action="../../../images/stray/delete"
        onSubmit={() => {
          setToastId(toast.loading("Deleting image..."));
        }}
      >
        <Button
          type="submit"
          name="key"
          value={props.objKey}
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete image</span>
        </Button>
      </fetcher.Form>
    </>
  );
};

const ImageCard = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    url: string;
    objKey: string;
  }
>((props, ref) => {
  return (
    <div
      data-vaul-no-drag
      ref={ref}
      className="flex flex-col items-center justify-center"
      {...props}
    >
      <Card className="relative flex aspect-[4/3] w-24 items-center justify-center overflow-hidden bg-muted lg:w-48">
        {props.url ? (
          <img
            src={props.url}
            className="size-full object-contain"
            draggable={false}
          />
        ) : (
          <p>No image</p>
        )}
        <Form method="POST" action="../../images/stray/delete">
          <Button
            type="submit"
            name="key"
            value={props.objKey}
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete image</span>
          </Button>
        </Form>
      </Card>
    </div>
  );
});
