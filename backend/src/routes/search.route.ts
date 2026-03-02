import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { asyncHandler } from "../utils/asyncHandler";

const routerSearch = Router();

routerSearch.post("/", asyncHandler(SearchController.search));

export default routerSearch;


