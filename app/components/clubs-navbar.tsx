import { Form, Link, useSubmit } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AuthInfo } from "~/auth.server";
import { LogOut, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function ClubsNavbar(props: { user: AuthInfo | null }) {
  const submit = useSubmit();

  return (
    <>
      <nav className="flex justify-between items-center p-4">
        <div>
          <Link to="/" className="text-2xl font-extrabold">
            DSHS Clubs
          </Link>
        </div>

        <div>
          <ul className="flex m-0 p-0 gap-x-4">
            <li>
              <Link to="/clubs">
                <Button variant="link">Catalog</Button>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <ul className="flex m-0 p-0 gap-x-2">
            <li>
              <ModeToggle />
            </li>
            <li>
              {props.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <User className="mr-2 inline" />
                      {props.user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                  <Link to="/login">
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
