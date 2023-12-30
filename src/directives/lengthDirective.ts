import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLSchema,
  isNonNullType,
  isScalarType,
} from 'graphql';
import { GraphQLScalarType } from 'graphql/type/index.js';

function lengthDirective(directiveName: string) {
  class LimitedLengthType extends GraphQLScalarType {
    constructor(type: GraphQLScalarType, maxLength: number) {
      super({
        name: `LimitedLength${type.name}`,
        description: `A ${type.name} with limited length`,
        serialize: (value) => {
          const newValue: string = <string>type.serialize(value);
          if (newValue.length > maxLength) {
            throw new Error(
              `expected most length: ${maxLength.toString(
                10,
              )}; given length: ${newValue.length.toString(10)}`,
            );
          }
          return newValue;
        },
        parseValue: (value) => {
          return type.parseValue(value);
        },
        parseLiteral: (ast) => {
          return type.parseLiteral(ast, {});
        },
      });
    }
  }

  const limitedLengthTypes: Record<
    string,
    Record<number, GraphQLScalarType>
  > = {};

  function getLimitLengthType(
    type: GraphQLScalarType,
    maxLength: number,
  ): GraphQLScalarType {
    const limitedLengthTypesByTypeName = limitedLengthTypes[type.name];
    if (!limitedLengthTypesByTypeName) {
      const newType = new LimitedLengthType(type, maxLength);
      limitedLengthTypes[type.name] = {};
      limitedLengthTypes[type.name][maxLength] = newType;
      return newType;
    }

    const limitedLengthType = limitedLengthTypesByTypeName[maxLength];
    if (!limitedLengthType) {
      const newType = new LimitedLengthType(type, maxLength);
      limitedLengthTypesByTypeName[maxLength] = newType;
      return newType;
    }

    throw new Error(
      `LimitedLengthType already exists for type ${
        type.name
      } and maxLength ${maxLength.toString(10)}`,
    );
  }

  function wrapType<
    F extends GraphQLFieldConfig<string, number> | GraphQLInputFieldConfig,
  >(fieldConfig: F, directiveArgumentMap: Record<string, number>): void {
    if (
      isNonNullType(fieldConfig.type) &&
      isScalarType(fieldConfig.type.ofType)
    ) {
      fieldConfig.type = getLimitLengthType(
        fieldConfig.type.ofType,
        directiveArgumentMap['max'],
      );
    } else if (isScalarType(fieldConfig.type)) {
      fieldConfig.type = getLimitLengthType(
        fieldConfig.type,
        directiveArgumentMap['max'],
      );
    } else {
      throw new Error(`Not a scalar type: ${fieldConfig.type.toString()}`);
    }
  }

  return {
    lengthDirectiveTypeDefs: `directive @${directiveName}(max: Int) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION`,
    lengthDirectiveTransformer: (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.FIELD]: (fieldConfig) => {
          const lengthDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (lengthDirective) {
            wrapType(fieldConfig, lengthDirective);
            return fieldConfig;
          }
          return fieldConfig;
        },
      });
    },
  };
}

export const { lengthDirectiveTypeDefs, lengthDirectiveTransformer } =
  lengthDirective('length');
