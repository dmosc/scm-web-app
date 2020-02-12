/* eslint-disable no-param-reassign */
import { SchemaDirectiveVisitor } from 'graphql-tools';

const userAllowed = (roles, userRole) =>
  roles.some(role => role.toUpperCase() === userRole.toUpperCase());

const overrideWith = (resolver, roles, _, args, ctx) => {
  const {
    req: { userRequesting }
  } = ctx;

  if (!userRequesting || !userRequesting.role)
    throw new Error('Token is not valid! Try signing in again!');

  if (userAllowed(roles, userRequesting.role)) {
    return resolver.apply(this, [_, args, ctx]);
  }

  throw new Error(
    `Users of type ${userRequesting.role.toUpperCase()} are not allowed to perform this operation!`
  );
};

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { roles } = this.args;
    // Subscriptions doesn't have a resolve property on field definition
    // so, it is needed to validet both resolve and subscribe
    const { resolve, subscribe } = field;

    if (resolve) {
      field.resolve = (_, args, ctx) => overrideWith(resolve, roles, _, args, ctx);
    }

    if (subscribe) {
      field.subscribe = (_, args, ctx) => overrideWith(subscribe, roles, _, args, ctx);
    }
  }
}

export default AuthDirective;
