module.exports = {
	apps: [
		{
			name: "promax-stockcard",
			script: "npm",
			env: {
				NODE_ENV: "development",
				ENV_VAR1: "environment-variable"
			},
		},
	],
};
