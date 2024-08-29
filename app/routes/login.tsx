import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { H1 } from "~/components/ui/typography";

export default function Login() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Form method="post" className="m-auto flex flex-col gap-2 w-1/3 items-center justify-center">
        <H1 className="mb-4">Login</H1>
        <Button type="submit" formAction="/auth/google/student" className="w-full">
          Login as a Student
        </Button>
        <Button type="submit" formAction="/auth/google/teacher" className="w-full">
          Login as a Teacher
        </Button>
      </Form>
    </div>
  );
}
