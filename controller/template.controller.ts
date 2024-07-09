// import type { Response, NextFunction } from 'express'
// import { ExtendedRequest } from '../utils/middleware'
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// export const getTemplates = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
//     try {
//         const templates = await prisma.template.findMany({
//             include: {
//                 filterName: true,
//                 transitionData: true
//             }
//         })
//         res.status(200).json({ templates })
//     } catch (error) {
//         next(error)
//     }
// }

// export const createTemplate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
//     try {
//         const { soundName, description, latitude, longitude, place, filterName, transitionData} = req.body
//         const template = await prisma.template.create({
//             data: {
//                 user_id: req.user.id,
//                 soundName,
//                 description,
//                 latitude,
//                 longitude,
//                 place,
//                 filterName: {
//                     create: {
//                         name: filterName.name,
//                         t1: filterName.t1,
//                         t2: filterName.t2,
//                         t3: filterName.t3,
//                         t4: filterName.t4,
//                         t5: filterName.t5,
//                         t6: filterName.t6
//                     }
//                 },
//                 transitionData: {
//                     create: transitionData.map((td: any) => ({
//                         transitionType: td.transitionType,
//                         imageurl: td.imageurl,
//                         mediaType: td.mediaType
//                     }))
//                 },
//             },
//             include: {
//                 filterName: true,
//                 transitionData: true
//             }
//         })
//         res.status(201).json({ template })
//     } catch (error) {
//         next(error)
//     }
// }

// export const deleteTemplate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
//     try {
//         const { id } = req.params
//         await prisma.template.delete({ where: { id: Number(id) } })
//         res.status(200).json({message: "deleted"})
//     } catch (error) {
//         next(error)
//     }
// }

// const templateController = { getTemplates, createTemplate, deleteTemplate }
// export default templateController
