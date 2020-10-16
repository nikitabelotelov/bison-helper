import Knex from 'knex'
import { Condition, TConditionOperator, IConditionItem, IConditionItemList, TConditionLogic } from '../../Condition'
import { isInstanceOf } from '../../../utils/common'

interface IConditionOptions {
  limit?: number
  offset?: number
  sorts?: any[]
}

export class ConditionDbParser {
  public parse(queryBuilder: Knex.QueryBuilder, condition?: Condition): void {
    if (!condition) {
      return
    }

    const conditionItemList = condition.getConditionItemList()
    if (conditionItemList) {
      this.parseConditionItemList(queryBuilder, conditionItemList)
    }

    const options = this.options(condition)

    if (options.sorts) {
      for (const sort of options.sorts) {
        queryBuilder.orderBy(sort.sort, sort.dir)
      }
    }

    if (options.offset) {
      queryBuilder.offset(options.offset)
    }

    if (options.limit) {
      queryBuilder.limit(options.limit)
    }
  }

  protected parseConditionItemList(
    queryBuilder: Knex.QueryBuilder,
    conditionItemList: IConditionItemList,
    itemListLogic: TConditionLogic = 'and'
  ): void {
    const logic: TConditionLogic = itemListLogic || conditionItemList.logic
    if (conditionItemList) {
      if (logic === 'and') {
        queryBuilder.andWhere((query) => {
          this.parseConditions(query, conditionItemList)
        })
      }

      if (logic === 'or') {
        queryBuilder.orWhere((query) => {
          this.parseConditions(query, conditionItemList)
        })
      }
    }
  }

  protected parseConditions(queryBuilder: Knex.QueryBuilder, conditionItemList: IConditionItemList): void {
    for (const cond of conditionItemList.conditions) {
      if (isInstanceOf<IConditionItemList>(cond, 'conditions')) {
        this.parseConditionItemList(queryBuilder, cond, conditionItemList.logic)
      } else {
        this.parseCondition(queryBuilder, cond, conditionItemList.logic)
      }
    }
  }

  protected parseCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic = 'and'): void {
    switch (condition.operator) {
      case TConditionOperator.EQUALS:
        this.parseSimpleCondition(queryBuilder, '=', condition, logic)
        break
      case TConditionOperator.NOT_EQUALS:
        this.parseSimpleCondition(queryBuilder, '<>', condition, logic)
        break
      case TConditionOperator.LESS_THAN:
        this.parseSimpleCondition(queryBuilder, '<', condition, logic)
        break
      case TConditionOperator.GREATER_THAN:
        this.parseSimpleCondition(queryBuilder, '>', condition, logic)
        break
      case TConditionOperator.LESS_OR_EQUALS:
        this.parseSimpleCondition(queryBuilder, '<=', condition, logic)
        break
      case TConditionOperator.GREATER_OR_EQUALS:
        this.parseSimpleCondition(queryBuilder, '>=', condition, logic)
        break
      case TConditionOperator.BETWEEN:
        this.parseBetweenCondition(queryBuilder, condition, logic)
        break
      case TConditionOperator.LIKE:
        this.parseLikeCondition(queryBuilder, condition, logic)
        break
      case TConditionOperator.NOT_LIKE:
        this.parseNotLikeCondition(queryBuilder, condition, logic)
        break
      case TConditionOperator.IN:
        this.parseInCondition(queryBuilder, condition, logic)
        break
      case TConditionOperator.IS_NULL:
        this.parseNullCondition(queryBuilder, condition, logic)
        break
      case TConditionOperator.IS_NOT_NULL:
        this.parseIsNotNullCondition(queryBuilder, condition, logic)
        break
    }
  }

  protected parseInCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    if (Array.isArray(condition.value)) {
      if (logic === 'and') {
        queryBuilder.whereIn(condition.field, condition.value)
      } else {
        queryBuilder.orWhereIn(condition.field, condition.value)
      }
    }
  }

  protected parseLikeCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    const { value, field } = condition
    if (logic === 'and') {
      queryBuilder.andWhere(field, 'like', value)
    } else {
      queryBuilder.orWhere(field, 'like', value)
    }
  }

  protected parseNotLikeCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    const { value, field } = condition
    if (logic === 'and') {
      queryBuilder.andWhere(field, 'not like', value)
    } else {
      queryBuilder.orWhere(field, 'not like', value)
    }
  }

  protected parseBetweenCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    if (Array.isArray(condition.value)) {
      if (logic === 'and') {
        queryBuilder.andWhereBetween(condition.field, [condition.value[0], condition.value[1]])
      } else {
        queryBuilder.orWhereBetween(condition.field, [condition.value[0], condition.value[1]])
      }
    }
  }

  protected parseSimpleCondition(queryBuilder: Knex.QueryBuilder, exr: string, condition: IConditionItem, logic: TConditionLogic): void {
    if (logic === 'and') {
      queryBuilder.andWhere(condition.field, exr, condition.value)
    } else {
      queryBuilder.orWhere(condition.field, exr, condition.value)
    }
  }

  protected parseNullCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    if (logic === 'and') {
      queryBuilder.whereNull(condition.field)
    } else {
      queryBuilder.orWhereNull(condition.field)
    }
  }

  protected parseIsNotNullCondition(queryBuilder: Knex.QueryBuilder, condition: IConditionItem, logic: TConditionLogic): void {
    if (logic === 'and') {
      queryBuilder.whereNotNull(condition.field)
    } else {
      queryBuilder.orWhereNotNull(condition.field)
    }
  }

  protected options(condition: Condition): IConditionOptions {
    const result: IConditionOptions = {}

    if (condition) {
      const limit = condition.getLimit()
      if (limit) {
        result.limit = limit
        const offset = condition.getOffset()
        if (offset) {
          result.offset = offset
        }
      }

      const sorts = condition.getSort()

      if (sorts.length) {
        result.sorts = sorts
      }
    }

    return result
  }
}
