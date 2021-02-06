import { TByte } from '../constant/type'
import { IInput } from './input'
import { IOutput } from './output' 
import { StringToByteArray, ByteArrayToString, Int64ToByteArray, IntToByteArray, ByteArrayToInt } from '../util'
import createHash from 'create-hash'

export interface ITransaction {
    lh:      TByte[]
	t:       TByte[]
	inputs:  IInput[]
	outputs: IOutput[] 
}

export class Transaction {

    static Deserialize = (serialized: TByte[]): Transaction => {
        return new Transaction(JSON.parse(ByteArrayToString(serialized)))
    }

    public tx: ITransaction
    
    constructor(tx: ITransaction) {
        this.tx = tx
    }

    Serialize = () => StringToByteArray(JSON.stringify(this.tx))

    GetTime = () => this.tx.t
    GetTimeInt = () => ByteArrayToInt(this.GetTime(), false)

    GetHash = () => StringToByteArray(createHash('sha256').update(Buffer.from(this.Serialize())).digest().toString())



    IsLugh = () => this.tx.inputs.length == 1 && this.tx.inputs[0].prev_transaction_hash.length == 0 
}
