import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "~/components/authprovider";
import { action as studentOnboardingAction } from "~/routes/student_onboarding._index";
import { type AuthInfo } from "~/auth.server";

interface OnboardingProps {
  user: AuthInfo;
  studentExists: boolean;
}

export function Onboarding({ user, studentExists }: OnboardingProps) {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const fetcher = useFetcher<typeof studentOnboardingAction>();
  // const user = useAuth();
  let [successToastId, setSuccessToastId] = useState(
    null as null | string | number
  );

  // if (!user) return;

  useEffect(() => {
    if (!onboardingComplete && !dialogOpen) {
      toast.warning("Onboarding incomplete", {
        duration: Infinity,
        description: "Please complete onboarding to access all features",
        action: {
          label: "Complete",
          onClick: () => setDialogOpen(true),
        },
      });
    }

    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      onboardingComplete &&
      successToastId
    ) {
      if (fetcher.data.success) {
        toast.success("Onboarding completed!", { id: successToastId });
      } else {
        toast.error(
          "Error encountered while completing onboarding: " +
            fetcher.data.error,
          { id: successToastId, important: true }
        );
        setOnboardingComplete(false);
        // toast.warning("Onboarding incomplete", {
        //   duration: Infinity,
        //   description: "Please complete onboarding to access all features",
        //   action: {
        //     label: "Complete",
        //     onClick: () => setDialogOpen(true),
        //   },
        // });
      }
    }
  }, [fetcher, dialogOpen, onboardingComplete]);

  if (studentExists) return;

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to the DSHS Clubs platform!</DialogTitle>
            <DialogDescription>
              Fill in the following information to complete onboarding.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form
            method="POST"
            action="/student_onboarding?index"
            onSubmit={() => {
              setDialogOpen(false);
              setOnboardingComplete(true);
              setSuccessToastId(toast.loading("Creating student..."));
            }}
            className="grid gap-4 py-4"
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled // disabled fields aren't sent
                className="col-span-3"
              />
              <input type="hidden" name="email" value={user.email} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="graduation" className="text-right">
                Graduation Year
              </Label>
              <Input
                id="graduation"
                name="graduation"
                type="number"
                defaultValue={new Date().getFullYear() + 1}
                className="col-span-3"
              />
            </div>
            {/* <input type="hidden" name="email" value={user.email} /> */}
            <Button type="submit">Submit</Button>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
