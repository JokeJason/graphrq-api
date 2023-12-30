import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  defaultFieldResolver,
  GraphQLFieldConfig,
  GraphQLSchema,
} from 'graphql';

const upperDirective = (
  directiveName: string,
): {
  upperDirectiveTypeDefs: string;
  upperDirectiveTransformer: (schema: GraphQLSchema) => GraphQLSchema;
} => {
  return {
    upperDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,
    upperDirectiveTransformer: (schema: GraphQLSchema): GraphQLSchema => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (
          fieldConfig: GraphQLFieldConfig<string, string>,
        ) => {
          const fieldDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (fieldDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = async (
              source,
              args,
              context,
              info,
            ): Promise<string> => {
              const result: string = <string>(
                await resolve(source, args, context, info)
              );
              if (typeof result === 'string') {
                return result.toUpperCase();
              }
              return result;
            };
          }
          return fieldConfig;
        },
      });
    },
  };
};

export const {
  upperDirectiveTypeDefs,
  upperDirectiveTransformer,
}: {
  upperDirectiveTypeDefs: string;
  upperDirectiveTransformer: (schema: GraphQLSchema) => GraphQLSchema;
} = upperDirective('uppercase');
