export default {
	apps: [
		{
			name: "promax-stockcard",
			script: "npm",
			args: "start",
			env: {
				NODE_ENV: "production",
				PORT: 80,
				JWT_SECRET: "2cf5083337ae0a359b5fca89b08ba6a4e86927f71aa5d6e71b49cff0b1732a19"
			},
		},
	],
};
