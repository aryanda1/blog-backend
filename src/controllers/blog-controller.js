import mongoose from "mongoose";
import Blog from "../model/Blog.js";
import User from "../model/User.js";

export const getAllBlogs = async (req, res, next) => {
  let blogs;
  try {
    blogs = await Blog.find()
      .sort({ "date.created": -1 })
      .limit(10)
      .populate("user");
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: err });
  }
  if (!blogs) {
    return res.status(404).json({ message: "No Blogs Found" });
  }
  return res.status(200).json({ blogs });
};

export const addBlog = async (req, res, next) => {
  const { title, description, email } = req.body;
  const image = req.file.location;
  let existingUser;
  // if (!mongoose.isObjectIdOrHexString(user))
  //   return res.status(400).json({ message: "invalid user Id" });
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!existingUser) {
    return res.status(400).json({ message: "Unable TO FInd User." });
  }
  const blog = new Blog({
    title,
    description,
    image,
    user: existingUser._id,
  });
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await blog.save({ session });
    existingUser.blogs.push(blog);
    await existingUser.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ blog });
};

export const updateBlog = async (req, res, next) => {
  const { title, description, email } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email }).populate("blogs");
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!existingUser) {
    return res.status(400).json({ message: "Unable TO FInd User." });
  }
  const blogId = req.params.id;
  if (
    existingUser.blogs.length == 0 ||
    existingUser.blogs.find((blog) => blog.id == blogId) == null
  )
    return res.status(400).json({ message: "Unauthorized." });
  // if(existingUser)
  let blog;
  try {
    blog = await Blog.findByIdAndUpdate(blogId, {
      title,
      description,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!blog) {
    return res.status(500).json({ message: "Unable To Update The Blog" });
  }
  return res.status(200).json({ blog });
};

export const getById = async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isObjectIdOrHexString(id))
    return res.status(400).json({ message: "invalid blog Id" });
  let blog;
  try {
    blog = await Blog.findById(id);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!blog) {
    return res.status(404).json({ message: "No Blog Found" });
  }
  return res.status(200).json({ blog });
};

export const deleteBlog = async (req, res, next) => {
  const { email } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email }).populate("blogs");
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!existingUser) {
    return res.status(400).json({ message: "Unable TO Find User." });
  }
  const blogId = req.params.id;
  if (
    existingUser.blogs.length == 0 ||
    existingUser.blogs.find((blog) => blog.id == blogId) == null
  )
    return res.status(400).json({ message: "Unauthorized." });

  let blog;
  try {
    blog = await Blog.findByIdAndRemove(blogId);
    await existingUser.blogs.pull(blog);
    await existingUser.save();
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!blog) {
    return res.status(500).json({ message: "Unable To Delete" });
  }
  return res.status(200).json({ message: "Successfully Delete" });
};

export const getByUserId = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email }).populate({
      path: "blogs",
      options: {
        sort: { "date.created": -1 }, // Sort by the 'created' field in descending order
        limit: 10, // Limit the results to 10 entries
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
  if (!user) {
    return res.status(400).json({ message: "Unable TO Find User." });
  }
  return res.status(200).json({ blogs: user.blogs, name: user.name });
};
