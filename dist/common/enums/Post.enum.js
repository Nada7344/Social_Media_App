"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactEnum = exports.AvailabilityEnum = void 0;
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum[AvailabilityEnum["PUBLIC"] = 0] = "PUBLIC";
    AvailabilityEnum[AvailabilityEnum["FRIENDS"] = 1] = "FRIENDS";
    AvailabilityEnum[AvailabilityEnum["ONLY_ME"] = 2] = "ONLY_ME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var ReactEnum;
(function (ReactEnum) {
    ReactEnum[ReactEnum["DISLIK"] = 0] = "DISLIK";
    ReactEnum[ReactEnum["LIKE"] = 1] = "LIKE";
    ReactEnum[ReactEnum["LOVE"] = 2] = "LOVE";
    ReactEnum[ReactEnum["HAHA"] = 3] = "HAHA";
    ReactEnum[ReactEnum["SAD"] = 4] = "SAD";
    ReactEnum[ReactEnum["ANGRY"] = 5] = "ANGRY";
})(ReactEnum || (exports.ReactEnum = ReactEnum = {}));
