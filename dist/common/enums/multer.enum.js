"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadApproachEnum = exports.StorageApproachEnum = void 0;
var StorageApproachEnum;
(function (StorageApproachEnum) {
    StorageApproachEnum[StorageApproachEnum["MEMORY"] = 0] = "MEMORY";
    StorageApproachEnum[StorageApproachEnum["DISK"] = 1] = "DISK";
})(StorageApproachEnum || (exports.StorageApproachEnum = StorageApproachEnum = {}));
var UploadApproachEnum;
(function (UploadApproachEnum) {
    UploadApproachEnum[UploadApproachEnum["LARGE"] = 0] = "LARGE";
    UploadApproachEnum[UploadApproachEnum["SMALL"] = 1] = "SMALL";
})(UploadApproachEnum || (exports.UploadApproachEnum = UploadApproachEnum = {}));
