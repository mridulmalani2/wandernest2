module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Minify CSS in production for optimal file sizes
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'default',
              {
                // Optimize CSS output
                discardComments: {
                  removeAll: true,
                },
                // Normalize whitespace
                normalizeWhitespace: true,
                // Minify selectors
                minifySelectors: true,
                // Minify font values
                minifyFontValues: true,
                // Merge rules
                mergeRules: true,
                // Convert colors to shorter formats
                colormin: true,
                // Reduce calc() expressions
                calc: true,
                // Remove duplicate rules
                uniqueSelectors: true,
              },
            ],
          },
        }
      : {}),
  },
}
