import { Form, Link, useLocation, useSubmit } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AuthInfo } from "~/auth.server";
import { LogOut, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useMediaQuery } from "~/hooks/use-media-query";
import clsx from "clsx";

export function ClubsNavbar(props: { user: AuthInfo | null }) {
  const location = useLocation();
  const submit = useSubmit();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <nav className="flex justify-between items-center py-2 px-4">
        <div>
          <Link to="/" className="text-lg font-semibold">
            DSHS Clubs
          </Link>
        </div>

        {isDesktop ? (
          <div>
            <ul className="flex m-0 p-0 gap-x-4">
              <li>
                <Link to="/clubs" prefetch="render">
                  Catalog
                </Link>
              </li>
            </ul>
          </div>
        ) : null}

        <div>
          <ul className="flex m-0 p-0 gap-x-2">
            <li>
              <ModeToggle />
            </li>
            <li>
              {props.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size={isDesktop ? "default" : "icon"}
                      className="p-2"
                    >
                      <User className={clsx("inline size-[1.2rem]", isDesktop && "mr-2")} />
                      {isDesktop ? props.user.email : null}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {!isDesktop ? (
                      <>
                        <DropdownMenuLabel>
                          {props.user.email}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    <Form action="/logout" method="POST">
                      {/* <button type="submit"> */}
                      {/* <Button type="submit" asChild> */}
                      <DropdownMenuItem
                        onClick={(e) => {
                          submit(
                            e.currentTarget.parentElement as HTMLFormElement
                          );
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </DropdownMenuItem>
                      {/* </Button> */}
                      {/* </button> */}
                    </Form>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link
                    to={{
                      pathname: "/login",
                      search: `?returnTo=${location.pathname}`,
                    }}
                  >
                    <Button variant="outline">
                      <User className="mr-1 h-4 w-4 inline" /> Sign in
                    </Button>
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
