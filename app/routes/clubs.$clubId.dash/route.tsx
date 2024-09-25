import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import {
  Link,
  useHref,
  useLoaderData,
  useLocation,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { H1, H2, Small } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import qrcode from "qrcode";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import clsx from "clsx";
import { isValidObjectId } from "~/lib/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Dash: ${data?.name} | DSHS Clubs` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const officerOrAdvisor = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });

  if (!officerOrAdvisor) {
    throw redirect("../");
  }

  const club = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: {
      name: true,
      members: {
        select: {
          id: true,
          student: { select: { name: true } },
          studentEmail: true,
          createdAt: true,
        },
      },
    },
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({ ...club, url: request.url });
}

export default function ClubDashboard() {
  const { name, members, url } = useLoaderData<typeof loader>();
  // const qrHref = useHref("../join_qr");
  const [inputQrScale, setInputQrScale] = useState("4");
  const [invalidScaleInput, setInvalidScaleInput] = useState(false);
  const [qrScale, setQrScale] = useState(4);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const qrUrl = new URL(
    "./join_qr",
    /* Trim trailing slash to get consistent relative url */
    url.replace(/\/$/, "")
  ).href;
  useEffect(() => {
    // async stuff needs to go in a useEffect
    const generateQr = async () => {
      setQrDataUrl(await qrcode.toDataURL(qrUrl, { scale: qrScale }));
    };
    generateQr();
  }, [qrUrl, qrScale]);
  // const qrDataUrl = qrcode.toDataURL(qrUrl, { scale: qrScale });

  return (
    <>
      <Link to="../" rel="">
        <Button variant="link">
          <ArrowLeft className="size-4 inline mr-2" />
          Return to public view
        </Button>
      </Link>
      <main className="m-2">
        <H1 className="">{name}</H1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-2 mb-4">Generate Join QR Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join QR Code</DialogTitle>
              <DialogDescription>
                Students can join your club by scanning this QR code
              </DialogDescription>
            </DialogHeader>
            <img
              src={qrDataUrl}
              alt="QR code that students can scan to join the club"
            />
            <div>
              <Label htmlFor="scale">Scale</Label>
              <div className="flex flex-row gap-2">
                <Input
                  id="scale"
                  type="number"
                  value={inputQrScale}
                  onChange={(e) => {
                    setInputQrScale(e.target.value);
                  }}
                  className={clsx(
                    invalidScaleInput && "border-red-500 focus:ring-red-500"
                  )}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const qrScale = parseInt(inputQrScale);
                    if (Number.isNaN(qrScale)) {
                      setInvalidScaleInput(true);
                    } else {
                      setQrScale(qrScale);
                      setInvalidScaleInput(false);
                    }
                  }}
                >
                  Update
                </Button>
              </div>
              {invalidScaleInput ? (
                <Small className="text-red-500">
                  Please enter a valid scale.
                </Small>
              ) : null}
            </div>
            <DialogFooter>
              <a download={`${name} join qr.png`} href={qrDataUrl}>
                <Button>Download as PNG</Button>
              </a>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <H2 className="">Members</H2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.student.name}</TableCell>
                <TableCell>{member.studentEmail}</TableCell>
                <TableCell>{member.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-row gap-4 mt-4">
          <a
            href={
              "mailto:" + members.map((member) => member.studentEmail).join(",")
            }
          >
            <Button>Mail to everyone</Button>
          </a>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(
                members.map((member) => member.studentEmail).join(",")
              );
              toast.success("Emails copied to clipboard!");
            }}
          >
            Copy all email addresses
          </Button>
        </div>
      </main>
    </>
  );
}
