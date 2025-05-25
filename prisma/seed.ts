import { PrismaClient } from "@prisma/client";
import {
  rand,
  randCompanyName,
  randFutureDate,
  randJobTitle,
  randNumber,
  randParagraph,
  randSkill,
  randSoonDate,
  randUser,
  toCollection,
} from "@ngneat/falso";
import RRule from "rrule";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// FIXME: ensure that club names, student emails, and teacher names are unique.
// though you will probably still get enough random data that you won't need to fix this
var seenClubNames = new Set();
const getClubName = () => {
  // console.log(seenClubNames);
  let clubName = randCompanyName();
  while (seenClubNames.has(clubName)) clubName = randCompanyName();
  seenClubNames.add(clubName);
  return clubName;
};

/**
 * Converts standard JS timestamp to timestamp for rrule.js
 * @param dt standard timestamp with correct UTC time
 * @return rrule.js timestamp with seconds since local 1970
 */
function toRRuleDateFormat(dt: Date) {
  const tzOffset = dt.getTimezoneOffset() * 60_000;
  const convertedDate = new Date(dt.getTime() + tzOffset);
  return convertedDate;
}

const getRRuleString = () => {
  return new RRule.RRule({
    tzid: "America/Los_Angeles",
    freq: rand([
      RRule.RRule.DAILY,
      RRule.RRule.WEEKLY,
      RRule.RRule.MONTHLY,
      RRule.RRule.YEARLY,
    ]),
    dtstart: toRRuleDateFormat(randSoonDate({ days: 7 })),
    interval: randNumber({ min: 1, max: 5 }),
  }).toString();
};

const ensureArray = <T>(maybeArray: T | T[]) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

const students = ensureArray(
  toCollection(
    () => {
      const person = randUser();
      return {
        email: person.email,
        name: `${person.firstName} ${person.lastName}`,
        graduation: new Date(randNumber({ min: 2023, max: 2027 }), 7),
      };
    },
    { length: 60 }
  )
);

const teachers = ensureArray(
  toCollection(
    () => {
      const person = randUser();
      return {
        email: person.email,
        name: `${person.firstName} ${person.lastName}`,
        // graduation: new Date(randNumber({ min: 2023, max: 2027 }), 7),
      };
    },
    { length: 10 }
  )
);

const fakeClubsGen = () =>
  ensureArray(
    toCollection(
      () => {
        let advisor = rand(teachers);
        let founder = rand(students);

        const seenOfficers = new Set();
        const seenMembers = new Set(); // this is here mostly because I didn't want to figure out how to do this properly

        return {
          name: getClubName(),
          description: randParagraph(),
          advisor: {
            connect: {
              // name: `${advisor.firstName} ${advisor.lastName}`,
              email: advisor.email,
            },
          },
          meetings: {create: toCollection(
            () => (
               {
                name: randSkill(),
                location: `${rand(["S", "N", "P", "L"])}-${randNumber({
                  min: 1,
                  max: 25,
                })}`,
                duration: randNumber({ min: 1800, max: 3600 * 8 }),
                schedule: {
                  rrules: ensureArray(
                    toCollection(() => getRRuleString(), {
                      length: randNumber({ min: 1, max: 5 }),
                    })
                  ),
                  rdates: randFutureDate({
                    length: randNumber({ min: 1, max: 5 }),
                  }),
                  exrules: ensureArray(
                    toCollection(() => getRRuleString(), {
                      length: randNumber({ min: 1, max: 5 }),
                    })
                  ),
                  exdates: randFutureDate({
                    length: randNumber({ min: 1, max: 5 }),
                  }),
                },
              }
            ),
            { length: randNumber({ min: 1, max: 5 }) }
          )},
          founder: {
            connect: {
              // name: `${founder.firstName} ${founder.lastName}`,
              email: founder.email,
              // graduation: randPastDate(),
            },
          },
          officers: {
            create: toCollection(
              () => {
                let officer = rand(students);
                let role = randJobTitle();

                while (seenOfficers.has(`${officer.email}-${role}`)) {
                  officer = rand(students);
                  role = randJobTitle();
                }
                seenOfficers.add(`${officer.email}-${role}`);

                return {
                  role: randJobTitle(),
                  student: {
                    connect: {
                      // name: `${officer.firstName} ${officer.lastName}`,
                      email: officer.email,
                      // graduation: randFutureDate(),
                    },
                  },
                };
              },
              { length: randNumber({ min: 2, max: 10 }) }
            ),
          },
          members: {
            create: toCollection(
              () => {
                let student = rand(students);

                while (seenMembers.has(student.email)) student = rand(students);
                seenMembers.add(student.email);

                return {
                  student: {
                    connect: {
                      // name: `${student.firstName} ${student.lastName}`,
                      email: student.email,
                      // graduation: randFutureDate(),
                    },
                  },
                };
              },
              { length: randNumber({ min: 3, max: 30 }) }
            ),
          },
        };
      },
      { length: 30 }
    )
  );

const prisma = new PrismaClient();

async function seedS3(clubs: { id: string }[]) {
  const s3Client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  await Promise.all(
    clubs.map(async (val, idx) => {
      // Add gallery images
      const galleryImages = await Promise.all(
        Array.from(
          { length: randNumber({ min: 3, max: 10 }) },
          (_, galleryIdx) =>
            fetch(
              `https://picsum.photos/seed/${val.id}-gallery${galleryIdx}/1600/1200.webp`
            )
              .then(async (resp) =>
                resp.ok && resp.body
                  ? resp
                  : await new Promise<Response>((resolve) =>
                      setTimeout(() => {
                        resolve(
                          fetch(
                            `https://picsum.photos/seed/${val.id}-gallery${galleryIdx}/1600/900.webp`
                          )
                        );
                      }, 10000)
                    )
              )
              .catch((err) => {
                console.error(`Failed to fetch gallery image`, err);
                console.log("Trying again...");
                return new Promise<Response>((resolve) =>
                  setTimeout(() => {
                    resolve(
                      fetch(
                        `https://picsum.photos/seed/${val.id}-gallery${galleryIdx}/1600/900.webp`
                      )
                    );
                  }, 10000)
                );
              })
        )
      );

      Promise.all(
        galleryImages.map(async (response, respIdx) => {
          return response.ok && response.body
            ? await s3Client.send(
                new PutObjectCommand({
                  Bucket: process.env.S3_BUCKET,
                  Key: `${val.id}/gallery/${respIdx}.webp`,
                  Body: new Uint8Array(await response.arrayBuffer()),
                  ContentType: "image/webp",
                })
              )
            : response;
        })
      ).then(
        (success) =>
          success.map((successOutput, successIdx) =>
            !(successOutput instanceof Response)
              ? console.log(
                  `Uploaded gallery image for club ${val.id} idx ${successIdx}: ETag ${successOutput.ETag}`
                )
              : console.error(
                  `Didn't upload gallery image for club ${val.id} idx ${successIdx} because of bad response from image API: status ${successOutput.status}`
                )
          ),
        (err) => {
          console.error(
            `Failed to upload gallery image for club ${val.id} because of error`,
            err
          );
        }
      );

      // Add banner image to half of the clubs
      if (idx % 2) return;

      const bannerImage = await fetch(
        `https://picsum.photos/seed/${val.id}-banner/512/128.webp`
      );
      if (!bannerImage.ok) {
        console.error(
          `Failed to fetch banner image! status: ${bannerImage.status}; id: ${val.id}`
        );
        return;
      }

      if (!bannerImage.body) {
        console.error(`Banner image body was empty! id: ${val.id}`);
        return;
      }

      const consumedBody = await bannerImage
        .arrayBuffer()
        .then((val) => new Uint8Array(val));

      // DEBUG: saasdf
      console.log("Got image blob");

      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${val.id}/banner.webp`,
        Body: consumedBody,
        ContentType: "image/webp",
        ContentLength:
          bannerImage.headers.get("content-length") != null
            ? Number(bannerImage.headers.get("content-length"))
            : undefined,
      };

      try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`File uploaded successfully. ${data.ETag}`);
      } catch (err) {
        console.error("Error uploading file:", err);
      }

      // Update prisma field
      await prisma.club.update({
        where: { id: val.id },
        data: { bannerImage: true },
      });
    })
  );
}

async function main() {
  // Add club names that are already in database to seen club names set
  (
    await prisma.club
      .findMany({ select: { name: true } })
      .then((val) => val.map((v) => v.name))
  ).map((v) => seenClubNames.add(v));

  /* for (const student of students) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: student,
      create: student,
    });
  } */
  await Promise.all(
    students.map((student) =>
      prisma.student.upsert({
        where: { email: student.email },
        update: student,
        create: student,
      })
    )
  );

  /* for (const teacher of teachers) {
    await prisma.teacher.upsert({
      where: { email: teacher.email },
      update: teacher,
      create: teacher,
    });
  } */
  await Promise.all(
    teachers.map((teacher) =>
      prisma.teacher.upsert({
        where: { email: teacher.email },
        update: teacher,
        create: teacher,
      })
    )
  );

  const fakeClubs = fakeClubsGen();
  // for (const fakeClub of fakeClubs) {
  //   await prisma.club.create({
  //     data: fakeClub,
  //   });
  // }
  const createdFakeClubs = await Promise.all(
    fakeClubs.map((fakeClub) => prisma.club.create({ data: fakeClub }))
  );

  if (process.env.SEED_S3 === "true") {
    console.log("Seeding S3...");
    await seedS3(createdFakeClubs);
  }

  // RIP for the handwritten clubs and vtubers
  /*for (const club of clubs) {
    await prisma.club.upsert({
      where: { name: club.name },
      update: club,
      create: club,
    });
  }*/
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
