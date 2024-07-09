import { Router } from "express";
import templateController from "../controller/template.controller";
const TemplateRouter = Router();

//@ts-ignore
TemplateRouter
    //@ts-ignore
    .get('/', templateController.getTemplates)
    //@ts-ignore
    .post('/', templateController.createTemplate)
    //@ts-ignore
    .delete('/:id', templateController.deleteTemplate)

export default TemplateRouter