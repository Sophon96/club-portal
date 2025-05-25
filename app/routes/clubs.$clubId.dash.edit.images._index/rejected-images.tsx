import { useFetcher } from "@remix-run/react";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { action as deleteImageAction } from "../clubs.$clubId.images.delete";

export function RejectedImages({
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
    <fetcher.Form
      method="POST"
      action="../../../images/delete"
      onSubmit={() => setToastId(toast.loading("Deleting image..."))}
    >
      <ul className="justify-left my-2 flex flex-row flex-wrap gap-2">
        {/* We use one form for all the images instead of one form per image here
       (like in other components) solely because of how this component is
       structured. It should work both ways. */}
        {Object.entries(images).map(([id, e]) => (
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
                <Button
                  type="submit"
                  name="id"
                  value={id}
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete image</span>
                </Button>
              </Card>
            </div>
          </li>
        ))}
      </ul>
    </fetcher.Form>
  );
}
