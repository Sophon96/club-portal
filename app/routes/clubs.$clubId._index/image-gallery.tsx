import { ImageOff } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { H1 } from "~/components/ui/typography";

export function ImageGallery({
  galleryImageUrls,
}: {
  galleryImageUrls: (string | null)[];
}) {
  return (
    <>
      {galleryImageUrls.length ? (
        <Carousel className="lg:w-1/2 h-fit bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
          <CarouselContent>
            {galleryImageUrls.map((url, idx) => (
              <CarouselItem
                key={idx}
                className="aspect-[4/3] flex flex-col justify-center"
              >
                {url ? (
                  <img src={url} className="object-contain" />
                ) : (
                  <Card className="w-full">
                    <CardContent className="flex flex-col items-center justify-center h-full">
                      <ImageOff className="w-16 h-16 block" />
                      <H1>Image failed to load</H1>
                    </CardContent>
                  </Card>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 transition-all duration-150 disabled:opacity-0 opacity-50 hover:opacity-100" />
          <CarouselNext className="right-4 opacity-50 hover:opacity-100" />
        </Carousel>
      ) : (
        <Card className="lg:w-1/2 rounded-2xl hidden lg:block h-fit">
          <CardContent className="flex flex-col items-center justify-center aspect-[4/3] h-full text-muted-foreground">
            <ImageOff className="w-16 h-16 block" />
            <H1>No images</H1>
          </CardContent>
        </Card>
      )}
    </>
  );
}
