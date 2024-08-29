import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { z } from "zod";
import { authenticator } from "~/auth.server";
import { prisma } from "~/db.server";

export const studentOnboardingFormSchema = z.object({
  name: z.string(),
  email: z.string(),
  graduation: z.number({ coerce: true }),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const rawFormData = await request.formData();
  const formData = Object.fromEntries(rawFormData);

  const result = studentOnboardingFormSchema.safeParse(formData);
  if (!result.success) {
    return json(
      { success: false, error: "Could not parse student info" },
      { status: 400 }
    );
  }
  const { name, email, graduation } = result.data;

  if (user.email !== email) {
    return json({ success: false, error: "Mismatched users" }, { status: 403 });
  }

  const existingStudent = await prisma.student.findUnique({ where: { email } });
  if (existingStudent) {
    return json(
      { success: false, error: "Student already exists" },
      { status: 409 }
    );
  }

  await prisma.student.create({
    data: { name, email, graduation: new Date(graduation, 7) },
  });
  return json({ success: true, error: null });
}

export function loader() {
  // FIXME: Actually add onboarding page
  return redirect("/clubs");
}
