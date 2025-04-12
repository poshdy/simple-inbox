import { db } from "./server/db";

await db.user.create({
  data: {
    emailAddress: "roshdy2810@gmail.com",
    firstName: "Mohamed",
    lastName: "Roshdy",
  },
});
console.log("done");
