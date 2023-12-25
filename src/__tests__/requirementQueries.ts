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

export const DeleteRequirements = `
  mutation DeleteRequirements {
    deleteRequirements {
      nodesDeleted
    }
  }
`;

export const UpdateRequirement = `
  mutation UpdateRequirements($where: RequirementWhere, $update: RequirementUpdateInput) {
    updateRequirements(where: $where, update: $update) {
      requirements {
        description
        createdAt
        id
      }
    }
  }
`;

export const LinkRequirement = `
  mutation LinkRequirements($where: RequirementWhere, $connect: RequirementConnectInput) {
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
