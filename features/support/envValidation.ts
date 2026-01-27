const REQUIRED_ENV_VARS = [
    'TRELLO_API_KEY',
    'TRELLO_API_TOKEN',
    'TRELLO_API_BASE_URL'
];

export function validateEnvVars() {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
}