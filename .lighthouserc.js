module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000", "http://localhost:3000/login"],
      startServerCommand: "npm run dev",
      startServerReadyPattern: "ready",
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
      },
    },
  },
};
