import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, isNonNullType, isScalarType } from 'graphql';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLScalarType,
} from 'graphql/type/index.js';

const stringFormatDirective = (directiveName: string) => {
  const validateEmail = (email: string): boolean => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const createFormattedStringType = (type: GraphQLScalarType, format: string) =>
    new GraphQLScalarType({
      name: `${type.name}WithFormat${format}`,
      description: `A ${type.name} formatted as ${format}`,
      serialize: (value) => {
        const newValue: string = <string>type.serialize(value);
        switch (format) {
          case 'email':
            if (!validateEmail(newValue)) {
              throw new Error(`Value ${newValue} is not a valid email`);
            }
            break;
          default:
            throw new Error(`Format ${format} is not supported`);
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

  const wrapType = (
    fieldConfig: GraphQLFieldConfig<string, string> | GraphQLInputFieldConfig,
    directiveArgumentMap: Record<string, string>,
  ) => {
    if (
      isNonNullType(fieldConfig.type) &&
      isScalarType(fieldConfig.type.ofType)
    ) {
      fieldConfig.type = createFormattedStringType(
        fieldConfig.type.ofType,
        directiveArgumentMap['format'],
      );
    } else if (isScalarType(fieldConfig.type)) {
      fieldConfig.type = createFormattedStringType(
        fieldConfig.type,
        directiveArgumentMap['format'],
      );
    } else {
      throw new Error(
        `Cannot apply format directive to non-scalar type: ${fieldConfig.type}`,
      );
    }
  };

  return {
    stringFormatDirectiveTypeDefs: `directive @${directiveName}(format: String!) on FIELD_DEFINITION`,
    stringFormatDirectiveTransformer: (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.FIELD]: (fieldConfig) => {
          const formatDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (formatDirective) {
            wrapType(fieldConfig, formatDirective);
            return fieldConfig;
          }
          return fieldConfig;
        },
      });
    },
  };
};

export const {
  stringFormatDirectiveTypeDefs,
  stringFormatDirectiveTransformer,
} = stringFormatDirective('stringFormat');
