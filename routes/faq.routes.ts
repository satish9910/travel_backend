import { Router } from "express";
import { createFAQ, getFAQ } from "../controller/faq.controller";

const faqRouter = Router();

faqRouter.get("/", getFAQ);

faqRouter.post("/", createFAQ);

faqRouter.get("/:id", getFAQ);

export default faqRouter