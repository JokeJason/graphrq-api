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

export const CreateRequirements = `
  mutation CreateRequirements($input: [RequirementCreateInput!]!) {
    createRequirements(input: $input) {
      info {
        nodesCreated
      }
    }
  }
`;
