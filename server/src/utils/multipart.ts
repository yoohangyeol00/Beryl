export interface MultipartFile {
  fieldName: string;
  originalName: string;
  mimeType: string;
  data: Buffer;
}

const crlf = Buffer.from('\r\n');
const headerSeparator = Buffer.from('\r\n\r\n');

export function parseMultipartFile(body: Buffer, contentType: string): MultipartFile | null {
  const boundary = getBoundary(contentType);

  if (!boundary) {
    return null;
  }

  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let cursor = 0;

  while (cursor < body.length) {
    const boundaryStart = body.indexOf(boundaryBuffer, cursor);

    if (boundaryStart === -1) {
      return null;
    }

    let partStart = boundaryStart + boundaryBuffer.length;

    if (body[partStart] === 45 && body[partStart + 1] === 45) {
      return null;
    }

    if (body.subarray(partStart, partStart + crlf.length).equals(crlf)) {
      partStart += crlf.length;
    }

    const nextBoundary = body.indexOf(boundaryBuffer, partStart);

    if (nextBoundary === -1) {
      return null;
    }

    let partEnd = nextBoundary;

    if (body.subarray(partEnd - crlf.length, partEnd).equals(crlf)) {
      partEnd -= crlf.length;
    }

    const part = body.subarray(partStart, partEnd);
    const separatorIndex = part.indexOf(headerSeparator);

    if (separatorIndex !== -1) {
      const headerText = part.subarray(0, separatorIndex).toString('utf8');
      const data = part.subarray(separatorIndex + headerSeparator.length);
      const disposition = parseContentDisposition(headerText);
      const mimeType = parseContentType(headerText);

      if (disposition.filename && data.length > 0) {
        return {
          fieldName: disposition.name ?? 'file',
          originalName: disposition.filename,
          mimeType,
          data
        };
      }
    }

    cursor = nextBoundary + boundaryBuffer.length;
  }

  return null;
}

function getBoundary(contentType: string): string | null {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  return match?.[1] ?? match?.[2]?.trim() ?? null;
}

function parseContentDisposition(headerText: string): { name: string | null; filename: string | null } {
  const disposition = headerText
    .split('\r\n')
    .find((line) => line.toLowerCase().startsWith('content-disposition:'));
  const name = /name="([^"]+)"/i.exec(disposition ?? '')?.[1] ?? null;
  const filename = /filename="([^"]*)"/i.exec(disposition ?? '')?.[1] ?? null;

  return {
    name,
    filename
  };
}

function parseContentType(headerText: string): string {
  const contentType = headerText.split('\r\n').find((line) => line.toLowerCase().startsWith('content-type:'));
  return contentType?.split(':').slice(1).join(':').trim().toLowerCase() ?? 'application/octet-stream';
}
