import jwt from 'jsonwebtoken';
import {SchemaDirectiveVisitor} from 'graphql-tools';
import {defaultFieldResolver} from 'graphql/execution/execute';
import {JWT_SECRET} from 'config';

const userAllowed = (roles, userRole) =>
  roles.some(role => role.toUpperCase() === userRole.toUpperCase());

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const {roles} = this.args;
    const {resolve = defaultFieldResolver} = field;
    field.resolve = (...args) => {
      const {
        req: {
          headers: {authentication},
        },
      } = args[2];

      const token = authentication.split('Bearer ')[1];

      const {role} = jwt.verify(token, JWT_SECRET);

      if (!role) throw new Error('Token is not valid! Try signing in again!');

      if (userAllowed(roles, role)) return resolve.apply(this, args);

      throw new Error(
        `Users of type ${role.toUpperCase()} are not allowed to perform this operation!`
      );
    };
  }
}

export default AuthDirective;
