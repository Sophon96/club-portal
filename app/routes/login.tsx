import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function Login() {
  return (
    <Form method="post">
      <Button type="submit" formAction="/auth/google/student">
        Login as a Student
      </Button>
      <Button type="submit" formAction="/auth/google/teacher">
        Login as a Teacher
      </Button>
    </Form>
  );
}
