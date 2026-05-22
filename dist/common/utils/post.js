"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = void 0;
const Post_enum_js_1 = require("../enums/Post.enum.js");
const getAvailability = (user) => {
    return [
        { availability: Post_enum_js_1.AvailabilityEnum.PUBLIC },
        { availability: Post_enum_js_1.AvailabilityEnum.ONLY_ME, createdBy: user._id },
        { availability: Post_enum_js_1.AvailabilityEnum.FRIENDS, createdBy: { $in: [user._id, ...user.friends || []] } },
        { tags: { $in: [user._id] } }
    ];
};
exports.getAvailability = getAvailability;
