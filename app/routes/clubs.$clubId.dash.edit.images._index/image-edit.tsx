import {
  GripHorizontal,
  GripVertical,
  ImageOff,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useMediaQuery } from "~/hooks/use-media-query";
import { CSS } from "@dnd-kit/utilities";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HTMLAttributes, useMemo, useState } from "react";
import { z } from "zod";
import React from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useFetcher } from "@remix-run/react";
import { action as presignedS3Action } from "~/routes/clubs.$clubId.images.$imageId";

export default function ImageEdit({
  images,
  imageIds,
}: {
  images: (string | null)[];
  imageIds: string[];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<Array<string>>(
    Array.from({ length: images.length }, (v, k) => `${k}`),
  );
  const cards = items.map((id) => {
    const numId = Number.parseInt(id);
    return <ImageCard key={id} id={id} img={images[numId]} />;
  });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const imageDnd = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items} /*  strategy={horizontalListSortingStrategy} */
      >
        {items.map((id, idx) => {
          const numId = Number.parseInt(id);
          if (!images[numId]) return null;
          return (
            <SortableImageCard
              key={id}
              id={id}
              img={images[numId]}
              imgId={imageIds[numId]}
            />
          );
        })}
      </SortableContext>
      <DragOverlay>
        {activeId ? cards[Number.parseInt(activeId)] : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const id = z.coerce.string().parse(active.id);

    setActiveId(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = z.coerce.string().parse(active.id);
      const overId = z.coerce.string().parse(over.id);
      setItems((items) => {
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  // if (isDesktop) {
  //   return imageDnd;
  // }

  // return (
  //   <Drawer /* snapPoints={[0.5, 0.9]} */>
  //     <DrawerTrigger asChild>
  //       <Button>Open image gallery</Button>
  //     </DrawerTrigger>
  //     <DrawerContent className="max-h-full flex flex-col">
  //       <DrawerHeader>
  //         <DrawerTitle>Image Gallery</DrawerTitle>
  //         <DrawerDescription>
  //           Choose and reorder the images to be displayed in the image gallery
  //         </DrawerDescription>
  //       </DrawerHeader>
  //       <div className="flex-grow flex-shrink flex flex-col gap-4 overflow-y-scroll">
  //         {imageDnd}
  //       </div>
  //     </DrawerContent>
  //   </Drawer>
  // );
  return imageDnd;
}

function SortableImageCard(
  props: React.PropsWithChildren<{
    id: string | number;
    img: string;
    imgId: string;
  }>,
) {
  // The id needs to be a string because falsy values can't be passed to
  // useSortable, and the number 0 is falsy, while the string "0" is not.
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li style={style}>
      <ImageCardWithEditDialog
        ref={setNodeRef}
        attributes={attributes}
        listeners={listeners}
        img={props.img}
        imgId={props.imgId}
      />
    </li>
  );
}

const ImageCardWithEditDialog = React.forwardRef<
  HTMLLIElement,
  HTMLAttributes<HTMLLIElement> & {
    img: string | null;
    imgId: string;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
  }
>(({ listeners, attributes, ...props }, ref) => {
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const uploadImageSrc = useMemo(
    () => uploadImage && URL.createObjectURL(uploadImage),
    [uploadImage],
  );
  const presignedUrlFetcher = useFetcher<typeof presignedS3Action>();
  const uploadFetcher = useFetcher();

  console.log("url", props.imgId, presignedUrlFetcher.data);

  return (
    <Dialog>
      <DialogTrigger className="size-full">
        <ImageCard
          listeners={listeners}
          attributes={attributes}
          img={props.img}
        />
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Replace or delete the image. Click submit when done.
          </DialogDescription>
        </DialogHeader>
        {uploadImageSrc ? (
          <img
            src={uploadImageSrc}
            className="aspect-[4/3] h-full w-full rounded bg-muted object-contain"
          />
        ) : (
          <Card>
            <CardContent className="aspect-[4/3] flex flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="w-1/3" />
              No Image
            </CardContent>
          </Card>
        )}

        <uploadFetcher.Form action={presignedUrlFetcher.data} method="POST" className="flex flex-col gap-1.5">
          <Label className="flex flex-col gap-1.5">
            Image
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  setUploadImage(event.target.files[0]);
                  presignedUrlFetcher.submit(
                    { size: event.target.files[0].size },
                    { method: "POST", action: `../../images/${props.imgId}` },
                  );
                }
              }}
              className="cursor-pointer"
            />
          </Label>
          <Button
            type="submit"
            disabled={
              !uploadImage ||
              presignedUrlFetcher.state !== "idle" ||
              !presignedUrlFetcher.data
            }
          >
            Submit
          </Button>
        </uploadFetcher.Form>
      </DialogContent>
    </Dialog>
  );
});

const ImageCard = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    img: string | null;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
  }
>(({ listeners, attributes, ...props }, ref) => {
  return (
    <div
      data-vaul-no-drag
      ref={ref}
      className="flex flex-col items-center justify-center"
      {...props}
    >
      <GripHorizontal
        className="size-4 touch-none"
        {...listeners}
        {...attributes}
      />
      <Card className="relative flex aspect-[4/3] w-24 items-center justify-center overflow-hidden bg-muted lg:w-48">
        {props.img ? (
          <img
            src={props.img}
            className="size-full object-contain"
            draggable={false}
          />
        ) : (
          <p>No image</p>
        )}
      </Card>
    </div>
  );
  /* return (
    <Card
      data-vaul-no-drag
      ref={ref}
      {...props}
      className="touch-none relative w-full md:w-48 aspect-[4/3] rounded-sm md:rounded-lg bg-muted flex justify-center items-center"
    >
      <img src={props.img} className="object-contain" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute rounded-full h-8 w-8 top-2 right-2"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Delete image</span>
      </Button>
    </Card>
  ); */
});
