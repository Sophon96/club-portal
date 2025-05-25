import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";

export const action = async ({ request }: ActionFunctionArgs) => {
  return await authenticator.authenticate("admin", request);
};

export default function AdminLogin() {
  return (
    <Form
      method="POST"
      className="flex h-screen w-full items-center justify-center"
    >
      <Button type="submit">Login</Button>
    </Form>
  );
}
