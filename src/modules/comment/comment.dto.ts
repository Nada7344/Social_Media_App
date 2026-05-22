import {z} from 'zod'
import { createComment, replyOnComment } from './comment.validation.js'

export type  createCommentParamsDto =z.infer<typeof createComment.params>
export type createCommentBodyDto =z.infer<typeof createComment.body>

export type  ReplyOnCommentParamsDto =z.infer<typeof replyOnComment.params>
export type ReplyOnCommentBodyDto =z.infer<typeof replyOnComment.body>