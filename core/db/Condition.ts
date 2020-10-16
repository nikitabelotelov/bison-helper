export enum TConditionOperator {
  EQUALS,
  NOT_EQUALS,
  LESS_THAN,
  GREATER_THAN,
  LESS_OR_EQUALS,
  GREATER_OR_EQUALS,
  BETWEEN,
  LIKE,
  NOT_LIKE,
  IN,
  IS_NULL,
  IS_NOT_NULL,
}
type TSortDirection = 'asc' | 'desc'
export type TConditionLogic = 'and' | 'or'

export interface IConditionItemList {
  logic?: TConditionLogic
  conditions: (IConditionItem | IConditionItemList)[]
}

export interface IConditionItem {
  operator: TConditionOperator
  field: string
  value: string | number | string[] | number[]
}

export class Condition {
  protected conditionItemList?: IConditionItemList
  protected sort: { sort: string; dir: TSortDirection }[] = []
  protected offsetValue?: number
  protected limitValue?: number

  constructor(conditionItemList?: IConditionItemList, offset?: number, limit?: number, sort?: string, dir?: TSortDirection) {
    this.conditionItemList = conditionItemList

    if (sort && dir) {
      this.addSort(sort, dir)
    }

    if (offset) {
      this.offset(offset)
    }

    if (limit) {
      this.limit(limit)
    }
  }

  public addSort(sort: string, dir: TSortDirection) {
    this.sort.push({ sort, dir })
    return this
  }

  public setSort(sort: string, dir: TSortDirection) {
    this.sort = []
    return this.addSort(sort, dir)
  }

  public clearSort() {
    this.sort = []
  }

  public offset(value?: number) {
    this.offsetValue = value
    return this
  }

  public limit(value?: number) {
    this.limitValue = value
    return this
  }

  public getConditionItemList() {
    return this.conditionItemList
  }

  public getSort() {
    return this.sort
  }

  public getOffset() {
    return this.offsetValue
  }

  public getLimit() {
    return this.limitValue
  }

  public addCondition(conditionItemList: IConditionItemList, logic: TConditionLogic = 'and') {
    if (this.conditionItemList) {
      this.conditionItemList = {
        logic,
        conditions: [this.conditionItemList, conditionItemList],
      }
    } else {
      this.conditionItemList = {
        logic,
        conditions: [conditionItemList],
      }
    }
  }

  public clone() {
    const condition = new Condition(this.conditionItemList, this.offsetValue, this.limitValue)

    if (this.sort.length) {
      this.sort.forEach((s) => {
        condition.addSort(s.sort, s.dir)
      })
    }

    return condition
  }
}
