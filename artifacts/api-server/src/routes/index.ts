import { Router, type IRouter } from "express";
import healthRouter from "./health";
import memosRouter from "./memos";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/memos", memosRouter);

export default router;
