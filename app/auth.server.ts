import { Authenticator } from "remix-auth";
import { authSessionStorage } from "./session.server";
import { GoogleStrategy } from "remix-auth-google";
import invariant from "tiny-invariant";
import { type Prisma } from "@prisma/client";
import { prisma } from "./db.server";

export interface AuthInfo {
  type: "student" | "teacher" | "admin";
  email: string;
}

export let authenticator = new Authenticator<AuthInfo>(authSessionStorage);

authenticator
  .use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL: process.env.STUDENT_CALLBACK_URL!,
        hd: "djusdstudents.org",
      },
      async ({ profile }) => {
        if (!process.env.DONT_CHECK_DOMAIN!) {
          invariant(
            profile.emails[0].value.endsWith("@djusdstudents.org"),
            "Student email is not on djusdstudents.org"
          );
        }
        return {
          type: "student",
          email: profile.emails[0].value,
        };
      }
    ),
    "student"
  )
  .use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL: process.env.TEACHER_CALLBACK_URL!,
        hd: "djusd.net",
      },
      async ({ profile }) => {
        if (!process.env.DONT_CHECK_DOMAIN!) {
          invariant(
            profile.emails[0].value.endsWith("@djusd.net"),
            "Teacher email is not on djusd.net"
          );
        }
        return {
          type: "teacher",
          email: profile.emails[0].value,
        };
      }
    ),
    "teacher"
  );

export async function checkIsOfficerOrAdvisor(
  user: AuthInfo | null,
  where: Prisma.ClubWhereUniqueInput
): Promise<boolean> {
  if (!user) return false;

  const club = await prisma.club.findUnique({
    where,
    select: {
      officers: {
        select: {
          studentEmail: true,
        },
      },
      advisor: {
        select: {
          email: true,
        },
      },
    },
  });
  if (!club) return false;

  switch (user.type) {
    case "student":
      return club.officers.includes({ studentEmail: user.email });
    case "teacher":
      return club.advisor.email === user.email;
    case "admin":
      return false;
  }
}
