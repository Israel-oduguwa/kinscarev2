"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, BadgeCheck, Clock, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MongoContext from "@/app/MongoContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";


// Define TypeScript types
interface Blog {
  _id: string;
  title: string;
  category: string;
  excerpt: string;
  featuredImage: string;
  isPublished: boolean;
  author: {
    name: string;
    email: string;
    profilePicture: string;
  };
}

export default function AdminBlogList() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingBlog, setCreatingBlog] = useState<boolean>(false);
  const [deletingBlog, setDeletingBlog] = useState<string | null>(null);
  const { userData }: any = useContext(MongoContext);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          `https://api.kinscare.org/api/v1/blogs/author/${userData.userID}`
        );
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [userData]);

  const createNewBlog = async () => {
    setCreatingBlog(true);
    try {
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/blogs/create",
        {
          title: "Untitled Blog",
          category: "",
          excerpt: "",
          featuredImage: "",
          content: "",
          htmlContent:"",
          toc:[],
          isPublished: false,
          author: {
            userID: userData.userID,
            name: `${userData.lname} ${userData.fname}`,
            email: userData.auth.email,
            profilePicture: userData.profileImage,
          },
        }
      );

      if (response.data.blog.insertedId) {
        router.push(`/admin/blog/edit/${response.data.blog.insertedId}`);
      }
    } catch (error) {
      console.error("Error creating blog:", error);
    } finally {
      setCreatingBlog(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    setDeletingBlog(blogId);
    try {
      await axios.delete(`https://api.kinscare.org/api/v1/blogs/delete/${blogId}`);
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
     
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setDeletingBlog(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={createNewBlog}
          disabled={creatingBlog}
        >
          {creatingBlog ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
          {creatingBlog ? "Creating..." : "Create Blog"}
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog: Blog) => (
            <Card key={blog._id} className="shadow-lg hover:shadow-xl transition">
              {/* Featured Image */}
              <CardHeader className="p-0">
                <Image
                  src={blog.featuredImage || "https://via.placeholder.com/400"}
                  alt={blog.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>

              {/* Blog Content */}
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2">{blog.excerpt || "No excerpt available."}</p>

                {/* Author & Status */}
                <div className="flex items-center gap-3 mt-3">
                  <Image
                    src={blog.author.profilePicture || "https://via.placeholder.com/50"}
                    alt={blog.author.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="text-sm font-medium">{blog.author.name}</p>
                    <p className="text-xs text-gray-500">{blog.author.email}</p>
                  </div>
                </div>

                {/* Published/Draft Badge */}
                <Badge
                  variant={blog.isPublished ? "default" : "secondary"}
                  className={`mt-3 ${blog.isPublished ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}
                >
                  {blog.isPublished ? (
                    <>
                      <BadgeCheck className="w-4 h-4 mr-1" /> Published
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1" /> Draft
                    </>
                  )}
                </Badge>
              </CardContent>

              {/* Edit & Delete Buttons */}
              <CardFooter className="p-4 flex ">
                <Link href={`/admin/blog/edit/${blog._id}`} className="w-1/2 mr-2">
                  <Button variant="outline" className="w-full flex items-center">
                    <FileText className="mr-2" /> Edit
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="outline"
                  className="flex items-center"
                  onClick={() => deleteBlog(blog._id)}
                  disabled={deletingBlog === blog._id}
                >
                  {deletingBlog === blog._id ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="mr-2" />
                  )}
                  
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FileText size={48} className="mx-auto text-gray-400" />
          <p className="text-gray-600 mt-2">No blogs found. Start by creating a new blog.</p>
        </div>
      )}
    </div>
  );
}
