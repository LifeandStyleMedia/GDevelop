// @flow
import * as React from 'react';

type Props = {
  blob: ?Blob,
  children: (blobDownloadUrl: string) => React.Node,
};

export const BlobDownloadUrlHolder = ({ blob, children }: Props) => {
  const [blobDownloadUrl, setBlobDownloadUrl] = React.useState('');
  const [currentBlob, setCurrentBlob] = React.useState<?Blob>(null);
  React.useEffect(
    () => {
      // This effect function does not look at the blobDownloadUrl, to avoid infinite loops.
      // It is only in charge of updating the Url when the blob changes.
      if (blob && blob !== currentBlob) {
        setBlobDownloadUrl(URL.createObjectURL(blob));
        setCurrentBlob(blob);
      }
    },
    [blob, currentBlob]
  );

  React.useEffect(
    () => {
      // This cleanup is called both when the component is unmounted or when an update happens.
      // This allows releasing the URL when a new one is generated.
      // See https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update
      return () => {
        if (blobDownloadUrl) {
          URL.revokeObjectURL(blobDownloadUrl);
        }
      };
    },
    [blobDownloadUrl]
  );

  return children(blobDownloadUrl);
};
