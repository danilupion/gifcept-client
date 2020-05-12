import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { IGif } from '../../../../api/gifs';
import useScrollPosition from '../../../../hooks/useScrollPosition';
import useStores from '../../../../hooks/useStores';
import Gif from '../../common/gif';
import styles from '../../Content.module.scss';

export enum GifMode {
  all = 'all',
  byUser = 'byUser',
}

interface IGifsProps {
  mode: GifMode;
  onSetSelectedGif: (gif: IGif) => void;
}

const preloadMargin = 300;

export default observer(({ mode, onSetSelectedGif }: IGifsProps) => {
  const { gifs } = useStores();
  const scrollPosition = useScrollPosition();

  const { userId } = useParams();

  useEffect(() => {
    if (gifs.gifs.length === 0 || scrollPosition.bottom < preloadMargin) {
      gifs.getGifs();
    }
  }, [scrollPosition, gifs.gifs, gifs]);

  useEffect(() => {
    switch (mode) {
      case GifMode.byUser:
        gifs.setCurrentUserId(userId);
        break;
      case GifMode.all:
        gifs.setCurrentUserId(undefined);
        break;
    }
  }, [mode, gifs, userId]);

  return (
    <div className={styles['blocks-container']}>
      {gifs.gifs.map((g) => (
        <Gif key={g.id} gif={g} onClick={() => onSetSelectedGif(g)} />
      ))}
    </div>
  );
});
