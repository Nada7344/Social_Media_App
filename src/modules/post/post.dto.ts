import {z} from 'zod'
import { createPost, reactPost, updatePost } from './post.validation.js'

export type cratePostBodyDto =z.infer<typeof createPost.body>
export type UpdatePostBodyDto =z.infer<typeof updatePost.body>
export type UpdatePostParamsDto =z.infer<typeof updatePost.params>
export type ReactPostQueryDto =z.infer<typeof reactPost.query>
export type ReactPostParamsDto =z.infer<typeof reactPost.params>