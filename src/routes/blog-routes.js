import express from "express";
import {
  addBlog,
  deleteBlog,
  getAllBlogs,
  getById,
  getByUserId,
  updateBlog,
} from "../controllers/blog-controller.js";
import jwtAuth from "../middlewares/jwtAuth.js";
const blogRouter = express.Router();

blogRouter.get("/", getAllBlogs);
blogRouter.post("/add", jwtAuth, addBlog);
blogRouter.put("/update/:id", jwtAuth, updateBlog);
blogRouter.get("/user", jwtAuth, getByUserId);
blogRouter.get("/:id", getById);
blogRouter.delete("/:id", jwtAuth, deleteBlog);

export default blogRouter;
