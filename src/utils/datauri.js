export const getDataUri = (file) => {
    if (!file || !file.mimetype || !file.buffer) {
        throw new Error('Invalid file data');
    }
    const mimeTypeParts = file.mimetype.split('/');
    const extName = mimeTypeParts[1];
    const fileBase64 = file.buffer.toString('base64');

    return {
        content: `data:${file.mimetype};base64,${fileBase64}`,
        extName,
    };
};