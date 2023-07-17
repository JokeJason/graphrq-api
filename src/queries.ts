export const DeleteRQNodeDocument = `
  mutation DeleteRQNodes {
    deleteRqNodes {
      nodesDeleted
    }
  }
`;

export const QueryRQNodeDocument = `
  query QueryRQNodes {
    rqNodes {
      createdAt
      updatedAt
      description
      id
      title
    }
  }
`;
