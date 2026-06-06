"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postList = exports.OnePostType = exports.AvailabilityGQLEnumType = exports.LikesGQLEnumType = void 0;
const graphql_1 = require("graphql");
const Post_enum_js_1 = require("../../../common/enums/Post.enum.js");
const user_types_gql_js_1 = require("../../user/gql/user.types.gql.js");
exports.LikesGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "LikesGQLEnumType",
    values: {
        Like: { value: Post_enum_js_1.ReactEnum.LIKE },
        DisLike: { value: Post_enum_js_1.ReactEnum.DISLIK },
        Haha: { value: Post_enum_js_1.ReactEnum.HAHA },
        Love: { value: Post_enum_js_1.ReactEnum.LOVE },
        Sad: { value: Post_enum_js_1.ReactEnum.SAD },
        Angry: { value: Post_enum_js_1.ReactEnum.ANGRY },
    }
});
exports.AvailabilityGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "AvailabilityGQLEnumType",
    values: {
        Public: { value: Post_enum_js_1.AvailabilityEnum.PUBLIC },
        Friends: { value: Post_enum_js_1.AvailabilityEnum.FRIENDS },
        Only: { value: Post_enum_js_1.AvailabilityEnum.ONLY_ME },
    }
});
const ReactType = new graphql_1.GraphQLObjectType({
    name: "ReactType",
    fields: {
        react: { type: exports.LikesGQLEnumType },
        createdBy: { type: user_types_gql_js_1.OneUserType }
    }
});
exports.OnePostType = new graphql_1.GraphQLObjectType({
    name: "OnePostType",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        folderId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        likes: { type: new graphql_1.GraphQLList(ReactType) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_js_1.OneUserType) },
        availability: { type: exports.AvailabilityGQLEnumType },
        createdBy: { type: new graphql_1.GraphQLNonNull(user_types_gql_js_1.OneUserType) },
        updatedBy: { type: user_types_gql_js_1.OneUserType },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        updatedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
    }
});
exports.postList = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "PostListResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "PostPaginationResponse",
                fields: {
                    docs: { type: new graphql_1.GraphQLList(exports.OnePostType) },
                    currentPage: { type: graphql_1.GraphQLInt },
                    pages: { type: graphql_1.GraphQLInt },
                    size: { type: graphql_1.GraphQLInt },
                }
            })
        }
    }
}));
