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
import { HTMLAttributes, useEffect, useMemo, useState } from "react";
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
import { action as saveOrderAction } from "~/routes/clubs.$clubId.images.order";
import { toast } from "sonner";
import { action as deleteImageAction } from "../clubs.$clubId.images.delete";

export default function ImageEdit({
  imageIds,
  images,
}: {
  imageIds: string[];
  images: {
    [key: string]: {
      name: string;
      alt: string;
      url: string | null;
    };
  };
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(imageIds);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // the page will re-render with new images when an image is uploaded, so we
  // append it to the already-ordered images
  useEffect(() => {
    setItems((prevOrder) => {
      // filter out any deleted images
      const remainingItems = prevOrder.filter((id) => imageIds.includes(id));
      // get new images and append to the end of the current order
      const newIds = imageIds.filter((id) => !remainingItems.includes(id));
      return [...remainingItems, ...newIds];
    });
  }, [imageIds]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    const id = z.coerce.string().parse(active.id);

    console.debug("start drag", id);

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

    console.debug("end drag", active.id, over?.id);

    setActiveId(null);
  }

  return (
    <>
      <ul className="justify-left flex flex-row flex-wrap gap-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items}>
            {items.map((id) => {
              // console.log(id);
              // if (!images2[id]) return null;
              if (!(id in images)) {
                return null;
              }
              return (
                <SortableImageCard key={id} id={id} img={images[id]?.url} />
              );
            })}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <ImageCard
                key={activeId}
                id={activeId}
                img={images[activeId].url}
                imgId={activeId}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </ul>
      <SaveOrderForm orderedIds={items} />
    </>
  );
}

const SaveOrderForm = ({ orderedIds }: { orderedIds: string[] }) => {
  const fetcher = useFetcher<typeof saveOrderAction>();
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && toastId) {
      // FIXME: add errors to toast
      if (fetcher.data.success) {
        toast.success("Saved order!", { id: toastId });
      } else {
        toast.error(
          `Encountered error while saving order: ${fetcher.data.error}`,
          { id: toastId },
        );
      }
      setToastId(null);
    }
  }, [fetcher.state]);

  return (
    <Button
      variant="default"
      className="mt-2"
      onClick={(e) => {
        // console.log(e)
        const thing = toast.loading("Saving order...");
        setToastId(thing);
        fetcher.submit(
          { ids: orderedIds },
          {
            method: "POST",
            action: "../../../images/order",
            encType: "application/json",
          },
        );
      }}
    >
      Save Order
    </Button>
  );
};

function SortableImageCard(props: { id: string; img: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li style={style}>
      <ImageCard
        ref={setNodeRef}
        attributes={attributes}
        listeners={listeners}
        img={props.img}
        imgId={props.id}
      />
    </li>
  );
}

const ImageCard = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    img: string | null;
    imgId: string;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
  }
>(({ listeners, attributes, ...props }, ref) => {
  const fetcher = useFetcher<typeof deleteImageAction>();
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    return () => {
      if (fetcher.data && toastId) {
        if (fetcher.data.success) {
          toast.success("Deleted image!", { id: toastId });
        } else {
          console.error(
            "Failed to delete image (error message:",
            fetcher.data.errorMessage,
            "):",
            fetcher.data.error,
          );
          toast.error(
            "Failed to delete image. Error: " + fetcher.data.errorMessage,
          );
        }
        setToastId(null);
      }
    };
  }, [fetcher.state]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center"
      {...props}
    >
      <GripHorizontal
        className="size-4 cursor-pointer touch-none"
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
        <fetcher.Form
          method="DELETE"
          action="../../../images/delete"
          onSubmit={() => setToastId(toast.loading("Deleting image..."))}
        >
          <Button
            type="submit"
            name="id"
            value={props.imgId}
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete image</span>
          </Button>
        </fetcher.Form>
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
