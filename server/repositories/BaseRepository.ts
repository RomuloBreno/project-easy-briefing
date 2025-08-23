import type { Collection, Db, Filter, UpdateFilter, FindOneAndUpdateOptions, FindOptions } from "mongodb";
import {ObjectId} from "mongodb";
import type { IDocument } from '../interfaces/IDocuments.ts'

// T extends Document garante que o tipo genérico T sempre terá um _id
export abstract class BaseRepository<T extends IDocument> {
  protected readonly db: Db;
  protected readonly collection: Collection<T>;
  protected readonly collectionName: string;

  constructor(db: Db, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
    this.collection = this.db.collection<T>(this.collectionName);
    this.ensureIndexes().catch(console.error);
  }

  // Método abstrato: cada repositório específico deve implementar a criação de seus próprios índices
  protected abstract ensureIndexes(): Promise<void>;

  // --- Operações de CRUD genéricas ---

  /**
   * Cria um novo documento na coleção.
   * @param data O documento a ser inserido.
   * @returns O documento inserido com o _id gerado, ou null se a inserção falhar.
   */
  async create(data: Omit<T, '_id'>): Promise<T | null> {
    const result = await this.collection.insertOne(data as any);
    if (!result.insertedId) {
      return null;
    }
    // Retorna o documento com o _id gerado
    return result as unknown as T ;
  }

  /**
   * Encontra um documento por seu _id.
   * @param id O _id do documento.
   * @returns O documento encontrado, ou null se não for encontrado.
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    // findOne já retorna T | null por padrão com a tipagem da coleção
    return this.collection.findOne({ _id: objectId } as Filter<T>) as unknown as T;
  }

  /**
   * Encontra um documento que corresponde ao filtro.
   * @param filter O filtro de busca.
   * @returns O primeiro documento encontrado, ou null se não houver correspondência.
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    // findOne já retorna T | null por padrão com a tipagem da coleção
    return this.collection.findOne(filter) as unknown as T;
  }
  
  /**
   * Encontra vários documentos que correspondem ao filtro.
   * @param filter O filtro de busca.
   * @param options Opções para a query (ex: projeção, ordenação).
   * @returns Um array de documentos encontrados.
   */
  async find(filter: Filter<T>, options?: FindOptions<T>): Promise<T[]> {
    // toArray() já retorna Promise<T[]> por padrão
    return this.collection.find(filter, options).toArray()as unknown as T[];
  }

  /**
   * Atualiza um único documento que corresponde ao filtro.
   * Retorna o documento após a atualização.
   * @param filter O filtro para encontrar o documento.
   * @param update O objeto de atualização (com operadores como $set, $inc).
   * @returns O documento atualizado, ou null se não for encontrado.
   */
  async update(filter: Filter<T>, update: UpdateFilter<T>): Promise<T | null> {
    const options: FindOneAndUpdateOptions = { returnDocument: "after" };
    const result = await this.collection.findOneAndUpdate(filter, update, options);
    // result.value é o documento retornado, já tipado como T | null
    return result as unknown as T;
  }
  
  /**
   * Deleta um único documento que corresponde ao filtro.
   * @param filter O filtro para encontrar o documento a ser deletado.
   * @returns true se o documento foi deletado, false caso contrário.
   */
  async delete(filter: Filter<T>): Promise<boolean> {
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount === 1;
  }
}