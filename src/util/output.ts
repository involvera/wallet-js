export const CalculateOutputValueFromMelted = (meltedAmount: number, meltedRatio: number): BigInt => {
    return BigInt(Math.ceil(meltedAmount / meltedRatio))
}

export const CalculateOutputMeltedValue = (amount: BigInt, meltedRatio: number): number => {
    /* 
        The value owned by an UTXO can excess the 2^53 limit of JS for precision, but once divided by 2 it can't.
        So we divide the value by 2 to get the right precision, because the maximum value for an output value is between 2^53 & 2^54.
        Then we add it back at the end because the maximum value for a melted output is < 2^53
    */
    const DIVIDER = 2
    const safeNumberValueInt = BigInt(amount) / BigInt(DIVIDER)
    const nStr = amount.toString()
    const isLastNumberOdd = parseInt(nStr[nStr.length-1]) % 2 == 1
    const rest = isLastNumberOdd ? (1 * meltedRatio) : 0

    return Math.floor(((Number(safeNumberValueInt) * meltedRatio) * DIVIDER) + rest)
}