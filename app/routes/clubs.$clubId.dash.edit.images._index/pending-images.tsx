import { GripHorizontal } from "lucide-react";
import { Card } from "~/components/ui/card";

export function PendingImages({
  images,
}: {
  images: {
    [key: string]: {
      name: string;
      alt: string;
      url: string | null;
    };
  };
}) {
  return (
    <ul className="my-2 flex flex-row flex-wrap justify-left gap-2">
      {Object.values(images).map((e) => (
        <li key={e.url}>
          <div className="flex flex-col items-center justify-center">
            <Card className="relative flex aspect-[4/3] w-24 items-center justify-center overflow-hidden bg-muted lg:w-48">
              {e.url ? (
                <img
                  src={e.url}
                  className="size-full object-contain"
                  draggable={false}
                />
              ) : (
                <p>No image</p>
              )}
            </Card>
          </div>
        </li>
      ))}
    </ul>
  );
}
