import { Authenticator } from "remix-auth";
import { authSessionStorage } from "./session.server";
import { GoogleStrategy } from "remix-auth-google";
import invariant from "tiny-invariant";
import { type Prisma } from "@prisma/client";
import { prisma } from "./db.server";

export interface StudentAuthInfo {
  type: "student";
  name: string;
  email: string;
}

export interface AuthInfoTeacher {
  type: "teacher";
  name: string;
  email: string;
}

export interface AuthInfoAdmin {
  type: "admin";
  name: string;
  email: string;
}

export type AuthInfo = StudentAuthInfo | AuthInfoTeacher | AuthInfoAdmin;

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
        if (process.env.DONT_CHECK_DOMAIN !== "true") {
          invariant(
            profile.emails[0].value.endsWith("@djusdstudents.org"),
            "Student email is not on djusdstudents.org"
          );
        }

        // const student = await prisma.student.findUnique({
        //   where: { email: profile.emails[0].value },
        // });

        // console.log(profile);

        return {
          type: "student",
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          // student,
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
        if (process.env.DONT_CHECK_DOMAIN !== "true") {
          invariant(
            profile.emails[0].value.endsWith("@djusd.net"),
            "Teacher email is not on djusd.net"
          );
        }

        // const teacher = await prisma.teacher.findUnique({
        //   where: { email: profile.emails[0].value },
        // });

        return {
          type: "teacher",
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          // teacher,
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

  const club = await prisma.club
    .findUnique({
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
    })
    .then((val) => {
      return val
        ? {
            ...val,
            officers: val.officers.map((officer) => officer.studentEmail),
          }
        : null;
    });
  if (!club) return false;

  // console.log(club);

  switch (user.type) {
    case "student":
      return club.officers.includes(user.email);
    case "teacher":
      return club.advisor.email === user.email;
    case "admin":
      return false;
  }
}
