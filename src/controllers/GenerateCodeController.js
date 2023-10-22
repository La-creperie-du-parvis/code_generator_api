import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export const codeGenerate = async (req, res) => {
    let code = "";

    for (let index = 0; index < 4; index++) {
        let randomNumber = Math.floor(Math.random() * 10000);
        // Tant que le nombre aléatoire n'a pas 4 chiffres, ajoute un zéro au début
        while (randomNumber.toString().length < 4) {
            randomNumber = "0" + randomNumber;
        }

        code = code.concat(randomNumber);

        if (index < 3) {
            code = code.concat("-");
        }
    }

    console.log(code);

    //     const point = await prisma.point.create({
    //         data: {
    //             user_id: 1,
    //             points: 100,
    //             redeemed: false,
    //             code: "CODE123",
    //             expiresAt: new Date(), // Set expiration date to December 31, 2023
    //         },
    //     });

    res.status(200).json(code);
};

export const checkExpiredPoints = async () => {
    /*
     Todo : 
      Il faut faire un système de vérification avec la table adminGenerateCode et userPoint afin de savoir : 
        todo * - si le coupon est enregistré par l'utilisateur,
        todo * - si le coupon de l'utilisateur est bientôt expiré,
        todo * - si le coupon a déjà était utilisé côté admin,
        todo * - si ça validité est toujours bonne coté admin.
     */

    const currentTime = new Date(); //*  Prendre la date du jour

    /*
      Todo : 
    Pour la vérif, prendre la date du jour, prendre la date de creation et prendre la date d'expiration voir si on est dans les clous ou non 
    todo * il faut aussi verifier si le code est renseigné chez un utilisateur si le code est renseigné chez un utilisateur, il faut le rendre  redeemed: true à true coté admin afin qu'il ne soit pas utilisé à nouveau. 
    todo * Côté user il faut verifier si le code est toujours valable si plus valable : redeemed: true 
     */
    const expiredPoints = await prisma.adminGenerateCode.findMany({
        where: {
            AND: [{ expiresAt: { lt: currentTime } }, { redeemed: false }],
        },
    });

    const discountUsed = await prisma.userPoint.findMany({
        where: {
            AND: [{ expiresAt: { lt: currentTime } }, { redeemed: false }],
        },
    });

    for (const point of expiredPoints) {
        console.log(`Point ${point.code} is expired and not redeemed.`);
    }
};
