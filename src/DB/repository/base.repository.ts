import { DeleteResult, UpdateOptions } from "mongodb";
import { ReturnsNewDoc } from "mongoose";
import { FlattenMaps, PopulateOptions, ProjectionType, QueryOptions, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
import { AnyKeys, CreateOptions, HydratedDocument, Model, QueryFilter } from "mongoose";
import { IPaginate } from "../../common/interfaces/pagination.interface.js";

export abstract class BaseRepository<TRawDocument> {
    constructor(protected readonly model: Model<TRawDocument>) { }



    async create({
        data

    }: {
        data: AnyKeys<TRawDocument>
    }): Promise<HydratedDocument<TRawDocument>>;


    async create({
        data,
        options
    }: {
        data: AnyKeys<TRawDocument>[],
        options?: CreateOptions
    }): Promise<HydratedDocument<TRawDocument>[]>


    async create({//overloading 
        data,
        options
    }: {
        data: AnyKeys<TRawDocument>[],
        options?: CreateOptions
    }): Promise<HydratedDocument<TRawDocument>[] | HydratedDocument<TRawDocument>> {
        return await this.model.create(data as any, options)
    }


    async createOne({//overloading 
        data,
        options
    }: {
        data: AnyKeys<TRawDocument>[],
        options?: CreateOptions | undefined
    }): Promise<HydratedDocument<TRawDocument>> {
        const [doc] = await this.model.create(data as any, options);
        return doc as HydratedDocument<TRawDocument>
    }

    //insertMany
    async insertMany({
        data,

    }: {
        data: AnyKeys<TRawDocument>[],

    }): Promise<HydratedDocument<TRawDocument>[]> {
        return await this.model.insertMany(data as any) as HydratedDocument<TRawDocument>[];
    }


    //find
    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocument> | null>



    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: true } | null | undefined
    }): Promise<null | FlattenMaps<TRawDocument>>




    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined
    }): Promise<any> {
        const doc = this.model.findOne(filter, projection)

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec()

        }
        if (options?.lean) {
            doc.lean(options.lean);
            return await doc.exec()

        }
        return await doc.exec()
    }
    //find
    async find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined
    }): Promise<any> {
        const doc = this.model.find(filter, projection)

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec()

        }
        if (options?.lean) {
            doc.lean(options.lean);
            return await doc.exec()

        }
        if (options?.skip) {
            doc.skip(options.skip);
            return await doc.exec()

        }
        if (options?.limit) {
            doc.limit(options.limit);
            return await doc.exec()

        }
        return await doc.exec()
    }
    //pagination
    async Pagination({
        filter,
        projection,
        options = {},
        page = 0,
        size = 5
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument>,
        page?: number | string | undefined,
        size?: number | string | undefined
    }): Promise<IPaginate<TRawDocument>> {
        let count: number = -1
        if (Number(page) > 0) {
            page = parseInt(page as string)
            size = parseInt(size as string)
            options.skip = (page - 1) * size
            options.limit = size
            count = await this.model.countDocuments({ filter })
        
        }
        const docs = await this.find({ filter: filter || {}, projection, options })
        return {
            docs,
            ...(Number(page) > 0 ? 
            { currentPage: page,
                 size, 
                 pages: Math.ceil(count / parseInt(size as string)) } : {})
        }
    }


    //find byId

    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocument> | null>



    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true } | null | undefined
    }): Promise<null | FlattenMaps<TRawDocument>>




    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined
    }): Promise<any> {
        const doc = this.model.findById(_id, projection)

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec()

        }
        if (options?.lean) {
            doc.lean(options.lean);
            return await doc.exec()

        }
        return await doc.exec()
    }




    async findOneAndUpdate({
        filter,
        update,
        options ={returnDocument: 'after'}
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument> & ReturnsNewDoc

    }): Promise<HydratedDocument<TRawDocument> | null> {
        if(Array.isArray(update)){
            update.push({$set:{__v:{$add:["$__v",1]}}})
        return await this.model.findOneAndUpdate(filter, update, {...options,updatePipeline:true})

        }
        return await this.model.findOneAndUpdate(filter, update, {...options,$incr:{__v:1}})
    }


    async findByIDAndUpdate({
        _id,
        update,
        options = {returnDocument: 'after' }
    }: {
        _id: Types.ObjectId,
        update: UpdateQuery<TRawDocument>,
        options: QueryOptions<TRawDocument> & ReturnsNewDoc

    }): Promise<HydratedDocument<TRawDocument> | null> {

        return await this.model.findByIdAndUpdate(_id, update, options)
    }


    async findOneAndDelete({
        filter,

    }: {
        filter: QueryFilter<TRawDocument>,


    }): Promise<HydratedDocument<TRawDocument> | null> {

        return await this.model.findOneAndDelete(filter)
    }



    async findByIdAndDelete({
        _id,

    }: {
        _id: Types.ObjectId,


    }): Promise<HydratedDocument<TRawDocument> | null> {

        return await this.model.findByIdAndDelete(_id)
    }


    //update

    async updateOne({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null
    }): Promise<UpdateResult> {

        return await this.model.updateOne(filter, update, options)
    }

    async updateMany({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null
    }): Promise<UpdateResult> {

        return await this.model.updateMany(filter, update, options)
    }

    //delete
    async deleteOne({
        filter,

    }: {
        filter: QueryFilter<TRawDocument>,

    }): Promise<DeleteResult> {

        return await this.model.deleteOne(filter)
    }


    async deleteMany({
        filter,

    }: {
        filter: QueryFilter<TRawDocument>,

    }): Promise<DeleteResult> {

        return await this.model.deleteMany(filter)
    }

} 