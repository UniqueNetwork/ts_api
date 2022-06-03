import {ApiPromise, ISigner, ISubmittableResult, SubmittableExtrinsic} from '../types'
import {sendTransaction, signTransaction} from './extrinsicTools'

export interface ExtrinsicResultData {
  blockHash: string
  blockNumber?: number
  txIndex: number
  txHash: string
}

export interface TransactionResult {
  isSuccess: boolean
  txResult: ISubmittableResult
  extrinsicResultData: ExtrinsicResultData
}

export interface TransactionOptions {
  getBlockNumber?: boolean
  //todo: era, header, etc...
}

export abstract class Transaction<P, R extends TransactionResult = TransactionResult> {
  constructor(
    protected readonly api: ApiPromise,
    protected tx: SubmittableExtrinsic,
    protected readonly params: P,
    protected readonly options: TransactionOptions = {}
  ) {
  }

  get isSigned() {
    return this.tx.isSigned
  }

  /**
   * @ignore Unimplemented
   */
  verifySignature() {
    throw new Error('Unimplemented')
    //todo: implement
  }

  getRawTx() {
    return this.tx
  }

  async sign(signer: ISigner) {
    this.tx = await signTransaction(this.tx, signer)
    return this
  }

  async send(): Promise<TransactionResult> {
    return await this.processResult(await sendTransaction(this.tx))
  }

  async signAndSend(signer: ISigner) {
    await this.sign(signer)
    return await this.send()
  }

  protected async extractExtrinsicResultDataFromTxResult(txResult: ISubmittableResult): Promise<ExtrinsicResultData>  {
    const blockHash = txResult.status.asInBlock!.toString()

    const blockNumber: number | undefined = (this.options.getBlockNumber && !!blockHash)
      ? (await this.api.rpc.chain.getBlock(blockHash)).block.header.number.toNumber()
      : undefined

    return {
      blockHash,
      blockNumber,
      txIndex: txResult.txIndex!,
      txHash: txResult.txHash.toString()
    }
  }

  protected async processResult(txResult: ISubmittableResult): Promise<R> {
    return {
      isSuccess: true,
      txResult: txResult,
      extrinsicResultData: await this.extractExtrinsicResultDataFromTxResult(txResult)
    } as R
  }
}

export class TransactionFromRawTx extends Transaction<SubmittableExtrinsic> {
  constructor(api: ApiPromise, tx: SubmittableExtrinsic, options?: TransactionOptions) {
    super(api, tx, tx, options);
  }
}
