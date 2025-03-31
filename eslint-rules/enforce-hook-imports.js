module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure hooks are properly imported and their values are properly destructured',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const hookImports = new Set();
    const hookUsage = new Set();
    const destructuredValues = new Map();

    return {
      ImportDeclaration(node) {
        if (node.source.value.includes('/hooks/')) {
          node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier') {
              hookImports.add(specifier.local.name);
            }
          });
        }
      },

      VariableDeclarator(node) {
        if (node.init && node.init.type === 'CallExpression' && 
            node.init.callee.type === 'Identifier' && 
            hookImports.has(node.init.callee.name)) {
          
          hookUsage.add(node.init.callee.name);

          // Track destructured values from hooks
          if (node.id.type === 'ObjectPattern') {
            node.id.properties.forEach(prop => {
              destructuredValues.set(prop.value.name, node.init.callee.name);
            });
          }
        }
      },

      'Program:exit'() {
        // Report hooks that were imported but never used
        hookImports.forEach(hook => {
          if (!hookUsage.has(hook)) {
            context.report({
              node: context.getSourceCode().ast,
              message: `Hook '${hook}' is imported but never used`,
            });
          }
        });
      }
    };
  },
};