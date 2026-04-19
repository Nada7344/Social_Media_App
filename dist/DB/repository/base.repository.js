"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ //overloading 
    data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ //overloading 
    data, options }) {
        const [doc] = await this.model.create(data, options);
        return doc;
    }
    //insertMany
    async insertMany({ data, }) {
        return await this.model.insertMany(data);
    }
    async findOne({ filter, projection, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) {
            doc.populate(options.populate);
            return await doc.exec();
        }
        if (options?.lean) {
            doc.lean(options.lean);
            return await doc.exec();
        }
        return await doc.exec();
    }
    async findById({ _id, projection, options }) {
        const doc = this.model.findById(_id, projection);
        if (options?.populate) {
            doc.populate(options.populate);
            return await doc.exec();
        }
        if (options?.lean) {
            doc.lean(options.lean);
            return await doc.exec();
        }
        return await doc.exec();
    }
    async findOneAndUpdate({ filter, update, options = { new: true } }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async findByIDAndUpdate({ _id, update, options = { new: true } }) {
        return await this.model.findByIdAndUpdate(_id, update, options);
    }
    async findOneAndDelete({ filter, }) {
        return await this.model.findOneAndDelete(filter);
    }
    async findByIdAndDelete({ _id, }) {
        return await this.model.findByIdAndDelete(_id);
    }
    //update
    async updateOne({ filter, update, options }) {
        return await this.model.updateOne(filter, update, options);
    }
    async updateMany({ filter, update, options }) {
        return await this.model.updateMany(filter, update, options);
    }
    //delete
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
}
exports.BaseRepository = BaseRepository;
