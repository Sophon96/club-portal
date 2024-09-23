import {authReturnToCookie} from "~/cookies.server"
import { json, LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let returnTo = url.searchParams.get("returnTo");

  let headers = new Headers();
  if (returnTo) {
    headers.append("Set-Cookie", await authReturnToCookie.serialize(returnTo));
  }

  return json(null, { headers });
};

export default function Login() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Form
        method="post"
        className="mx-2 flex flex-col gap-2 w-full md:w-1/3 items-center justify-center"
      >
        <H1 className="mb-4">Login</H1>
        <Button
          type="submit"
          formAction="/auth/google/student"
          className="w-full"
        >
          Login as a Student
        </Button>
        <Button
          type="submit"
          formAction="/auth/google/teacher"
          className="w-full"
        >
          Login as a Teacher
        </Button>
      </Form>
    </div>
  );
}
