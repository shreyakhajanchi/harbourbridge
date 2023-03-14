export default interface IColumnTabData {
  spOrder: number | string
  srcOrder: number | string
  srcColName: string
  srcDataType: string
  spColName: string
  spDataType: string | String
  spIsPk: boolean
  srcIsPk: boolean
  spIsNotNull: boolean
  srcIsNotNull: boolean
  srcColMaxLength: Number | string | undefined
  spColMaxLength: Number | string | undefined
}

export interface IIndexData {
  srcColName: string
  spColName: string | undefined
  srcDesc: boolean | undefined | string
  srcOrder: number | string
  spOrder: number | string | undefined
  spDesc: boolean | undefined | string
}
