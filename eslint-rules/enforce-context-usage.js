module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure context providers and consumers are properly used',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const contextImports = new Map();
    const contextUsage = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value.includes('/context/')) {
          node.specifiers.forEach(specifier => {
            if (specifier.local.name.includes('Context') || 
                specifier.local.name.startsWith('use')) {
              contextImports.set(specifier.local.name, {
                source: node.source.value,
                isHook: specifier.local.name.startsWith('use')
              });
            }
          });
        }
      },

      CallExpression(node) {
        if (node.callee.type === 'Identifier' && 
            contextImports.has(node.callee.name)) {
          const contextInfo = contextImports.get(node.callee.name);
          if (contextInfo.isHook) {
            contextUsage.add(node.callee.name);
          }
        }
      },

      JSXElement(node) {
        if (node.openingElement.name.name && 
            node.openingElement.name.name.includes('Provider')) {
          const contextName = node.openingElement.name.name.replace('Provider', '');
          if (!contextImports.has(contextName)) {
            context.report({
              node,
              message: `Context provider '${node.openingElement.name.name}' used without importing corresponding context`,
            });
          }
        }
      },

      'Program:exit'() {
        contextImports.forEach((info, name) => {
          if (info.isHook && !contextUsage.has(name)) {
            context.report({
              node: context.getSourceCode().ast,
              message: `Context hook '${name}' is imported but never used`,
            });
          }
        });
      }
    };
  },
};