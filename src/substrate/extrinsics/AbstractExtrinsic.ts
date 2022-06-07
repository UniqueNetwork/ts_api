import {ApiPromise, ISigner, ISubmittableResult, SubmittableExtrinsic} from '../../types'
import {sendTransaction, signTransaction} from '../extrinsicTools'

export interface ExtrinsicInfo {
  blockHash: string
  blockNumber?: number
  txIndex?: number
  txHash: string
}

export interface ExtrinsicResult {
  txResult: ISubmittableResult
  extrinsicInfo: ExtrinsicInfo
}

export interface ExtrinsicOptions {
  //todo: era, header, etc...
}

export interface ExtrinsicSendOptions {
  getBlockNumber?: boolean
}

export abstract class AbstractExtrinsic<P, R extends ExtrinsicResult = ExtrinsicResult> {
  constructor(
    protected readonly api: ApiPromise,
    protected tx: SubmittableExtrinsic,
    protected readonly params: P,
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

  async send(options?: ExtrinsicSendOptions): Promise<ExtrinsicResult> {
    return await this.processResult(await sendTransaction(this.tx), options)
  }

  async signAndSend(signer: ISigner, options?: ExtrinsicSendOptions) {
    await this.sign(signer)
    return await this.send(options)
  }

  protected async extractExtrinsicInfoFromTxResult(txResult: ISubmittableResult, options?: ExtrinsicSendOptions): Promise<ExtrinsicInfo>  {
    const blockHash = txResult.status.asInBlock!.toString()

    const blockNumber: number | undefined = (options?.getBlockNumber && !!blockHash)
      ? (await this.api.rpc.chain.getBlock(blockHash)).block.header.number.toNumber()
      : undefined

    return {
      blockHash,
      txHash: txResult.txHash.toString(),
      txIndex: txResult.txIndex,
      blockNumber
    }
  }

  protected async getBaseResult(txResult: ISubmittableResult, options?: ExtrinsicSendOptions): Promise<ExtrinsicResult> {
    return {
      txResult: txResult,
      extrinsicInfo: await this.extractExtrinsicInfoFromTxResult(txResult, options)
    }
  }

  protected async processResult(txResult: ISubmittableResult, options?: ExtrinsicSendOptions): Promise<R> {
    return await this.getBaseResult(txResult, options) as R
  }
}

export class TransactionFromRawTx extends AbstractExtrinsic<SubmittableExtrinsic | string> {
  constructor(api: ApiPromise, tx: SubmittableExtrinsic | string, options?: ExtrinsicOptions) {
    const transaction = typeof tx === 'string' ? api.tx(tx) : tx
    super(api, transaction, tx);
  }
}
