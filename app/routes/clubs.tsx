import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authenticator } from "~/auth.server";
import { ClubsNavbar } from "~/components/clubs-navbar";
import { Onboarding } from "~/components/onboarding";
import { Toaster } from "~/components/ui/sonner";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  let student = null;
  if (user) {
    student = await prisma.student.findUnique({ where: { email: user.email } });
  }
  return json({ user, student });
}

export default function Clubs() {
  const { user, student } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  /* Loading indicator */
  const [loadingTimeout, setLoadingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [loadingToast, setLoadingToast] = useState<string | number | null>(
    null
  );
  useEffect(() => {
    if (navigation.state !== "idle" && !navigation.formAction && !loadingTimeout) {
      setLoadingTimeout(
        setTimeout(
          () =>
            setLoadingToast(
              toast(
                <div className="flex flex-row justify-center items-center">
                  {/* animate-[spin_1s_linear_infinite,ping_1s_cubic-bezier(0,0,0.2,1)_infinite,pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] */}
                  <Loader2 className="size-4 text-primary mr-1 animate-spin" />
                  {Array.from("Loading...").map((c, i) => (
                    <span
                      key={i}
                      className="motion-safe:animate-bounce"
                      style={{ animationDelay: `-${1.5 - i * 0.1}s` }}
                    >
                      {c}
                    </span>
                  ))}
                </div>,
                { duration: Infinity, important: true }
              )
            ),
          300
        )
      );
    } else if (navigation.state === "idle" && loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);

      if (loadingToast) {
        toast.dismiss(loadingToast);
        setLoadingToast(null);
      }
    }
  }, [navigation]);

  return (
    <>
      <ClubsNavbar user={user} />
      {user ? <Onboarding studentExists={!!student} user={user} /> : null}
      <Outlet />
      <Toaster />
    </>
  );
}
