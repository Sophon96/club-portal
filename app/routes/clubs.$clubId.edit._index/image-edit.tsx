import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
import { HTMLAttributes, useState } from "react";
import { z } from "zod";
import React from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export default function ImageEdit({ images }: { images: (string | null)[] }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<Array<string>>(
    Array.from({ length: images.length }, (v, k) => `${k}`)
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
          return <SortableImageCard key={id} id={id} img={images[numId]} />;
        })}
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <ImageCard id={activeId} img={images[Number.parseInt(activeId)]} />
        ) : null}
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

  if (isDesktop) {
    return imageDnd;
  }

  return (
    <Drawer /* snapPoints={[0.5, 0.9]} */>
      <DrawerTrigger asChild>
        <Button>Open image gallery</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-full flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Image Gallery</DrawerTitle>
          <DrawerDescription>
            Choose and reorder the images to be displayed in the image gallery
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-grow flex-shrink flex flex-col gap-4 overflow-y-scroll">
          {imageDnd}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SortableImageCard(props: { id: string | number; img: string }) {
  // The id needs to be a string because falsy values can't be passed to
  // useSortable, and the number 0 is falsy, while the string "0" is not.
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ImageCard
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      img={props.img}
    />
  );
}

const ImageCard = React.forwardRef<
  HTMLLIElement,
  HTMLAttributes<HTMLLIElement> & {
    img: string;
    attributes: DraggableAttributes;
    listeners?: SyntheticListenerMap;
  }
>(({ listeners, attributes, ...props }, ref) => {
  return (
    <li
      data-vaul-no-drag
      ref={ref}
      className="flex flex-row items-center"
      {...props}
    >
      <GripVertical className="touch-none" {...listeners} {...attributes} />
      <Card className="relative w-full md:w-48 aspect-[4/3] rounded-sm md:rounded-lg bg-muted flex justify-center items-center">
        <img src={props.img} className="object-contain" draggable={false} />
        <Button
          variant="destructive"
          size="icon"
          className="absolute rounded-full h-8 w-8 top-2 right-2"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete image</span>
        </Button>
      </Card>
    </li>
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
