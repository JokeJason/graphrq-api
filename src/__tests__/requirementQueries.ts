import { gql } from 'graphql-tag';

export const QueryRequirements = `
  query Requirements {
    requirements {
      id
      title
      description
      children {
        id
        title
      }
      parent {
        id
        title
      }
    }
  }
`;

export const CreateRequirements = gql`
  mutation CreateRequirements($input: [RequirementCreateInput!]!) {
    createRequirements(input: $input) {
      info {
        nodesCreated
      }
      requirements {
        id
        title
        description
        createdAt
        creator {
          id
          name
          email
        }
        updatedAt
        parent {
          id
          title
        }
        children {
          id
          title
        }
        tests {
          id
          name
          description
          category
          status
          createdAt
          updatedAt
          results {
            id
            passed
            details
            url
            timestamp
          }
        }
      }
    }
  }
`;

export const DeleteRequirements = gql`
  mutation DeleteRequirements {
    deleteRequirements {
      nodesDeleted
    }
  }
`;

export const UpdateRequirement = gql`
  mutation UpdateRequirements(
    $where: RequirementWhere
    $update: RequirementUpdateInput
  ) {
    updateRequirements(where: $where, update: $update) {
      requirements {
        description
        createdAt
        id
      }
    }
  }
`;

export const LinkRequirement = gql`
  mutation LinkRequirements(
    $where: RequirementWhere
    $connect: RequirementConnectInput
  ) {
    updateRequirements(where: $where, connect: $connect) {
      requirements {
        id
        description
        createdAt
        title
      }
    }
  }
`;
