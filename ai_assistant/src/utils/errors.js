export function getErrorMessage(error) {
    if (typeof error === 'string')
        return error;
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'Unknown error';
}
