"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.OneUserType = exports.ProviderGQLEnumType = exports.RoleGQLEnumType = exports.GenderGQLEnumType = void 0;
const graphql_1 = require("graphql");
const user_enum_js_1 = require("../../../common/enums/user.enum.js");
exports.GenderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: user_enum_js_1.GenderEnum.MALE },
        Female: { value: user_enum_js_1.GenderEnum.FEMALE },
    }
});
exports.RoleGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        User: { value: user_enum_js_1.RoleEnum.USER },
        Admin: { value: user_enum_js_1.RoleEnum.ADMIN },
    }
});
exports.ProviderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        System: { value: user_enum_js_1.ProviderEnum.SYSTEM },
        Google: { value: user_enum_js_1.ProviderEnum.GOOGLE },
    }
});
exports.OneUserType = new graphql_1.GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        role: { type: exports.RoleGQLEnumType },
        phone: { type: graphql_1.GraphQLString },
        bio: { type: graphql_1.GraphQLString },
        DOB: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(exports.OneUserType) },
        confirmEmail: { type: graphql_1.GraphQLString },
        profileImage: { type: graphql_1.GraphQLString },
        profileCoversImage: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        password: { type: graphql_1.GraphQLString },
        gender: { type: exports.GenderGQLEnumType },
        provider: { type: exports.ProviderGQLEnumType },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        changeCredentialTime: { type: graphql_1.GraphQLString },
    }),
});
exports.profile = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "ProfileResponse",
    description: "",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneUserType }
    }
}));
