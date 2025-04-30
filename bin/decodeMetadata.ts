import { Deserializer } from '@jsbuffer/codec';

export default async function decodeMetadata<T>(
  targetBinaryFile: string,
  decodeFn: (buffer: Deserializer) => T | null,
  decodingFailureResult: T | null = null
): Promise<T | null> {
  const fs = await import('node:fs');

  let metadata: T | null = null;

  try {
    await fs.promises.access(
      targetBinaryFile,
      fs.constants.R_OK
    );
  } catch (err) {
    console.error(
      'File "%s" does not exist, returning `null`',
      targetBinaryFile
    );
    return null;
  }

  const contents = await fs.promises.readFile(targetBinaryFile);

  try {
    metadata = decodeFn(
      new Deserializer({
        buffer: contents,
        textDecoder: new TextDecoder()
      })
    );
  } catch (reason) {
    console.error(
      'Failed to decode "%s", it might be corrupted: %o',
      targetBinaryFile,
      reason
    );

    console.log('Setting decoding failure result for "%s": %o', targetBinaryFile, decodingFailureResult);
    metadata = decodingFailureResult;
  }

  return metadata;
}
