import { DeleteResult, UpdateOptions } from "mongodb";
import { ReturnsNewDoc } from "mongoose";
import { FlattenMaps, PopulateOptions, ProjectionType, QueryOptions, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
import { AnyKeys, CreateOptions, HydratedDocument, Model, QueryFilter } from "mongoose";

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

    //find
    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocument> | null>



    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true } | null | undefined
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
        options={new:true}
    }: {
        filter: QueryFilter<TRawDocument>,
      update: UpdateQuery<TRawDocument>,
      options: QueryOptions<TRawDocument> &  ReturnsNewDoc

    }):Promise<HydratedDocument<TRawDocument>|null> {

        return await this.model.findOneAndUpdate(filter, update, options)
    }


    async findByIDAndUpdate({
        _id,
        update,
        options={new:true}
    }: {
        _id: Types.ObjectId,
      update: UpdateQuery<TRawDocument>,
      options: QueryOptions<TRawDocument> &  ReturnsNewDoc

    }):Promise<HydratedDocument<TRawDocument>|null> {

        return await this.model.findByIdAndUpdate(_id, update, options)
    }


     async findOneAndDelete({
        filter,
       
    }: {
        filter: QueryFilter<TRawDocument>,
      

    }):Promise<HydratedDocument<TRawDocument>|null> {

        return await this.model.findOneAndDelete(filter)
    }



         async findByIdAndDelete({
        _id,
       
    }: {
        _id: Types.ObjectId,
      

    }):Promise<HydratedDocument<TRawDocument>|null> {

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
    }):Promise<UpdateResult> {

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
    }):Promise<UpdateResult> {

        return await this.model.updateMany(filter, update, options)
    }

    //delete
     async deleteOne({
        filter,
       
    }: {
        filter: QueryFilter<TRawDocument>,
       
    }):Promise<DeleteResult> {

        return await this.model.deleteOne(filter)
    }


     async deleteMany({
        filter,
       
    }: {
        filter: QueryFilter<TRawDocument>,
       
    }):Promise<DeleteResult> {

        return await this.model.deleteMany(filter)
    }

} 