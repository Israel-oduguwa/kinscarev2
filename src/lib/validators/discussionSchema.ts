import yup, { object, string, number, date, InferType, array } from "yup";

// title, content, userId, categories, tags
export const discussionValidator = object({
  title: string().required(),
  content: string(),
  userID: string().required(),
  categories: array().required(),
  tags: array(),
  imageUrl:string()
});

export const DiscussionPostValidator = object({
  content:string().required(),
  userID:string(),
  threadId:string().required()

})
export const CommentPostValidator = object({
  content:string().required(),
  parentId:string().required(),
  userID:string().required(),
  threadId:string().required()

})
// export const ThreadPostsValidator = object({
//     title: string().required(),
//     content: string(),
//     userId: string().required(),
//     categories: array(),
//     tags: array(),
//   });

export type CreateThreadPayload = yup.InferType<typeof discussionValidator>;
export type CreateDiscussionPostPayload = yup.InferType<typeof DiscussionPostValidator>;
export type CreateCommentPostPayload = yup.InferType<typeof CommentPostValidator>;