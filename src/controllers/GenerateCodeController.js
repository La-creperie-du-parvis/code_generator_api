import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const createdAtCurrentTime = new Date();
const expiresAt = new Date(createdAtCurrentTime);
expiresAt.setDate(expiresAt.getDate() + 30);

export const codeGenerate = async (req, res) => {
    let code = "";

    const value = req.body.value;

    for (let index = 0; index < 4; index++) {
        let randomNumber = Math.floor(Math.random() * 10000);
        while (randomNumber.toString().length < 4) {
            randomNumber = "0" + randomNumber;
        }

        code = code.concat(randomNumber);

        if (index < 3) {
            code = code.concat("-");
        }
    }

    console.log(code);

    console.log(createdAtCurrentTime);
    console.log(expiresAt);

    const createDiscount = await prisma.adminGenerateCode.create({
        data: {
            redeemed: false,
            code: code,
            createdAt: createdAtCurrentTime,
            expiresAt: expiresAt,
            value: value,
            User: { connect: { id: 1 } },
        },
        select: {
            redeemed: true,
            code: true,
            value: true,
            createdAt: true,
            expiresAt: true,
        },
    });

    res.status(200).json(createDiscount);
};

export const userAddNewDiscount = async (req, res) => {
    let getDiscountCode = req.body.discount;

    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = jwt.verify(
            token,
            `${process.env.SECRET_TOKEN_USER}`
        );

        const userIdFromToken = decodedToken.userId.id; //token decodé

        res.locals.userId = userIdFromToken;

        if (req.body.userId && req.body.userId !== userIdFromToken) {
            throw "Invalid user ID";
        } else {
            const user = await prisma.user.findUnique({
                where: {
                    id: userIdFromToken,
                },
                select: {
                    id: true,
                },
            });

            const getPoints = await prisma.adminGenerateCode.findUnique({
                where: { code: getDiscountCode },
            });

            const userApply = await prisma.userPoint.create({
                data: {
                    User: { connect: { id: user.id } },
                    points: getPoints.points,
                    redeemed: false,
                    code: getDiscountCode,
                    createdAt: getPoints.createdAt,
                    expiresAt: getPoints.expiresAt,
                    points: getPoints.value,
                },
                select: {
                    User: false,
                    points: true,
                    redeemed: true,
                    code: true,
                    createdAt: true,
                    expiresAt: true,
                },
            });

            res.status(201).json(userApply);
        }
    } catch (e) {
        res.status(403).json({
            error: new Error("Invalid request!"),
        });
    }
};

// export const checkExpiredPoints = async () => {
//     /*
//      Todo :
//       Il faut faire un système de vérification avec la table adminGenerateCode et userPoint afin de savoir :
//         todo * - si le coupon est enregistré par l'utilisateur,
//         todo * - si le coupon de l'utilisateur est bientôt expiré,
//         todo * - si le coupon a déjà était utilisé côté admin,
//         todo * - si ça validité est toujours bonne coté admin.
//      */

//     /*
//       Todo :
//     Pour la vérif, prendre la date du jour, prendre la date de creation et prendre la date d'expiration voir si on est dans les clous ou non
//     todo * il faut aussi verifier si le code est renseigné chez un utilisateur si le code est renseigné chez un utilisateur, il faut le rendre  redeemed: true à true coté admin afin qu'il ne soit pas utilisé à nouveau.
//     todo * Côté user il faut verifier si le code est toujours valable si plus valable : redeemed: true
//      */

//     const expiredPoints = await prisma.adminGenerateCode.findMany({
//         where: {
//             AND: [{ expiresAt: { lt: currentTime } }, { redeemed: false }],
//         },
//     });

//     const discountUsed = await prisma.userPoint.findMany({
//         where: {
//             AND: [{ expiresAt: { lt: currentTime } }, { redeemed: false }],
//         },
//     });

//     for (const point of expiredPoints) {
//         console.log(`Point ${point.code} is expired and not redeemed.`);
//     }
// };
