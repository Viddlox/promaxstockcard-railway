module.exports = {
	apps: [
		{
			name: "promax-stockcard",
			script: "npm",
			args: "start",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
				JWT_SECRET: process.env.JWT_SECRET,
			},
		},
	],
};
