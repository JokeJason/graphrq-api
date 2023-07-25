// Queries can be obtained on GraphQL server

export const DeleteRequirements = `
  mutation DeleteRequirements {
    deleteRequirements {
      nodesDeleted
    }
  }
`;

export const QueryRequirements = `
  query Requirements {
    requirements {
      id
      title
      description
    }
  }
`;

export const DeleteUsers = `
  mutation DeleteUsers {
    deleteUsers {
      nodesDeleted
    }
  }
`;

export const QueryUsers = `
  query Users {
    users {
      id
      name
    }
  }
`;

export const CreateUser = `mutation CreateUser($input: [UserCreateInput!]!) {
  createUsers(input: $input) {
    users {
      name
    }
  }
}`;
