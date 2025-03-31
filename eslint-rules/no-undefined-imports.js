module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure all used values are properly imported',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    // Track all imports and their aliases
    const imports = new Map();
    // Track all destructured values
    const destructured = new Set();
    
    return {
      // Track regular imports
      ImportDeclaration(node) {
        node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportSpecifier') {
            imports.set(specifier.local.name, {
              source: node.source.value,
              imported: specifier.imported.name,
            });
          }
        });
      },

      // Track destructuring assignments
      VariableDeclarator(node) {
        if (node.id.type === 'ObjectPattern') {
          node.id.properties.forEach(prop => {
            if (prop.type === 'Property') {
              destructured.add(prop.value.name);
            }
          });
        }
      },

      // Check function calls and member expressions
      CallExpression(node) {
        if (node.callee.type === 'Identifier') {
          const name = node.callee.name;
          if (!imports.has(name) && !destructured.has(name)) {
            context.report({
              node,
              message: `'${name}' is called but not properly imported or defined`,
            });
          }
        }
      },

      // Check destructured values usage
      MemberExpression(node) {
        if (node.object.type === 'Identifier') {
          const name = node.object.name;
          if (!imports.has(name) && !destructured.has(name)) {
            context.report({
              node,
              message: `'${name}' is used but not properly imported or defined`,
            });
          }
        }
      },
    };
  },
};