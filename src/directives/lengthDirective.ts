import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, isNonNullType, isScalarType } from 'graphql';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLScalarType,
} from 'graphql/type/index.js';

const lengthDirective = (directiveName: string) => {
  const createLimitedLengthType = (
    type: GraphQLScalarType,
    maxLength: number,
  ) =>
    new GraphQLScalarType({
      name: `${type.name}WithLengthAtMost${maxLength}`,
      description: `A ${type.name} with limited length`,
      serialize: (value) => {
        const newValue: string = <string>type.serialize(value);
        if (newValue.length > maxLength) {
          throw new Error(
            `Value length ${newValue.length} exceeds max length ${maxLength}`,
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

  const limitedLengthTypes = {};

  const getLimitLengthType = (
    type: GraphQLScalarType,
    maxLength: number,
  ): GraphQLScalarType => {
    if (!limitedLengthTypes[type.name]) {
      limitedLengthTypes[type.name] = {};
    }
    if (!limitedLengthTypes[type.name][maxLength]) {
      limitedLengthTypes[type.name][maxLength] = createLimitedLengthType(
        type,
        maxLength,
      );
    }
    return limitedLengthTypes[type.name][maxLength];
  };

  const wrapType = (
    fieldConfig: GraphQLFieldConfig<string, number> | GraphQLInputFieldConfig,
    directiveArgumentMap: Record<string, number>,
  ) => {
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
  };

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
};

export const { lengthDirectiveTypeDefs, lengthDirectiveTransformer } =
  lengthDirective('length');
