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
  galleryImages,
}: {
  galleryImages: { alt: string; url: string }[];
}) {
  return (
    <>
      {galleryImages.length ? (
        <Carousel className="h-fit lg:w-1/2">
          <CarouselContent>
            {galleryImages.map((img, idx) => (
              <CarouselItem key={idx} className="aspect-[4/3]">
                <Card className="flex size-full flex-col justify-center overflow-hidden border-none bg-muted">
                  <img src={img.url} alt={img.alt} className="object-contain" />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 opacity-50 transition-opacity hover:opacity-100 disabled:opacity-0" />
          <CarouselNext className="right-4 opacity-50 transition-opacity hover:opacity-100 disabled:opacity-0" />
        </Carousel>
      ) : (
        <Card className="hidden h-fit rounded-2xl lg:block lg:w-1/2">
          <CardContent className="flex aspect-[4/3] h-full flex-col items-center justify-center text-muted-foreground">
            <ImageOff className="block h-16 w-16" />
            <H1>No images</H1>
          </CardContent>
        </Card>
      )}
    </>
  );
}
