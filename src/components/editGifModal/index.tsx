import React, { useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import { IGif, IGifPatch } from '../../api/gifs';
import { Rating } from '../../common/constants';
import HeaderButton from '../common/headerButton';
import TagsInput from '../common/tagsInput';

import styles from './EditGifModal.module.scss';

interface IEditGifModalProps {
  gif?: IGif;
  availableTags?: string[];
  onSave: (gif: IGif, updatedInfo: IGifPatch) => void;
  onClose: () => void;
}

export default ({ gif, availableTags, onClose, onSave }: IEditGifModalProps) => {
  const [description, setDescription] = useState<string>('');
  const [rating, setRating] = useState<Rating>(Rating.sfw);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setDescription(gif?.description || '');
    setRating(gif?.rating || Rating.sfw);
    setTags(gif ? [...gif.tags] : []);
  }, [gif]);

  const save = useCallback(async () => {
    if (gif) {
      try {
        setSaving(false);
        await onSave(gif, {
          description,
          rating,
          tags,
        });
        onClose();
      } catch (e) {
        setSaving(false);
      }
    }
  }, [description, rating, tags, gif, onClose, onSave]);

  return (
    <ReactModal
      isOpen={!!gif}
      className={styles['modal-wrapper']}
      overlayClassName={styles['modal-overlay-wrapper']}
      onRequestClose={onClose}
    >
      <div className={styles.topbar}>
        <div className={styles['topbar-right']}>
          <HeaderButton onClick={save} disabled={saving} icon="save" title="Save" />
          <HeaderButton onClick={onClose} disabled={saving} icon="close" title="Close" />
        </div>
      </div>
      <div className={styles['main-title']}>
        Description:{' '}
        <input type="text" value={description} onChange={(ev) => setDescription(ev.target.value)} />
        Rating{' '}
        <select value={rating} onChange={(ev) => setRating(ev.target.value as Rating)}>
          {Object.values(Rating).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className={styles['main-content']}>
        <div className={styles.main}>
          <button className={styles.gif}>
            <img src={gif && gif.animationUrlPath} alt={gif?.description} />
          </button>
        </div>
      </div>
      <div className={styles['info-wrapper']}>
        tags: <TagsInput tags={tags} onChange={setTags} suggestions={availableTags} />
      </div>
    </ReactModal>
  );
};
