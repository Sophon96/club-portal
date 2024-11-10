import { useFetcher } from "@remix-run/react";
import { ImageOff } from "lucide-react";
import React, { useMemo, useState, type HTMLAttributes } from "react";
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

interface StrayImageEditProps {
  images: {
    objKey: string;
    url: string;
  }[];
}

export function StrayImageEdit({ images }: StrayImageEditProps) {
  return (
    <ul className="flex flex-row flex-wrap justify-center gap-2">
      {images.map((image) => (
        <li>
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
  const fetcher = useFetcher();
  console.log(props)

  return (
    <Dialog>
      <DialogTrigger className="size-full">
        <ImageCard url={props.url} />
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
  );
});

const ImageCard = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    url: string;
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
      </Card>
    </div>
  );
});
