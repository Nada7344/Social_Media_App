import { GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../common/enums/user.enum.js";

export const GenderGQLEnumType = new GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: GenderEnum.MALE },
        Female: { value: GenderEnum.FEMALE },

    }
})


export const RoleGQLEnumType = new GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        User: { value: RoleEnum.USER },
        Admin: { value: RoleEnum.ADMIN },

    }
})
export const ProviderGQLEnumType = new GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        System: { value: ProviderEnum.SYSTEM },
        Google: { value: ProviderEnum.GOOGLE },

    }
})

export const OneUserType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: RoleGQLEnumType },
        phone: { type: GraphQLString },
        bio: { type: GraphQLString },
        DOB: { type: GraphQLString },
        friends: { type: new GraphQLList(OneUserType) },
        confirmEmail: { type: GraphQLString },
        profileImage: { type: GraphQLString },
        profileCoversImage: { type: new GraphQLList(GraphQLString) },
        password: { type: GraphQLString },
        gender: { type: GenderGQLEnumType },
        provider: { type: ProviderGQLEnumType },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        changeCredentialTime: { type: GraphQLString },

    }),
})


export const profile = new GraphQLNonNull(new GraphQLObjectType({
    name: "ProfileResponse",
    description: "",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneUserType }
    }
}))