import * as z from "zod";
import AutoForm, { AutoFormSubmit } from "~/components/ui/auto-form";
import { useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

const formSchema = z.object({
  clubName: z.string({ required_error: "This field must be filled." }),
  description: z.string({ required_error: "This field must be filled." }),
  advisor: z
    .string({ required_error: "This field must be filled." })
    .email("Please enter a valid email."),
  founder: z
    .string({ required_error: "This field must be filled." })
    .email("Please enter a valid email."),
  officers: z.array(
    z.object({
      email: z
        .string({ required_error: "This field must be filled." })
        .email("Please enter a valid email."),
      role: z.string().min(1, { message: "This field must be filled." }),
    })
  ),
  meetings: z.array(
    z.object({
      location: z.string({ required_error: "This field must be filled." }),
      interval: z.coerce
        .number({ required_error: "This field must be filled." })
        .int("Please enter a valid integer.")
        .min(1, { message: "Please enter a positive number." }),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      startingDate: z.coerce
        .date({
          required_error: "This field must be filled.",
        })
        .transform((date) => date.getTime()),
    })
  ),
  approved: z.boolean().describe("Approved for this school year"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  let form = await request.json();

  const result = await formSchema.safeParseAsync(form);
  if (!result.success) {
    return json(result.error);
  }

  let errors: String[] = [];

  await prisma.teacher
    .findUnique({
      where: {
        email: result.data.advisor,
      },
      select: {
        id: true,
      },
    })
    .then((r) => (r ? errors.push("Advisor does not exist") : null));

  await prisma.student.findUnique({
    where: {
      email: result.data.founder,
    },
    select: {
      id: true,
    },
  }).then(r => r ? errors.push("Founder does not exist"): null);

  for (const officer of result.data.officers) {

  }

  // TODO: DEBUG
  console.log(JSON.stringify(form));
  return null;
}

export default function AdminAddClub() {
  const submit = useSubmit();
  return (
    <>
      <div className="w-full max-w-7xl m-auto space-y-4 py-4">
        <h2 className="text-3xl font-bold tracking-tight">Add a club</h2>
        <hr />
        <AutoForm
          formSchema={formSchema}
          onSubmit={(data) =>
            submit(data, { method: "POST", encType: "application/json" })
          }
        >
          <AutoFormSubmit>Submit</AutoFormSubmit>
        </AutoForm>
      </div>
    </>
  );
}
