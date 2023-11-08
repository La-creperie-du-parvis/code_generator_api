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

        const userIdFromToken = decodedToken.userId.id;

        res.locals.userId = userIdFromToken;

        if (req.body.userId && req.body.userId !== userIdFromToken) {
            throw "Invalid user ID";
        }

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

        const getSumOfPoints = await prisma.userPoint.findMany({
            where: {
                user_id: user.id,
            },
            select: { points: true },
            orderBy: {
                points: "desc",
            },
            take: 1,
        });

        const userApply = await prisma.userPoint.create({
            data: {
                User: { connect: { id: user.id } },
                redeemed: false,
                code: getDiscountCode,
                createdAt: getPoints.createdAt,
                expiresAt: getPoints.expiresAt,
                points: getPoints.value + getSumOfPoints[0].points,
            },
            select: {
                User: false,
                points: true,
                redeemed: true,
                code: true,
                expiresAt: true,
            },
        });

        if (userApply) {
            await prisma.adminGenerateCode.update({
                where: { code: getDiscountCode },
                data: {
                    redeemed: true,
                },
            });
        }

        res.status(201).json(userApply);
    } catch (e) {
        console.log(e);
        res.status(403).send("Discount already used");
    }
};
