import { PrismaClient } from "@prisma/client";
import {
  rand,
  randCompanyName,
  randFullName,
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
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { buffer } from "node:stream/consumers";

/*const clubs = [
  {
    name: "Lunch Reheating Club",
    description: "A community for students to reheat their lunches",
    advisor: {
      connect: {
        email: "tkiara@holoen.net"
      }
    },
    meetings: [
      {
        location: "S-09",
        frequency: FrequencyEnum.DAILY,
        interval: 2,
        startDate: "2023-09-22T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "aknox@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "fryugu@2434en.com"
        },
        {
          email: "ddropscythe@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vakuma@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aknox@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "Lunch Reheating Club"
            }
          }
        }
      ]
    }
  },
  {
    name: "Extreme Pencil Sharpening Society",
    description: "Dedicated to achieving the sharpest pencil points known to humanity",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "Library",
        frequency: FrequencyEnum.WEEKLY,
        interval: 1,
        startDate: "2023-10-05T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "mmarionette@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "syamino@2434en.com"
        },
        {
          email: "mkioran@2434en.com"
        },
        {
          email: "prainpuff@2434en.com"
        },
        {
          email: "pgurin@2434en.com"
        },
        {
          email: "ddropscythe@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ependora@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mrias@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "Extreme Pencil Sharpening Society"
            }
          }
        }
      ]
    }
  },
  {
    name: "Procrastinators Anonymous",
    description: "A club for those who never get around to doing anything",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "Coffee Shop",
        frequency: FrequencyEnum.MONTHLY,
        interval: 1,
        startDate: "2023-09-30T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "yasuma@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "ywilson@2434en.com"
        },
        {
          email: "syonaguni@2434en.com"
        },
        {
          email: "aknox@2434en.com"
        },
        {
          email: "statsuki@2434en.com"
        },
        {
          email: "lkaneshiro@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ywilson@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mrias@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "Procrastinators Anonymous"
            }
          }
        }
      ]
    }
  },
  {
    name: "International Association of Underwater Basket Weavers",
    description: "Exploring the art of basket weaving beneath the waves",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "Aquarium",
        frequency: FrequencyEnum.MONTHLY,
        interval: 2,
        startDate: "2023-10-15T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "ieveland@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "vakuma@2434en.com"
        },
        {
          email: "fovid@2434en.com"
        },
        {
          email: "vvermillion@2434en.com"
        },
        {
          email: "vbandage@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aarcadia@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ddropscythe@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ependora@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vakuma@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ependora@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "International Association of Underwater Basket Weavers"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Sock Puppet Symphony",
    description: "Exploring the fine art of sock puppetry through musical performances",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "Living Room",
        frequency: FrequencyEnum.WEEKLY,
        interval: 2,
        startDate: "2023-10-10T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "vbandage@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "uvioleta@2434en.com"
        },
        {
          email: "hhaywire@2434en.com"
        },
        {
          email: "yasuma@2434en.com"
        },
        {
          email: "aknox@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rlovelock@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ywilson@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vakuma@2434en.com",
              clubName: "The Sock Puppet Symphony"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Society of Pro Door Openers",
    description: "Dedicated to mastering the art of opening doors for others",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "Various Locations",
        frequency: FrequencyEnum.DAILY,
        interval: 1,
        startDate: "2023-09-28T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "rzotto@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "ieveland@2434en.com"
        },
        {
          email: "ktorahime@2434en.com"
        },
        {
          email: "kkaneko@2434en.com"
        },
        {
          email: "syamino@2434en.com"
        },
        {
          email: "vbringer@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ywilson@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "The Society of Pro Door Openers"
            }
          }
        }
      ]
    }
  },
  {
    name: "The International Association of Invisible Ink Enthusiasts",
    description: "Discovering the secrets of invisible ink and its applications",
    advisor: {
      connect: {
        email: "ninanis@holoen.net"
      }
    },
    meetings: [
      {
        location: "Secret Basement",
        frequency: FrequencyEnum.MONTHLY,
        interval: 2,
        startDate: "2023-11-05T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "yasuma@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "yasuma@2434en.com"
        },
        {
          email: "rzotto@2434en.com"
        },
        {
          email: "rendou@2434en.com"
        },
        {
          email: "zlanza@2434en.com"
        },
        {
          email: "mkioran@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The International Association of Invisible Ink Enthusiasts"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vakuma@2434en.com",
              clubName: "The International Association of Invisible Ink Enthusiasts"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Cactus Huggers Club",
    description: "Spreading love for prickly desert plants one hug at a time",
    advisor: {
      connect: {
        email: "cmori@holoen.net"
      }
    },
    meetings: [
      {
        location: "Desert Garden",
        frequency: FrequencyEnum.WEEKLY,
        interval: 1,
        startDate: "2023-10-02T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "mmarionette@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "rlovelock@2434en.com"
        },
        {
          email: "syamino@2434en.com"
        },
        {
          email: "syonaguni@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "The Cactus Huggers Club"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Society of Left-Handed Toasters",
    description: "Celebrating the unique challenges of left-handed toasting",
    advisor: {
      connect: {
        email: "cmori@holoen.net"
      }
    },
    meetings: [
      {
        location: "Kitchen",
        frequency: FrequencyEnum.MONTHLY,
        interval: 1,
        startDate: "2023-10-20T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "fryugu@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "mmarionette@2434en.com"
        },
        {
          email: "ieveland@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ddropscythe@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fovid@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rlovelock@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fovid@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mrias@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "nkosaka@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Society of Left-Handed Toasters"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Cloud Appreciation Society",
    description: "Staring at the sky and discussing the shapes of clouds",
    advisor: {
      connect: {
        email: "ninanis@holoen.net"
      }
    },
    meetings: [
      {
        location: "Park",
        frequency: FrequencyEnum.WEEKLY,
        interval: 2,
        startDate: "2023-09-29T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "aknox@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "uvioleta@2434en.com"
        },
        {
          email: "ealouette@2434en.com"
        },
        {
          email: "vvermillion@2434en.com"
        },
        {
          email: "lkaneshiro@2434en.com"
        },
        {
          email: "vvermillion@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "The Cloud Appreciation Society"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Association of Overthinkers Anonymous",
    description: "Thinking about thinking about thinking...and so on",
    advisor: {
      connect: {
        email: "cmori@holoen.net"
      }
    },
    meetings: [
      {
        location: "Cafeteria",
        frequency: FrequencyEnum.DAILY,
        interval: 1,
        startDate: "2023-09-25T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "vbringer@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "nkosaka@2434en.com"
        },
        {
          email: "syamino@2434en.com"
        },
        {
          email: "lkaneshiro@2434en.com"
        },
        {
          email: "ywilson@2434en.com"
        },
        {
          email: "kkaneko@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vakuma@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "kkaneko@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aknox@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Association of Overthinkers Anonymous"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Bubble Wrap Popping Society",
    description: "Popping bubble wrap to relieve stress and anxiety",
    advisor: {
      connect: {
        email: "ggura@holoen.net"
      }
    },
    meetings: [
      {
        location: "Meeting Room",
        frequency: FrequencyEnum.WEEKLY,
        interval: 1,
        startDate: "2023-10-15T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "zlanza@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "fryugu@2434en.com"
        },
        {
          email: "fryugu@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "nkosaka@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ddropscythe@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "statsuki@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aknox@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ywilson@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "prainpuff@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ependora@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Bubble Wrap Popping Society"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Association of Fictional Character Cosplay Historians",
    description: "Dressing up as historical figures dressed up as fictional characters",
    advisor: {
      connect: {
        email: "tkiara@holoen.net"
      }
    },
    meetings: [
      {
        location: "Convention Center",
        frequency: FrequencyEnum.MONTHLY,
        interval: 1,
        startDate: "2023-11-10T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "ependora@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "aarcadia@2434en.com"
        },
        {
          email: "vbandage@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aknox@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "pgurin@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "lkaneshiro@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rendou@2434en.com",
              clubName: "The Association of Fictional Character Cosplay Historians"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Society of Professional Pillow Fluffers",
    description: "Mastering the art of fluffing pillows to perfection",
    advisor: {
      connect: {
        email: "ggura@holoen.net"
      }
    },
    meetings: [
      {
        location: "Bedroom",
        frequency: FrequencyEnum.DAILY,
        interval: 2,
        startDate: "2023-09-23T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "yasuma@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "aknox@2434en.com"
        },
        {
          email: "vbandage@2434en.com"
        },
        {
          email: "ependora@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ieveland@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbringer@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ependora@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aarcadia@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Society of Professional Pillow Fluffers"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Paranormal Poetry Society",
    description: "Exploring the supernatural through rhymes and verses",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "P-10",
        frequency: FrequencyEnum.WEEKLY,
        interval: 2,
        startDate: "2023-10-08T00:00:00.000Z"
      },
      {
        location: "S-15",
        frequency: FrequencyEnum.MONTHLY,
        interval: 1,
        startDate: "2023-11-12T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "syonaguni@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "aarcadia@2434en.com"
        },
        {
          email: "rzotto@2434en.com"
        },
        {
          email: "yasuma@2434en.com"
        },
        {
          email: "rlovelock@2434en.com"
        },
        {
          email: "kkaneko@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fovid@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rlovelock@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ktorahime@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "nkosaka@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "zlanza@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "uvioleta@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rlovelock@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rlovelock@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "hhaywire@2434en.com",
              clubName: "The Paranormal Poetry Society"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Loquacious Linguists Club",
    description: "A place for word enthusiasts to wax eloquent",
    advisor: {
      connect: {
        email: "tkiara@holoen.net"
      }
    },
    meetings: [
      {
        location: "N-05",
        frequency: FrequencyEnum.WEEKLY,
        interval: 1,
        startDate: "2023-10-01T00:00:00.000Z"
      },
      {
        location: "L-18",
        frequency: FrequencyEnum.MONTHLY,
        interval: 2,
        startDate: "2023-11-15T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "vakuma@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "lkaneshiro@2434en.com"
        },
        {
          email: "hhaywire@2434en.com"
        },
        {
          email: "zlanza@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "nkosaka@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ywilson@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "yasuma@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mrias@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "aarcadia@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "sbrisko@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "ealouette@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mmarionette@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mrias@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mkioran@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "The Loquacious Linguists Club"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Secret Society of Sudoku Solvers",
    description: "Cracking secret codes and number puzzles",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "P-07",
        frequency: FrequencyEnum.WEEKLY,
        interval: 1,
        startDate: "2023-09-30T00:00:00.000Z"
      },
      {
        location: "N-10",
        frequency: FrequencyEnum.MONTHLY,
        interval: 1,
        startDate: "2023-11-05T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "nkosaka@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "ependora@2434en.com"
        },
        {
          email: "ktorahime@2434en.com"
        },
        {
          email: "fovid@2434en.com"
        },
        {
          email: "rlovelock@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "nkosaka@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vbandage@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "fryugu@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "vvermillion@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syonaguni@2434en.com",
              clubName: "The Secret Society of Sudoku Solvers"
            }
          }
        }
      ]
    }
  },
  {
    name: "The Silly Science Fiction Fanatics",
    description: "Embracing the absurdity of sci-fi in P-classrooms",
    advisor: {
      connect: {
        email: "awatson@holoen.net"
      }
    },
    meetings: [
      {
        location: "P-12",
        frequency: FrequencyEnum.WEEKLY,
        interval: 2,
        startDate: "2023-10-12T00:00:00.000Z"
      },
      {
        location: "S-08",
        frequency: FrequencyEnum.MONTHLY,
        interval: 2,
        startDate: "2023-11-20T00:00:00.000Z"
      }
    ],
    founder: {
      connect: {
        email: "kkaneko@2434en.com"
      }
    },
    officers: {
      connect: [
        {
          email: "lkaneshiro@2434en.com"
        },
        {
          email: "sbrisko@2434en.com"
        },
        {
          email: "vbringer@2434en.com"
        },
        {
          email: "ieveland@2434en.com"
        },
        {
          email: "nkosaka@2434en.com"
        }
      ]
    },
    members: {
      connectOrCreate: [
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "mparfait@2434en.com",
              clubName: "The Silly Science Fiction Fanatics"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "rzotto@2434en.com",
              clubName: "The Silly Science Fiction Fanatics"
            }
          }
        },
        {
          where: {
            studentEmail_clubName: {
              studentEmail: "syamino@2434en.com",
              clubName: "The Silly Science Fiction Fanatics"
            }
          }
        }
      ]
    }
  }
];*/

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

const getRRuleString = () => {
  return new RRule.RRule({
    freq: rand([
      RRule.RRule.DAILY,
      RRule.RRule.WEEKLY,
      RRule.RRule.MONTHLY,
      RRule.RRule.YEARLY,
    ]),
    dtstart: randSoonDate({ days: 7 }),
    interval: randNumber({ min: 1, max: 5 }),
  }).toString();
};

const ensureArray = <T>(maybeArray: T | T[]) =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

// const students = [
//   {
//     name: "Pomu Rainpuff",
//     email: "prainpuff@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Elira Pendora",
//     email: "ependora@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Finana Ryugu",
//     email: "fryugu@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Rosemi Lovelock",
//     email: "rlovelock@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Petra Gurin",
//     email: "pgurin@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Selen Tatsuki",
//     email: "statsuki@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Nina Kosaka",
//     email: "nkosaka@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Enna Alouette",
//     email: "ealouette@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Millie Parfait",
//     email: "mparfait@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Reimu Endou",
//     email: "rendou@2434en.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Mysta Rias",
//     email: "mrias@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Luca Kaneshiro",
//     email: "lkaneshiro@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Shu Yamino",
//     email: "syamino@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Ike Eveland",
//     email: "ieveland@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Vox Akuma",
//     email: "vakuma@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Yugo Asuma",
//     email: "yasuma@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Uki Violeta",
//     email: "uvioleta@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Alban Knox",
//     email: "aknox@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Fulgur Ovid",
//     email: "fovid@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Sonny Brisko",
//     email: "sbrisko@2434en.com",
//     graduation: new Date("2024-07"),
//   },
//   {
//     name: "Ren Zotto",
//     email: "rzotto@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Maria Marionette",
//     email: "mmarionette@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Kyo Kaneko",
//     email: "kkaneko@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Scarle Yonaguni",
//     email: "syonaguni@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Aster Arcadia",
//     email: "aarcadia@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Ver Vermillion",
//     email: "vvermillion@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Doppio Dropscythe",
//     email: "ddropscythe@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Meloco Kyoran",
//     email: "mkioran@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Kotoka Torahime",
//     email: "ktorahime@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Hex Haywire",
//     email: "hhaywire@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Zaion LanZa",
//     email: "zlanza@2434en.com",
//     graduation: new Date("2025-07"),
//   },
//   {
//     name: "Vezalius Bandage",
//     email: "vbandage@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Vantacrow Bringer",
//     email: "vbringer@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Yu Q. Wilson",
//     email: "ywilson@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   // Didn't realize I only had 34 students in here, but now I do because
//   // I set the upper bound on generated members to 60 for some reason
//   {
//     name: "Victoria Brightshield",
//     email: "vbrightshield@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Claude Clawmark",
//     email: "cclawmark@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Kunai Nakasato",
//     email: "knakasato@2434en.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Twisty Amanazako",
//     email: "tamanazako@2434en.com",
//     graduation: new Date("2027-07"),
//   },
//   {
//     name: "Ryoma Barrenwort",
//     email: "rbarrenwort@2434en.com",
//     graduation: new Date("2027-07"),
//   },
//   {
//     name: "Klara Charmwood",
//     email: "kcharmwood@2434en.com",
//     graduation: new Date("2027-07"),
//   },
//   {
//     name: "Ceres Fauna",
//     email: "cfauna@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Ouro Kronii",
//     email: "okronii@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Hakos Baelz",
//     email: "hbaelz@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Nanashi Mumei",
//     email: "nmumei@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Tsukumo Sana",
//     email: "tsana@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "IRyS",
//     email: "irys@holoen.com",
//     graduation: new Date("2023-07"),
//   },
//   {
//     name: "Nerissa Ravencroft",
//     email: "nravencroft@holoen.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Koseki Bijou",
//     email: "kbijoo@holoen.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Novella Shiori",
//     email: "nshiori@holoen.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Fuwawa Abyssgard",
//     email: "fabyssgard@holoen.com",
//     graduation: new Date("2026-07"),
//   },
//   {
//     name: "Mococo Abyssgard",
//     email: "mabyssgard@holoen.com",
//     graduation: new Date("2026-07"),
//   },
// ];

// const teachers = [
//   {
//     name: "Gawr Gura",
//     email: "ggura@holoen.net",
//   },
//   {
//     name: "Calliope Mori",
//     email: "cmori@holoen.net",
//   },
//   {
//     name: "Amelia Watson",
//     email: "awatson@holoen.net",
//   },
//   {
//     name: "Ninomae Ina'nis",
//     email: "ninanis@holoen.net",
//   },
//   {
//     name: "Takanashi Kiara",
//     email: "tkiara@holoen.net",
//   },
// ];

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
          meetings: toCollection(
            () => {
              return {
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
              };
            },
            { length: randNumber({ min: 1, max: 5 }) }
          ),
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
